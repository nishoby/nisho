<template>
    <div class="main-container container">
        <div class="sort-settings">
            <el-dropdown trigger="click" placement="bottom-end" popper-class="sort-dropdown" @command="onSortChange">
                <button class="sort-trigger" type="button">
                    {{ currentSortLabel }}
                    <IconChevron class="sort-trigger-icon" />
                </button>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item v-for="item in otherSortOptions" :key="item.value" :command="item.value">
                            {{ item.label }}
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>

            <span v-if="tagQuery" class="user-tag sort-tag">
                {{ tagQuery }}
                <button class="sort-tag__close" type="button" title="Зняць адбор па тэгу" @click="clearTag">×</button>
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
                    {{ item.definition }}
                </div>
                <div class="card-example">
                    {{ item.example }}
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
                    <router-link
                        :to="{
                            name: 'user-words',
                            params: { id: item.user.user_id },
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

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { supabase } from './supabase.js';
import { formatLongDate, formatLocalDateTime } from './date.js';
import { vote, getVoteResult } from './vote.js';
import { getUser } from './auth.js';
import IconDislike from './icons/IconDislike.vue';
import IconLike from './icons/IconLike.vue';
import PageContentSpinner from './PageContentSpinner.vue';
import IconChevron from './icons/IconChevron.vue';

const options = [
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
];

const router = useRouter();
const route = useRoute();
const searchQuery = route.query.poshuk?.trim();
const tagQuery = route.query.tag?.trim();

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
const terms = ref(null);
const count = ref(0);
const account = ref();
const sort = ref('last');

// «Выпадковыя» і «Спачатку папулярныя» будуюцца аднолькава: спачатку бяром у базы
// нумары ўсіх слоў, выстройваем іх у патрэбны парадак у браўзеры і далей падгружаем
// старонкамі. Спіс жыве да перазагрузкі — толькі так «назад» вяртае тое, што чалавек
// ужо чытаў, і ніводнае слова не паўтараецца.
// Увага: сюды трапляюць нумары ЎСІХ слоў. Пры некалькіх тысячах гэта дробязь,
// але для гіганцкага слоўніка парадак трэба будзе будаваць на баку базы.
const idsBySort = ref({});

const currentSortLabel = computed(() => options.find((item) => item.value === sort.value).label);

// бягучы варыянт з меню прыбраны — ён ужо напісаны на кнопцы
const otherSortOptions = computed(() => options.filter((item) => item.value !== sort.value));

const onSortChange = (value) => {
    currentPage.value = 1;
    sort.value = value;
};

const update = async (definition, type) => {
    if (!account.value) {
        ElMessage.warning('Каб прагаласаваць, вам трэба залагініцца');
        return;
    }

    await vote(definition, type);
    // голас змяніў рэйтынг — парадак «папулярных» трэба перабудаваць
    delete idsBySort.value.popular;
    await fetchTerms();
};

const currentPage = ref(1);
const onPageChange = async (page) => {
    currentPage.value = page;
    await fetchTerms();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

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
    const rows = [];
    const step = 1000;
    // бяром порцыямі: у API ёсць столь на колькасць радкоў у адным адказе
    for (let from = 0; ; from += step) {
        let idQuery = supabase
            .from('terms')
            .select('definition_id, created_at, vote_result')
            .range(from, from + step - 1);
        if (searchQuery) {
            idQuery = idQuery.filter('term', 'ilike', `%${searchQuery}%`);
        }
        idQuery = applyTagFilter(idQuery);
        const { data, error } = await idQuery;
        if (error) {
            throw error;
        }
        rows.push(...data);
        if (data.length < step) {
            break;
        }
    }

    if (mode === 'random') {
        return shuffle(rows.map((row) => row.definition_id));
    }

    // пры роўным рэйтынгу вышэй ідуць навейшыя словы
    rows.sort((a, b) => score(b) - score(a) || new Date(b.created_at) - new Date(a.created_at));
    return rows.map((row) => row.definition_id);
};

const fetchPageByIds = async (mode) => {
    if (!idsBySort.value[mode]) {
        idsBySort.value[mode] = await buildIds(mode);
    }
    const ids = idsBySort.value[mode];
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
    if (sort.value === 'random' || sort.value === 'popular') {
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
    // Лічыльнік патрэбны і для колеру тэгаў, і для пошуку па ўсіх напісаннях,
    // таму чакаем яго да першай выбаркі. Але калі ён не загрузіцца — гэта не падстава
    // хаваць увесь спіс слоў: без яго тэгі проста застаюцца звычайнымі спасылкамі.
    try {
        await loadTagUsage();
    } catch (error) {
        console.error(error);
    }
    await fetchTerms();
});
</script>

<style scoped></style>
