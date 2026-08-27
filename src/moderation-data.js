import { supabase } from './supabase.js';

// Збірае чаргу мадэрацыі з базы.
//
// Картка тут — гэта слова, а не скарга: калі трое паскардзіліся на адно
// тлумачэнне, мадэратар мусіць разбіраць яго адзін раз, а не тры. Таму
// групуем скаргі па `definition_id`.
//
// Запытаў наўмысна некалькі простых, а не адзін складаны. У `complaint` два
// розныя шляхі да `user_profile` — `user_fk` (хто паскардзіўся) і `staff_fk`
// (хто разгледзеў), — і ўбудаваны выбар імя адтуль не ведае, які з іх браць.
// Прасцей забраць імёны асобным спісам і злучыць у браўзеры.

// PostgREST аддае абмежаваную колькасць радкоў за раз, таму тое, што можа
// вырасці (усе тлумачэнні слоўніка), бяром старонкамі. Той жа спосаб, што ў
// Terms.vue пры зборы тэгаў.
const PAGE = 1000;

async function fetchAll(make) {
    const rows = [];

    for (let from = 0; ; from += PAGE) {
        const { data, error } = await make().range(from, from + PAGE - 1);

        if (error) {
            throw error;
        }

        rows.push(...data);

        if (data.length < PAGE) {
            return rows;
        }
    }
}

const unique = (list) => [...new Set(list.filter(Boolean))];

// «2023-10-10T…» → «10.10.2023». Рэжам радок, а не праганяем праз Date:
// у базе стаіць timestamp без гадзіннага пояса, і браўзер зрушыў бы дату
// на суткі тым, хто чытае з іншага боку зямлі.
function dmy(stamp) {
    if (!stamp) {
        return '';
    }

    const [y, m, d] = stamp.slice(0, 10).split('-');

    return `${d}.${m}.${y}`;
}

const day = (stamp) => (stamp ? stamp.slice(0, 10) : null);

// Што запісалі як вынік скаргі. Слоўнік маленькі наўмысна: два зыходы, якія
// мадэратар і бачыць на картцы.
const OUTCOMES = {
    hidden: 'выдалена з сайта',
    kept: 'адпраўлена на сайт',
};

async function loadModeration() {
    // 1. Усе скаргі. Іх дзясяткі, не тысячы, таму бяром разам з разгледжанымі:
    //    з іх жа збіраецца і гісторыя, і лічбы «колькі скаргаў гэтага чалавека
    //    аказаліся слушнымі».
    const complaints = await fetchAll(() =>
        supabase
            .from('complaint')
            .select(
                'id, definition_id, user_id, reason, comment, created_at, resolved_at, resolved_by, resolved_status'
            )
            .order('created_at', { ascending: true })
    );

    if (!complaints.length) {
        return { cards: [] };
    }

    const definitionIds = unique(complaints.map((c) => c.definition_id));

    // 2. Самі словы. Чытаем табліцу, а не вітрыну `terms`: вітрына схаванае
    //    ўжо не паказвае, а мадэратару якраз трэба бачыць і схаванае — інакш
    //    прыбранае слова знікла б з чаргі разам са скаргай на яго.
    const definitions = await fetchAll(() =>
        supabase
            .from('definition')
            .select('id, content, example, created_at, hidden_at, user_id, term_id, term(id, name), user_profile(name)')
            .in('id', definitionIds)
    );

    // 3. Тэгі гэтых слоў.
    const links = await fetchAll(() =>
        supabase.from('definition_tag').select('definition_id, tag(name)').in('definition_id', definitionIds)
    );

    // 4. Імёны тых, хто скардзіўся. Аўтарскія імёны прыйшлі разам са словам,
    //    а скаржнікі — асобна, з-за двух шляхоў да профілю.
    const peopleIds = unique(complaints.map((c) => c.user_id));
    const people = peopleIds.length
        ? await fetchAll(() => supabase.from('user_profile').select('user_id, name').in('user_id', peopleIds))
        : [];

    // 5. Лёгкі зрэз усяго слоўніка: па ім лічым, колькі ў чалавека слоў і
    //    колькі з іх прыбралі, і колькі наогул тлумачэнняў у аднаго слова.
    //    Адзін запыт замест дзясяткаў — і без спісу з сотняў нумароў у адрасе.
    const everything = await fetchAll(() => supabase.from('definition').select('id, user_id, term_id, hidden_at'));

    return build({ complaints, definitions, links, people, everything });
}

function build({ complaints, definitions, links, people, everything }) {
    const nameOf = new Map(people.map((p) => [p.user_id, p.name || '']));

    // Колькі ў кожнага слоў і колькі з іх прыбралі з сайта.
    const written = new Map();

    for (const row of everything) {
        const own = written.get(row.user_id) || { words: 0, removed: 0 };

        own.words += 1;

        if (row.hidden_at) {
            own.removed += 1;
        }

        written.set(row.user_id, own);
    }

    // Колькі тлумачэнняў у аднаго і таго ж слова: па гэтай лічбе картка
    // папярэджвае, што правіцца толькі яна, а не ўсё слова цалкам.
    const perTerm = new Map();

    for (const row of everything) {
        perTerm.set(row.term_id, (perTerm.get(row.term_id) || 0) + 1);
    }

    // Тэгі па слове.
    const tagsOf = new Map();

    for (const link of links) {
        const name = link.tag?.name;

        if (!name) {
            continue;
        }

        const list = tagsOf.get(link.definition_id) || [];

        list.push(name);
        tagsOf.set(link.definition_id, list);
    }

    // Рэпутацыя таго, хто скардзіцца: колькі напісаў скаргаў, колькі з іх
    // разгледжаныя і колькі аказаліся слушнымі — слова пасля іх прыбралі.
    const record = new Map();

    for (const c of complaints) {
        const own = record.get(c.user_id) || { total: 0, reviewed: 0, approved: 0 };

        own.total += 1;

        if (c.resolved_at) {
            own.reviewed += 1;

            if (c.resolved_status === 'hidden') {
                own.approved += 1;
            }
        }

        record.set(c.user_id, own);
    }

    const personOf = (userId) => {
        const own = written.get(userId) || { words: 0, removed: 0 };
        const stats = record.get(userId) || { total: 0, reviewed: 0, approved: 0 };

        return {
            id: userId,
            name: nameOf.get(userId) || '',
            words: own.words,
            removed: own.removed,
            approved: stats.approved,
            // Лайкі і падзякі мадэратара пакуль не лічым: першыя каштавалі б
            // запыту на кожнае слова кожнага чалавека, а другім яшчэ няма дзе
            // захоўвацца ў базе. Значыць, зорачак пакуль будзе менш, чым
            // заслужана, — але кожная з іх сапраўдная.
            liked: 0,
            praised: 0,
            banned: false,
        };
    };

    const byId = new Map(definitions.map((d) => [d.id, d]));
    const cards = new Map();

    for (const c of complaints) {
        const definition = byId.get(c.definition_id);

        // Слова выдалілі з базы, а скарга на яго засталася. Паказваць няма
        // чаго, і разбіраць таксама.
        if (!definition) {
            continue;
        }

        let card = cards.get(c.definition_id);

        if (!card) {
            const author = personOf(definition.user_id);

            author.name = definition.user_profile?.name || '';

            card = {
                id: definition.id,
                term: definition.term?.name || '',
                content: definition.content || '',
                example: definition.example || '',
                tags: tagsOf.get(definition.id) || [],
                term_definitions: perTerm.get(definition.term_id) || 1,
                author,
                hidden: Boolean(definition.hidden_at),
                resolved: true,
                outcome: null,
                resolvedAt: null,
                seq: 0,
                complaints: [],
            };

            cards.set(definition.id, card);
        }

        // Паўторная — тая, што прыйшла пасля рашэння «слова застаецца». Такая
        // скарга аспрэчвае мадэратара, і глядзець на яе трэба ўважлівей.
        const repeat = card.complaints.some((was) => was.status === 'kept');

        card.complaints.push({
            id: c.id,
            by: nameOf.get(c.user_id) || '',
            by_id: c.user_id,
            by_person: personOf(c.user_id),
            by_stats: record.get(c.user_id) || { total: 0, reviewed: 0, approved: 0 },
            reason: c.reason,
            comment: c.comment || '',
            date: dmy(c.created_at),
            status: c.resolved_status,
            repeat,
            praised: false,
            dismissed: false,
        });

        // Картка ў чарзе, пакуль хоць адна скарга на яе не разгледжаная.
        if (!c.resolved_at) {
            card.resolved = false;
            card.outcome = null;
            card.resolvedAt = null;
        } else if (card.resolved) {
            card.outcome = OUTCOMES[c.resolved_status] || (definition.hidden_at ? OUTCOMES.hidden : OUTCOMES.kept);
            card.resolvedAt = day(c.resolved_at);
        }
    }

    return { cards: [...cards.values()] };
}

export { loadModeration };
