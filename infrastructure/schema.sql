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
