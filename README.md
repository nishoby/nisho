### НІШО

**НІШО** - гэта адкрыты анлайн слоўнік сучаснага беларускага слэнга, дзе самі носьбіты дадаюць і галасуюць за словы.

Слэнг можа быць прафесійны, гарадскі, узроставы, рэгіянальны, сельскі, субкультурны, наогул, любы, якому вы лічыце варта быць у беларускай мове. 
Таксама можна дадаваць ужо знаёмыя словы, якія ў сучасным кантэксце набываюць новыя сэнсы.


### Sitemap

https://liuzhenglai.com/post/5d45516ea1927309ee55e009

### Каго шукаем

Frontend: VUE3

### Deployment

To run the application locally, you can:

- For frontend application:
  - Fork this repos to your github account.
  - Clone this repos use comand `git clone ` on your desktop.
  - Check your node version using command `node -v`. they shoud be `>18.16.1`
    - If you use another version you can instal `nvm` package.
  - Check if you have `yarn` installed using command `yarn --version`
    - if not use command `npm install --global yarn`
  - After clone open terminal in your directory
  - Install npm pakages using `yarn install` [It the same like `npm install`, you can use this command also]
  - Before run frontend application using `npm run dev` you should take care of backend.

- For deployment backend you have 2 options. It depends on: do you know what is `doker compouse` or not?

  1. If you want to use docker:
    - use commands below
      ```shell
        # Get the code
        git clone --depth 1 https://github.com/supabase/supabase

        # Go to the docker folder
        cd supabase/docker

        # Copy the fake env vars
        cp .env.example .env

        # Start
        docker compose up
      ```
    - If you have `level=warning msg="The \"MFA_ENABLED\" variable is not set. Defaulting to a blank string.` error than add `MFA_ENABLED=""` string to `.env` your file.
    - if you have `error during connect: this error may indicate that the docker daemon is not running` error than run `Docker desctop` if you use Windowwws.
    - If all good
    - Open `http://localhost:3000/projects`
    - Open `SQL Editor` and pick `SQL Query`

      url:
      `http://localhost:3000/project/default/sql/1`
    - Copy into `Request area` all from `/nisho/infrastructure/database/schema.sql` file.
    - Press `Run` button.
      - if you have some issues just remove relative part of sql request from `Request area` and press `Run` button again.
    - After it copy into `Request area` all from `/nisho/infrastructure/database/functions.sql` file.
      - if you have some issues like
      `function "add_term" already exists with same argument types` just remove relative part like
      ```
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
                            SELECT distinct definition_id, tag_id from select_tag
            )
        SELECT id FROM result_term;
        $$;

      ```
       of sql request from `Request area` and press `Run` button again.
    - You should get recived `Success. No rows returned`
    - Add `ANON_KEY` from `/supabase/docker/.env` to `VITE_SUPABASE_KEY` into `/nisho/.env`.
    - Add `VITE_SUPABASE_URL=http://localhost:8000` also into `/nisho/.env`.
    - And go down to the point "Finnaly run `npm run dev`" below.

  2. If you don't want to use docker you can use supabase cloud:
    - Create account at `https://supabase.com/`
    - Create a `nisho` project inside.
    - Open `Project Setting` on `API` tab

      example url:
      `https://supabase.com/dashboard/project/{your project_id}/settings/api`
    - Add `Project URL` to `VITE_SUPABASE_URL` into your `.env` file.
    - Add `Project API keys [anon, public]` to `VITE_SUPABASE_KEY`.
    - All of all open `SQL Editor` and pick `+ New query`

      example url:
      `https://supabase.com/dashboard/project/{your project_id}/sql`
    - Copy into `Request area` all from `/nisho/infrastructure/database/schema.sql` file.
    - Press `Run` button.
      - if you have some issues just remove relative part of sql request from `Request area` and press `Run` button again.
    - After it copy into `Request area` all from `/nisho/infrastructure/database/functions.sql` file.
      - if you have some issues just remove relative part of sql request from `Request area` and press `Run` button again.

- Finnaly run `npm run dev`
- Open frontend app `by default: http://localhost:5173/`
- дальше при использовании докера я получил ничего



