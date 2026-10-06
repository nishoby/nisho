<template>
    <div class="main-container container">
        <div class="sort-settings">
            <el-dropdown trigger="click" placement="bottom-end" popper-class="sort-dropdown" @command="onSortChange">
                <!-- Значок замест надпісу: подпіс «Спачатку новыя» на вузкіх
                     экранах не змяшчаўся ў радок з загалоўкам. Бягучы парадак
                     кажа само меню — галачкай насупраць пункта, а поўны надпіс
                     жыве ў падказцы пры навядзенні. -->
                <button class="sort-trigger" type="button" :title="'Парадак: ' + currentSortLabel">
                    <IconSort class="sort-trigger-sort" />
                    <IconChevron class="sort-trigger-icon" />
                </button>
                <template #dropdown>
                    <el-dropdown-menu>
                        <!-- Відаць увесь спіс, а бягучы пазначаны галачкай. Раней
                             бягучы хаваўся, і пункты скакалі месцамі пры кожным
                             выбары — рука не магла запомніць, дзе што. -->
                        <el-dropdown-item
                            v-for="item in options"
                            :key="item.value"
                            :command="item.value"
                            :class="{ 'sort-item--on': item.value === sort }"
                        >
                            {{ item.label }}
                            <IconCheck v-if="item.value === sort" class="sort-item_check" />
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>

            <span v-if="tagQuery" class="user-tag sort-tag">
                {{ tagQuery }}
                <button class="sort-tag__close" type="button" title="Зняць адбор па тэгу" @click="clearTag">
                    <IconCross />
                </button>
            </span>

            <!-- аўтар — не тэг, таму без зялёнай пілюлі: белы надпіс, як у сартавання -->
            <span v-if="noTagsQuery" class="user-tag sort-tag">
                Без тэгаў
                <button class="sort-tag__close" type="button" title="Зняць адбор" @click="clearNoTags">
                    <IconCross />
                </button>
            </span>

            <span v-if="autarQuery" class="sort-autar">
                @{{ autarName }}
                <button class="sort-autar__close" type="button" title="Зняць адбор па аўтары" @click="clearAutar">
                    <IconCross />
                </button>
            </span>
        </div>
        <PageContentSpinner v-if="!terms" />
        <div v-else class="cards-div">
            <div v-if="searchQuery && !terms.length" class="terms__not-found-card">
                Нічога не знойдзена для запыту <span class="terms__search-query">{{ searchQuery }}</span>
            </div>

            <div class="card" v-for="item of terms" :key="item.definition_id">
                <router-link class="card-title" :to="{ name: 'term', params: { id: item.term_id } }">
                    {{ item.term }}
                </router-link>
                <div class="card-description">
                    {{ tidy(item.definition) }}
                </div>
                <div class="card-example">
                    {{ tidy(item.example) }}
                </div>
                <div class="card-tags">
                    <template v-for="tag of uniqueTags(item.tags)" :key="tag">
                        <router-link v-if="isWalkable(tag)" class="user-tag" :to="{ name: 'terms', query: { tag } }">
                            {{ tag }}
                        </router-link>
                        <span v-else class="user-tag user-tag--lonely">{{ tag }}</span>
                    </template>
                </div>
                <div class="card-info">
                    <!-- адбор па аўтары: тыя ж поўныя карткі, што і на галоўнай,
                         а не ўціснуты спіс старонкі «Мае словы» -->
                    <!-- Аўтар можа знікнуць: калі чалавек выдаліў акаўнт, слова
                         застаецца ў слоўніку, а імя пры ім проста не паказваем.
                         Застаецца адна дата — картка ад гэтага не ламаецца. -->
                    <router-link
                        v-if="item.user"
                        :to="{
                            name: 'terms',
                            query: { autar: item.user.user_id },
                        }"
                        class="card-info_link"
                    >
                        {{ item.user.name }}
                    </router-link>
                    <div class="card-info_date">
                        <span :title="formatLocalDateTime(item.created_at)">
                            {{ formatLongDate(item.created_at) }}
                        </span>
                    </div>
                </div>
                <div class="card-buttons">
                    <div class="card-buttons_actions">
                        <button
                            class="card-buttons-actions_dislike"
                            :class="{
                                'card-buttons-actions_dislike--voted': getVoteResult(item).is_downvoted,
                            }"
                            @click="update(item, 'downvote')"
                        >
                            <icon-dislike />
                        </button>
                        <div class="card-buttons_actions_dislikes-amount">
                            {{ getVoteResult(item).downvotes }}
                        </div>
                        <div class="card-buttons-actions_likes-separator">/</div>
                        <button
                            class="card-buttons-actions_like"
                            :class="{
                                'card-buttons-actions_like--voted': getVoteResult(item).is_upvoted,
                            }"
                            @click="update(item, 'upvote')"
                        >
                            <icon-like />
                        </button>
                        <div class="card-buttons-actions_likes-amount">
                            {{ getVoteResult(item).upvotes }}
                        </div>

                        <router-link
                            class="card-buttons-actions_flag"
                            :to="{
                                name: 'complaint',
                                query: { id: item.definition_id },
                            }"
                        >
                            <img class="flag-img" src="/assets/img/flag.svg" alt="" />
                        </router-link>
                    </div>
                </div>
            </div>
        </div>

        <div class="pages-list" v-if="count > 15">
            <el-pagination
                :background="true"
                :current-page="currentPage"
                @update:current-page="onPageChange"
                :page-size="15"
                :pager-count="4"
                layout="prev, pager, next"
                :total="count"
            />
        </div>
    </div>
</template>

<script>
// Пабудаваныя ў браўзеры парадкі — калода «Выпадковых», рэйтынг, любімыя —
// жывуць на ўзроўні модуля, а не асобніка кампанента. App.vue перастварае
// кампанент на КОЖНУЮ змену адраса (:key="$route.fullPath"), у тым ліку на
// перагортванне старонак; калода ў асобніку тасавалася б нанова на кожнай
// старонцы, і словы паўтараліся б. Ключ уключае ўсе ўмовы, пры якіх спіс
// будаваўся: іншы пошук ці выключаны 18+ — гэта іншы спіс. Жыве да
// перазагрузкі — толькі так «назад» вяртае тое, што чалавек ужо чытаў.
const idsCache = new Map();

// голас мяняе рэйтынг і спіс любімых — гэтыя парадкі будуюцца нанова
function forgetVoteOrders() {
    for (const key of [...idsCache.keys()]) {
        if (key.startsWith('popular|') || key.startsWith('favorites|')) {
            idsCache.delete(key);
        }
    }
}
</script>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { supabase } from './supabase.js';
import { formatLongDate, formatLocalDateTime } from './date.js';
import { hiddenByAdult, adultFilterOn, showMat, showSex } from './adult.js';
import { vote, getVoteResult } from './vote.js';
import { getUser } from './auth.js';
import IconDislike from './icons/IconDislike.vue';
import IconLike from './icons/IconLike.vue';
import PageContentSpinner from './PageContentSpinner.vue';
import IconChevron from './icons/IconChevron.vue';
import IconSort from './icons/IconSort.vue';
import IconCheck from './icons/IconCheck.vue';
import IconCross from './icons/IconCross.vue';

// «Мае любімыя» з'яўляецца ў спісе, толькі калі чалавек хоць нешта лайкаў:
// пункт, за якім заўсёды пуста, — падманка.
const hasLikes = ref(false);

const options = computed(() => [
    {
        value: 'last',
        label: 'Спачатку новыя',
    },
    {
        value: 'popular',
        label: 'Спачатку папулярныя',
    },
    {
        value: 'random',
        label: 'Выпадковыя',
    },
    ...(hasLikes.value ? [{ value: 'favorites', label: 'Мае любімыя' }] : []),
]);

const router = useRouter();
const route = useRoute();
const searchQuery = route.query.poshuk?.trim();
const tagQuery = route.query.tag?.trim();
const autarQuery = route.query.autar?.trim();
// словы, да якіх ніхто не прычапіў ніводнага тэга: інакш на іх не вядзе
// ніводная спасылка і знайсці іх можна толькі гартаннем
const noTagsQuery = route.query.biez === 'tehau';

const clearTag = () => {
    // чалавек прыйшоў сюды з нейкага месца спісу — вяртаем яго туды, разам са
    // старонкай і месцам прокруткі. Калі ж тэг адкрылі па прамой спасылцы,
    // вяртацца няма куды, таму проста здымаем адбор.
    if (window.history.state?.back) {
        router.back();
        return;
    }
    const query = { ...route.query };
    delete query.tag;
    router.push({ name: 'terms', query });
};

const clearNoTags = () => {
    if (window.history.state?.back) {
        router.back();
        return;
    }

    const query = { ...route.query };
    delete query.biez;
    router.push({ name: 'terms', query });
};

const clearAutar = () => {
    if (window.history.state?.back) {
        router.back();
        return;
    }
    const query = { ...route.query };
    delete query.autar;
    router.push({ name: 'terms', query });
};

// Колькі слоў мае кожны тэг. Лічым у браўзеры: бяром тэгі ўсіх слоў адным запытам
// (пры 904 словах гэта каля 57 КБ) і трымаем да перазагрузкі.
// ЧАСОВА, ПАКУЛЬ СЛОЎНІК МАЛЫ. Пры дзясятках тысяч слоў гэты спіс стане завялікім,
// і лічыць колькасць трэба будзе на баку базы — вылічальным полем ва ўяўленні,
// а не захаваным лічыльнікам, каб не разыходзіўся з праўдай.
const tagUsage = ref(null);

// адно і тое ж слова часам мае адзін тэг некалькі разоў: у табліцы сувязяў ляжаць
// дублікаты радкоў, і забароны на паўтор там няма. Схлопваем пры паказе.
const uniqueTags = (tags) => {
    const seen = new Map();
    for (const tag of tags || []) {
        const key = tag.trim().toLowerCase();
        if (key && !seen.has(key)) {
            seen.set(key, tag.trim());
        }
    }
    return [...seen.values()];
};

// тэг, які ёсць толькі ў аднаго слова, вядзе ў тупік — па ім не ходзім
const isWalkable = (tag) => !tagUsage.value || (tagUsage.value.get(tag.trim().toLowerCase())?.count || 0) > 1;

const loadTagUsage = async () => {
    const usage = new Map();
    const step = 1000;
    for (let from = 0; ; from += step) {
        const { data, error } = await supabase
            .from('terms')
            .select('tags')
            .range(from, from + step - 1);
        if (error) {
            throw error;
        }
        for (const row of data) {
            const counted = new Set();
            for (const raw of row.tags || []) {
                const key = raw.trim().toLowerCase();
                if (!key) {
                    continue;
                }
                if (!usage.has(key)) {
                    usage.set(key, { count: 0, spellings: new Set() });
                }
                const entry = usage.get(key);
                // слова лічым адзін раз, нават калі тэг паўтараецца ў ім некалькі разоў
                if (!counted.has(key)) {
                    counted.add(key);
                    entry.count += 1;
                }
                // напісанне захоўваем сырым: «школа » з хвастовым прабелам — асобны
                // радок у базе, і без яго адбор па тэгу згубіць частку слоў
                entry.spellings.add(raw);
            }
        }
        if (data.length < step) {
            break;
        }
    }
    tagUsage.value = usage;
};

// «Мова» і «мова» — адзін тэг, разрэзаны напалам розным напісаннем.
// Шукаем адразу па ўсіх напісаннях, каб склеіць яго на экране.
const applyTagFilter = (query) => {
    if (!tagQuery) {
        return query;
    }
    const spellings = tagUsage.value?.get(tagQuery.toLowerCase())?.spellings;
    const list = spellings ? [...spellings] : [tagQuery];
    return query.or(list.map((name) => 'tags.cs.' + JSON.stringify([name])).join(','));
};
// у чып бярэм імя з першай карткі — усе яны аднаго аўтара
const autarName = computed(() => terms.value?.[0]?.user?.name || 'аўтар');

// ва ўяўленні terms тэгі заўсёды масіў (coalesce '[]'), таму пустата — гэта
// роўнасць пустому масіву, а не NULL
const applyNoTagsFilter = (query) => {
    if (!noTagsQuery) {
        return query;
    }

    return query.filter('tags', 'eq', '[]');
};

const applyAutarFilter = (query) => {
    if (!autarQuery) {
        return query;
    }
    return query.eq('user->>user_id', autarQuery);
};

// людзі часам пакідаюць пустыя радкі напрыканцы тэксту, і картка расце ўвысь
// упустую (white-space: pre-wrap іх паказвае). Абразаем краі пры паказе.
const tidy = (text) => (text || '').trim();

const terms = ref(null);
const count = ref(0);
const account = ref();
// Парадак жыве ў адрасе (?parad=...), як і нумар старонкі. Кампанент
// перастворыцца на любую змену адраса, і ўсё, што было толькі ў памяці, згарае:
// раней ад аднаго перагортвання парадак скідаўся на «Спачатку новыя», а чужая
// спасылка з нумарам старонкі адкрывала старонку зусім іншых слоў.
const SORTS = ['last', 'popular', 'random', 'favorites'];
const sort = ref(SORTS.includes(route.query.parad) ? route.query.parad : 'last');

// «Выпадковыя» і «Спачатку папулярныя» будуюцца аднолькава: спачатку бяром у базы
// нумары ўсіх слоў, выстройваем іх у патрэбны парадак у браўзеры і далей падгружаем
// старонкамі. Самі спісы ляжаць у idsCache на ўзроўні модуля (гл. верхні блок).
// Увага: сюды трапляюць нумары ЎСІХ слоў. Пры некалькіх тысячах гэта дробязь,
// але для гіганцкага слоўніка парадак трэба будзе будаваць на баку базы.
const idsKey = (mode) =>
    [
        mode,
        searchQuery || '',
        tagQuery || '',
        autarQuery || '',
        noTagsQuery ? 'biez' : '',
        showMat.value,
        showSex.value,
    ].join('|');

const currentSortLabel = computed(() => options.value.find((item) => item.value === sort.value).label);

const onSortChange = (value) => {
    if (value === sort.value) {
        return;
    }

    // Мяняем толькі адрас: App.vue на гэта перастворыць кампанент, і новы сам
    // прачытае парадак з адраса і пачне з першай старонкі. «Спачатку новыя» —
    // змаўчанне, яго ў адрасе не пішам, каб галоўная заставалася чыстым «/».
    const query = { ...route.query };
    delete query.staronka;

    if (value === 'last') {
        delete query.parad;
    } else {
        query.parad = value;
    }

    router.push({ name: 'terms', query });
};

const update = async (definition, type) => {
    if (!account.value) {
        ElMessage.warning('Каб прагаласаваць, вам трэба залагініцца');
        return;
    }

    await vote(definition, type);
    // голас змяніў рэйтынг і спіс любімых — абодва парадкі перабудуюцца
    forgetVoteOrders();

    if (type === 'upvote') {
        hasLikes.value = true;
    }
    await fetchTerms();
};

// Нумар старонкі трымаем у адрасе. Без гэтага спіс пасля вяртання (напрыклад, з
// скаргі ці са старонкі слова) ствараўся нанова і пачынаўся з першай старонкі —
// знойдзены запіс даводзілася шукаць нанова.
const currentPage = ref(Number(route.query.staronka) || 1);

const onPageChange = async (page) => {
    currentPage.value = page;

    const query = { ...route.query };

    if (page > 1) {
        query.staronka = String(page);
    } else {
        delete query.staronka;
    }

    router.push({ name: 'terms', query });
    await fetchTerms();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// кнопка «назад» у браўзеры мяняе адрас, але кампанент застаецца — даганяем спіс самі
watch(
    () => route.query.staronka,
    (value) => {
        const page = Number(value) || 1;

        if (page !== currentPage.value) {
            currentPage.value = page;
            fetchTerms();
        }
    }
);

const shuffle = (ids) => {
    for (let i = ids.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    return ids;
};

// рэйтынг слова: плюсы мінус мінусы
const score = (row) => (row.vote_result?.upvotes || 0) - (row.vote_result?.downvotes || 0);

const buildIds = async (mode) => {
    let rows = [];
    const step = 1000;
    // бяром порцыямі: у API ёсць столь на колькасць радкоў у адным адказе
    for (let from = 0; ; from += step) {
        let idQuery = supabase
            .from('terms')
            .select('definition_id, created_at, vote_result, tags')
            .range(from, from + step - 1);
        if (searchQuery) {
            idQuery = idQuery.filter('term', 'ilike', `%${searchQuery}%`);
        }
        idQuery = applyTagFilter(idQuery);
        idQuery = applyAutarFilter(idQuery);
        idQuery = applyNoTagsFilter(idQuery);
        const { data, error } = await idQuery;
        if (error) {
            throw error;
        }
        rows.push(...data);
        if (data.length < step) {
            break;
        }
    }

    // чалавек выключыў 18+ — дарослыя словы выпадаюць з любога парадку.
    // Адсяваем тут, а не на старонцы: так на кожнай старонцы роўна 15 слоў
    // і лічыльнік старонак не хлусіць.
    if (adultFilterOn.value) {
        rows = rows.filter((row) => !hiddenByAdult(row.tags));
    }

    if (mode === 'random') {
        return shuffle(rows.map((row) => row.definition_id));
    }

    // «спачатку новыя» праз спіс нумароў — патрэбна толькі пры схаваным 18+
    if (mode === 'last') {
        return rows
            .slice()
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .map((row) => row.definition_id);
    }

    // «Мае любімыя»: пошук і тэгі ўжо адпрацавалі вышэй, застаецца пакінуць
    // толькі тое, што я лайкаў. Свежыя лайкі — уверсе.
    if (mode === 'favorites') {
        const { data: mine } = await supabase
            .from('votes')
            .select('id, definition_id')
            .eq('user_id', account.value.id)
            .eq('type', 'upvote');

        const orderOf = new Map((mine || []).map((row, i) => [row.definition_id, row.id ?? i]));

        return rows
            .filter((row) => orderOf.has(row.definition_id))
            .sort((a, b) => orderOf.get(b.definition_id) - orderOf.get(a.definition_id))
            .map((row) => row.definition_id);
    }

    // пры роўным рэйтынгу вышэй ідуць навейшыя словы
    rows.sort((a, b) => score(b) - score(a) || new Date(b.created_at) - new Date(a.created_at));
    return rows.map((row) => row.definition_id);
};

const fetchPageByIds = async (mode) => {
    const key = idsKey(mode);

    if (!idsCache.has(key)) {
        idsCache.set(key, await buildIds(mode));
    }
    const ids = idsCache.get(key);
    const pageIds = ids.slice((currentPage.value - 1) * 15, currentPage.value * 15);
    const { data, error } = await supabase.from('terms').select('*').in('definition_id', pageIds);
    if (error) {
        throw error;
    }
    // база аддае радкі ў сваім парадку — вяртаем наш
    const place = new Map(pageIds.map((id, i) => [id, i]));
    terms.value = data.slice().sort((a, b) => place.get(a.definition_id) - place.get(b.definition_id));
    count.value = ids.length;
};

const fetchTerms = async () => {
    // «Мае любімыя» па чужой спасылцы без уваходу: у госця любімых няма,
    // паказваем звычайны парадак, а не пустую старонку
    if (sort.value === 'favorites' && !account.value) {
        sort.value = 'last';
    }

    // пры схаваным 18+ і звычайны парадак будуецца спісам нумароў: інакш
    // старонкі атрымліваліся б дзіравыя пасля адсейвання
    if (sort.value === 'random' || sort.value === 'popular' || sort.value === 'favorites' || adultFilterOn.value) {
        await fetchPageByIds(sort.value);
        return;
    }

    //TODO сделать view вместо выборки
    let queryBuilder = supabase
        .from('terms')
        .select(`*`, { count: 'exact' })
        .range((currentPage.value - 1) * 15, currentPage.value * 15 - 1);

    queryBuilder = queryBuilder.order('created_at', { ascending: false });

    if (searchQuery) {
        queryBuilder = queryBuilder.filter('term', 'ilike', `%${searchQuery}%`);
    }

    queryBuilder = applyTagFilter(queryBuilder);
    queryBuilder = applyAutarFilter(queryBuilder);
    queryBuilder = applyNoTagsFilter(queryBuilder);

    let { data, error, count: termsCount } = await queryBuilder;

    if (error) {
        throw error;
    }
    terms.value = data;
    count.value = termsCount;
};

watch(sort, () => {
    fetchTerms();
});

onMounted(async () => {
    account.value = await getUser();

    // адзін лёгкі запыт: ці ёсць хоць адзін лайк — ад гэтага залежыць пункт
    // «Мае любімыя» ў меню сартавання
    if (account.value) {
        supabase
            .from('votes')
            .select('id')
            .eq('user_id', account.value.id)
            .eq('type', 'upvote')
            .limit(1)
            .then(({ data }) => {
                hasLikes.value = Boolean(data && data.length);
            });
    }

    // Лічыльнік тэгаў патрэбны толькі для іх колеру — словы не павінны яго чакаць.
    // Раней ён стаяў перад выбаркай, і калі гэты запыт завісаў, спіс не з'яўляўся зусім:
    // ад завіслага запыту не ратуе нават перахоп памылкі, бо ён не падае, а маўчыць.
    if (tagQuery) {
        // выключэнне: пры адборы па тэгу лічыльнік патрэбны адразу — з яго бяром
        // усе напісанні тэга, інакш частка слоў у выбарку не трапіць
        try {
            await loadTagUsage();
        } catch (error) {
            console.error(error);
        }
        await fetchTerms();
        return;
    }

    await fetchTerms();
    loadTagUsage().catch((error) => console.error(error));
});
</script>

<style scoped></style>
