create function add_term(term_name character varying, definition character varying, example character varying, tags character varying[]) returns integer
    language sql
    as
$$
with insert_term as (
    insert into term(name, user_id)
        select term_name,
            auth.uid()
        where not exists(
          select 1 from term where lower(name) = lower(term_name)
            ) returning id
),
    result_term as (
        SELECT id FROM insert_term
        UNION
        SELECT id FROM term WHERE lower(name) = lower(term_name)
    ),
    insert_def as (
        INSERT INTO definition(content, term_id, user_id, example)
            VALUES (definition,
                (SELECT id FROM result_term),
                auth.uid(),
                example)
            returning id
    ),
    insert_tag as (
        insert into tag(name) SELECT n FROM unnest(tags) AS n ON CONFLICT DO NOTHING RETURNING id as tag_id
    ),
    select_tag as (
        SELECT (select id from insert_def) as definition_id, tag_id from insert_tag
        UNION
        SELECT (select id from insert_def) as definition_id, id as tag_id from tag WHERE name in (SELECT n FROM unnest(tags) as n)
    ),
    insert_dt as (
        INSERT INTO definition_tag(definition_id, tag_id)
                    SELECT definition_id, tag_id from select_tag
    )
SELECT id FROM result_term;
$$;


drop trigger if exists on_auth_user_created ON auth.users;

create or replace function public.handle_new_user() returns trigger
    security definer
    SET search_path = public
    language plpgsql
as
$$
begin
insert into public."user_profile" (user_id, name)
values (new.id, coalesce(new.raw_user_meta_data ->> 'username', new.raw_user_meta_data ->> 'name'));

UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('username', coalesce(new.raw_user_meta_data ->> 'username', new.raw_user_meta_data ->> 'name'))
WHERE id = new.id;

return new;
end;
$$;

alter function public.handle_new_user() owner to postgres;

grant execute on function public.handle_new_user() to anon;

grant execute on function public.handle_new_user() to authenticated;

grant execute on function public.handle_new_user() to service_role;


create trigger on_auth_user_created
    after insert
    on auth.users
    for each row
    execute procedure public.handle_new_user();

--------------
drop trigger if exists on_user_update on auth.users;

create or replace function public.handle_user_name() returns trigger
    security definer
    SET search_path = public
    language plpgsql
as
$$
begin
    if (not (new.raw_user_meta_data ? 'username')) then
        new.raw_user_meta_data := new.raw_user_meta_data || jsonb_build_object('username', old.raw_user_meta_data->>'username');
end if;

return new;
end;
$$;

alter function public.handle_user_name() owner to postgres;

grant execute on function public.handle_user_name() to anon;

grant execute on function public.handle_user_name() to authenticated;

grant execute on function public.handle_user_name() to service_role;

create trigger on_user_update
    before update
    on auth.users
    for each row
    execute procedure public.handle_user_name();


drop trigger if exists after_user_update on auth.users;

create or replace function public.handle_after_user_update() returns trigger
    security definer
    SET search_path = public
    language plpgsql
as
$$
begin
UPDATE user_profile
SET name = new.raw_user_meta_data ->> 'username'
WHERE user_id = new.id AND (new.raw_user_meta_data ->> 'username') is not null;

return new;
end;
$$;

alter function public.handle_after_user_update() owner to postgres;

grant execute on function public.handle_after_user_update() to anon;

grant execute on function public.handle_after_user_update() to authenticated;

grant execute on function public.handle_after_user_update() to service_role;

create trigger after_user_update
    after update
    on auth.users
    for each row
    execute procedure public.handle_after_user_update();



create or replace function edit_term(definition_id integer, definition character varying, example character varying, tags character varying[]) returns integer
    language sql
as
$$
DELETE
FROM definition_tag as dt
WHERE dt.definition_id = edit_term.definition_id;
with list_tags as (
    SELECT tag
    FROM unnest(tags) AS tag
),
    insert_tag as (INSERT INTO tag (name) (SELECT tag from list_tags) on conflict do nothing returning id as tag_id),
    select_tag as (
SELECT edit_term.definition_id,
    tag_id
from insert_tag
UNION
SELECT edit_term.definition_id, id as tag_id from tag WHERE name IN (SELECT tag from list_tags)
    )
INSERT INTO definition_tag(definition_id, tag_id)
SELECT definition_id, tag_id from select_tag;
update definition SET content = edit_term.definition, example = edit_term.example WHERE id = definition_id;
SELECT term_id FROM definition WHERE id = edit_term.definition_id;
$$;

alter function edit_term(integer, varchar, varchar, character varying[]) owner to postgres;

grant execute on function edit_term(integer, varchar, varchar, character varying[]) to anon;

grant execute on function edit_term(integer, varchar, varchar, character varying[]) to authenticated;

grant execute on function edit_term(integer, varchar, varchar, character varying[]) to service_role;
