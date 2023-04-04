create function add_term(term_name character varying, definition character varying,
                         example character varying) returns integer
    language sql as
$$
insert into term (name, user_id)
select term_name,
    auth.uid() where not exists (
  select 1 from term where lower(name) = lower(term_name)
);
INSERT INTO definition (content, term_id, user_id, example)
SELECT definition,
    id as term_id,
    auth.uid(),
    example
FROM term
where lower(name) = lower(term_name) returning term_id
$$;


drop trigger on_auth_user_created ON auth.users;

create or replace function handle_new_user() returns trigger
    security definer
    SET search_path = public
    language plpgsql
as
$$
begin
insert into public."user_profile" (user_id, email, name)
values (new.id, new.email, new.raw_user_meta_data ->> 'name');

UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('login', coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'login'))
WHERE id = new.id;

return new;
end;
$$;

alter function handle_new_user() owner to postgres;

grant execute on function handle_new_user() to anon;

grant execute on function handle_new_user() to authenticated;

grant execute on function handle_new_user() to service_role;

create trigger on_auth_user_created
    after insert
    on auth.users
    for each row
    execute procedure handle_new_user();

drop trigger if exists on_user_update on auth.users;

create or replace function handle_user_name() returns trigger
    security definer
    SET search_path = public
    language plpgsql
as
$$
begin
UPDATE user_profile
SET name = new.raw_user_meta_data ->> 'name'
WHERE user_id = new.id AND (new.raw_user_meta_data ->> 'name') is not null;

return new;
end;
$$;

alter function handle_user_name() owner to postgres;

grant execute on function handle_user_name() to anon;

grant execute on function handle_user_name() to authenticated;

grant execute on function handle_user_name() to service_role;


create trigger on_user_update
    after update
    on auth.users
    for each row
    execute procedure handle_user_name();

create function edit_term(definition_id int, definition varchar, example character varying,
                          tags          character varying[]) returns integer
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
    insert_tag as (INSERT INTO tag (name) (SELECT tag from list_tags) on conflict do nothing returning id as tag_id)
INSERT INTO definition_tag(definition_id, tag_id)
SELECT edit_term.definition_id,
    tag_id
from insert_tag;
update definition SET content = edit_term.definition, example = edit_term.example WHERE id = definition_id;
SELECT term_id FROM definition WHERE id = edit_term.definition_id;
$$;
