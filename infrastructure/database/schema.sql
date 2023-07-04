create sequence complain_id_seq
    as integer;

alter sequence complain_id_seq owner to postgres;


create type def_row as
(
    content varchar,
    example varchar
);

alter type def_row owner to postgres;

create table if not exists term
(
    id         serial
        constraint term_id_pk
            primary key,
    name       varchar(300) not null
        constraint valid_name
            check (length(TRIM(BOTH FROM name)) >= 2),
    created_at timestamp default now(),
    user_id    uuid
);

alter table term
    owner to postgres;


create unique index if not exists unique_term
    on term (lower(name::text));


create table if not exists user_profile
(
    user_id uuid                                  not null
        constraint user_profile_user_id_pk
            primary key
        constraint user_fk
            references auth.users
            on delete cascade,
    name    varchar default ''::character varying not null
);

alter table user_profile
    owner to postgres;

create table if not exists definition
(
    id         serial
        constraint definition_id_pk
            primary key,
    content    varchar(1000)                               not null,
    term_id    integer                                     not null
        constraint definition_fk
            references term,
    example    varchar(1000) default ''::character varying not null,
    created_at timestamp     default now()                 not null,
    user_id    uuid                                        not null
        constraint user_fk
            references user_profile,
    hidden_at  timestamp
);

alter table definition
    owner to postgres;


create policy update_user_definition on definition
    as permissive
    for update
    using (user_id = auth.uid())
    with check (user_id = auth.uid());


create table if not exists votes
(
    id            serial
        constraint votes_id_pk
            primary key,
    definition_id integer      not null
        constraint definition_fk
            references definition,
    type          varchar(100) not null
        constraint vote_types
            check ((type)::text = ANY
                   (ARRAY [('upvote'::character varying)::text, ('downvote'::character varying)::text])),
    user_id       uuid         not null
        constraint user_fk
            references auth.users,
    constraint vote_per_user_def
        unique (definition_id, user_id)
);

alter table votes
    owner to postgres;


create table if not exists complaint
(
    id               integer   default nextval('complain_id_seq'::regclass) not null
        constraint complain_id_pk
            primary key,
    definition_id    integer                                                not null
        constraint definition_fk
            references definition,
    user_id          uuid                                                   not null
        constraint user_fk
            references user_profile,
    reason           varchar   default ''::character varying                not null,
    created_at       timestamp default now()                                not null,
    resolved_at      timestamp,
    resolved_by      uuid
        constraint staff_fk
            references user_profile,
    comment          varchar   default ''::character varying                not null,
    resolved_comment varchar   default ''::character varying                not null,
    resolved_status  varchar   default 'created'::character varying         not null
);

alter table complaint
    owner to postgres;

alter sequence complain_id_seq owned by complaint.id;

create policy "Enable read access for all users" on complaint
    as permissive
    for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Enable insert for authenticated users only" on complaint
    as permissive
    for insert
    to authenticated
    with check (auth.uid() = user_id);

create table if not exists tag
(
    id   serial
        constraint tag_id_pk
            primary key,
    name varchar not null
        constraint uniq_name
            unique
);

alter table tag
    owner to postgres;


create unique index if not exists tag_name_uindex
    on tag (name);


create table if not exists definition_tag
(
    definition_id integer not null
        constraint definition_fk
            references definition,
    tag_id        integer not null
        constraint tag_fk
            references tag,
    id            serial,
    constraint definition_tag_definition_id_tag_id_id_pk
        primary key (definition_id, tag_id, id)
);

alter table definition_tag
    owner to postgres;


create policy "Enable insert for authenticated users only" on definition_tag
    as permissive
    for insert
    to authenticated
    with check (true);


create or replace view vote_results(upvotes, downvotes, is_upvoted, is_downvoted, definition_id) as
SELECT count(1) FILTER (WHERE votes.type::text = 'upvote'::text)                                         AS upvotes,
        count(1) FILTER (WHERE votes.type::text = 'downvote'::text)                                          AS downvotes,
            count(1) FILTER (WHERE votes.user_id = auth.uid() AND votes.type::text = 'upvote'::text) > 0   AS is_upvoted,
            count(1) FILTER (WHERE votes.user_id = auth.uid() AND votes.type::text = 'downvote'::text) >
            0                                                                                              AS is_downvoted,
    votes.definition_id
FROM votes
GROUP BY votes.definition_id;

alter table vote_results
    owner to postgres;


create or replace function handle_new_user() returns trigger
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

alter function handle_new_user() owner to postgres;


create or replace function add_complaint(definition_id integer, reason character varying, comment character varying) returns integer
    language sql
as
$$insert into complaint (definition_id, user_id, reason, comment)
  select definition_id, auth.uid(), reason, comment
  returning id;
$$;

alter function add_complaint(integer, varchar, varchar) owner to postgres;


create or replace function add_term(term_name character varying, definition character varying, example character varying, tags character varying[]) returns integer
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
            SELECT DISTINCT definition_id, tag_id from select_tag
    )
SELECT id FROM result_term;
$$;

alter function add_term(varchar, varchar, varchar, character varying[]) owner to postgres;


create or replace function handle_user_name() returns trigger
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

alter function handle_user_name() owner to postgres;


create or replace function edit_term(definition_id integer, definition character varying, example character varying, tags character varying[]) returns integer
    language sql
as
$$
DELETE FROM definition_tag as dt WHERE dt.definition_id = edit_term.definition_id;

with list_tags as ( SELECT tag FROM unnest(tags) AS tag)
INSERT INTO tag (name) (SELECT tag from list_tags) on conflict do nothing returning id as tag_id;

INSERT INTO definition_tag(definition_id, tag_id)
SELECT edit_term.definition_id, id as tag_id FROM tag WHERE name IN (SELECT tag FROM unnest(tags) AS tag);

UPDATE definition SET content = edit_term.definition, example = edit_term.example WHERE id = definition_id;
SELECT term_id FROM definition WHERE id = edit_term.definition_id;
$$;

alter function edit_term(integer, varchar, varchar, character varying[]) owner to postgres;

create or replace function update_user_name() returns trigger
    security definer
    SET search_path = public
    language plpgsql
as
$$
begin
    UPDATE user_profile SET name = new.raw_user_meta_data->>'name' WHERE user_id = new.id;

    return new;
end;
$$;

alter function update_user_name() owner to postgres;


create or replace function handle_after_user_update() returns trigger
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

alter function handle_after_user_update() owner to postgres;


