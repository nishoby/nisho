<template>
    <div class="main-container container">
        <!-- Загаловак і сартаванне ў адным радку, як на мадэрацыі. Паасобку
             паміж імі зеўрала пустая паласа: загаловак са сваімі палямі, пад ім
             радок з адной кнопкай у правым куце, і толькі потым спіс.

             Меню тое ж, што на галоўнай: адна кнопка з бягучым выбарам, астатняе
             ў спісе. Парадак і стан разам наўмысна — на старонцы з дзясяткам слоў
             два асобныя элементы кіравання былі б цяжэй за саму задачу. -->
        <div class="moderation-head my-words-head">
            <p class="my-words-title">{{ header }}</p>

            <div class="sort-settings" v-if="definitions && (definitions.length || sort !== 'last')">
                <el-dropdown
                    trigger="click"
                    placement="bottom-end"
                    popper-class="sort-dropdown"
                    @command="onSortChange"
                >
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
            </div>
        </div>

        <PageContentSpinner v-if="!definitions" />
        <p class="note" v-else-if="!visible.length">{{ emptyNote }}</p>
        <div v-else class="my-rows">
            <!-- Радок на слова, а не картка: на «Маіх словах» глядзяць «дзе маё
                 слова», а не чытаюць вызначэнні — іх аўтар і так ведае. Той жа
                 выгляд, што ў стужцы «Толькі што разгледжана» на мадэрацыі:
                 назва, нумар, дата і адно дзеянне справа. -->
            <p
                class="my-row"
                :class="{ 'my-row--held': definition.pending_moderation || definition.hidden_at }"
                v-for="definition of pageItems"
                :key="definition.id"
            >
                <router-link class="my-row_term" :to="{ name: 'term', params: { id: definition.term.id } }">
                    {{ definition.term.name }}
                </router-link>

                <!-- пачатак вызначэння: слоў з аднолькавай назвай у аўтара можа быць
                     некалькі, і адрозніць іх можна толькі тэкстам -->
                <span class="my-row_desc">{{ getShortDefinitionContent(definition) }}</span>

                <span class="my-row_date">{{ formatShortDate(definition.created_at) }}</span>

                <!-- Тры розныя станы, і блытаць іх нельга. Слова са скаргай на
                     асабістыя дадзеныя хаваецца адразу, яшчэ да разгляду, — назваць
                     гэта «забаненым» было б хлуснёй: ніхто нічога не вырашаў.
                     «Забаненае» кажам толькі тады, калі скарга закрытая і слова так
                     і засталося схаваным. -->
                <span class="my-row_state" v-if="definition.pending_moderation">на мадэрацыі</span>
                <span class="my-row_state" v-else-if="definition.hidden_by_author">прыбранае табой</span>
                <span class="my-row_state my-row_state--gone" v-else-if="definition.hidden_at">забаненае</span>

                <!-- Пакуль слова разглядаюць, правіць яго нельга: інакш мадэратар
                     чытае адно, а на сайце ўжо іншае. Аловак не робім шэрым, а
                     прыбіраем — шэрая кнопка кліча яе націснуць і потым тлумачыць,
                     чаму нельга. -->
                <router-link
                    class="my-row_edit"
                    v-if="canEdit && !definition.pending_moderation && !definition.hidden_at"
                    :to="{ name: 'edit', query: { id: definition.id } }"
                    title="Змяніць слова"
                >
                    <IconEdit />
                </router-link>

                <!-- Крыжык побач з аловачкам: перадумаў — прыбраў сваё слова сам.
                     Перад крыжыкам вертыкальная рыска, як усюды на сайце. Знікае
                     разам з аловачкам, пакуль слова разглядаюць: пакуль па ім ідзе
                     размова, забіраць яго з-пад мадэратара нельга. -->
                <button
                    class="my-row_drop"
                    type="button"
                    v-if="canEdit && !definition.pending_moderation && !definition.hidden_at"
                    title="Прыбраць слова з сайта"
                    aria-label="Прыбраць слова з сайта"
                    @click="askDrop(definition)"
                ></button>

                <!-- Прыбранае табой можна вярнуць: чалавек мае права перадумаць двойчы -->
                <button
                    class="my-row_back"
                    type="button"
                    v-if="canEdit && definition.hidden_by_author"
                    @click="restoreWord(definition)"
                >
                    вярнуць
                </button>
            </p>
        </div>

        <div class="pages-list" v-if="visible.length > PAGE_SIZE">
            <el-pagination
                :background="true"
                :current-page="currentPage"
                @update:current-page="onPageChange"
                :page-size="PAGE_SIZE"
                :pager-count="4"
                layout="prev, pager, next"
                :total="visible.length"
            />
        </div>
    </div>

    <!-- Тое ж акно, што пры бане на мадэрацыі: аднолькавыя рэчы — адзін выгляд. -->
    <el-dialog
        :model-value="Boolean(dropTarget)"
        width="30rem"
        align-center
        custom-class="ban-dialog"
        @update:model-value="dropTarget = null"
    >
        <p class="ban-dialog_q">Выдаліць «{{ dropTarget ? dropTarget.term.name : '' }}»?</p>
        <p class="ban-dialog_note">
            Слова знікне назаўсёды — разам з падабайкамі, якія яму паставілі іншыя. Вярнуць нельга.
        </p>

        <template #footer>
            <button class="moderation-btn moderation-btn--pink" type="button" :disabled="dropping" @click="dropWord">
                Выдаліць слова
            </button>
        </template>
    </el-dialog>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { getUser } from './auth.js';
import { supabase } from './supabase.js';
import { useRoute, useRouter } from 'vue-router';
import { formatShortDate } from './date.js';
import PageContentSpinner from './PageContentSpinner.vue';
import IconEdit from './icons/IconEdit.vue';
import IconChevron from './icons/IconChevron.vue';

const PAGE_SIZE = 15;

// Парадак і стан у адным спісе. Першыя чатыры — парадак, апошнія два —
// адбор: іх нельга спалучыць, але на старонцы аднаго чалавека гэта і не
// патрэбна. Праставата лепш за гнуткасць, якой не скарыстаюцца.
const options = [
    { value: 'last', label: 'Спачатку новыя' },
    { value: 'first', label: 'Спачатку старыя' },
    { value: 'az', label: 'А-Я' },
    { value: 'za', label: 'Я-А' },
    { value: 'pending', label: 'На мадэрацыі' },
    { value: 'banned', label: 'Забаненыя' },
];
const router = useRouter();
const route = useRoute();
const definitions = ref(null);

// Выдаленне свайго слова.
//
// Пацвярджэнне абавязковае: слова знікае назаўсёды, разам з лайкамі, якія яму
// паставілі іншыя. Пытаемся тым жа акном, што і мадэрацыя пры бане, — тое ж
// пытанне мусіць выглядаць аднолькава ў абодвух месцах.
const dropTarget = ref(null);
const dropping = ref(false);

function askDrop(definition) {
    dropTarget.value = definition;
}

async function dropWord() {
    const target = dropTarget.value;

    if (!target) {
        return;
    }

    dropping.value = true;

    try {
        // Не выдаляем радок, а хаваем слова: лайкі, якія паставілі іншыя, і
        // скаргі, калі былі, застаюцца цэлыя. Для чалавека выглядае гэтак жа —
        // слова знікла з сайта, — але яго можна вярнуць.
        const { error } = await supabase
            .from('definition')
            .update({ hidden_at: new Date().toISOString(), hidden_by_author: true })
            .eq('id', target.id);

        if (error) {
            throw error;
        }

        definitions.value = definitions.value.map((d) =>
            d.id === target.id ? { ...d, hidden_at: new Date().toISOString(), hidden_by_author: true } : d
        );
        dropTarget.value = null;
        ElMessage.success('Слова прыбранае з сайта');
    } catch (error) {
        console.error(error);
        ElMessage.error('Не выйшла прыбраць — паспрабуй пазней');
    } finally {
        dropping.value = false;
    }
}

// Вярнуць сваё слова назад. Тая ж кнопка, толькі ў адваротны бок: чалавек мае
// права перадумаць двойчы.
async function restoreWord(definition) {
    try {
        const { error } = await supabase
            .from('definition')
            .update({ hidden_at: null, hidden_by_author: false })
            .eq('id', definition.id);

        if (error) {
            throw error;
        }

        definitions.value = definitions.value.map((d) =>
            d.id === definition.id ? { ...d, hidden_at: null, hidden_by_author: false } : d
        );
        ElMessage.success('Слова вярнулася на сайт');
    } catch (error) {
        console.error(error);
        ElMessage.error('Не выйшла вярнуць — паспрабуй пазней');
    }
}

const sort = ref('last');
const user = ref();
const header = ref('Словы');
const canEdit = ref(false);

const currentSortLabel = computed(() => options.find((item) => item.value === sort.value).label);

// бягучы варыянт з меню прыбраны — ён ужо напісаны на кнопцы
const otherSortOptions = computed(() => options.filter((item) => item.value !== sort.value));

// Што паказваем пасля адбору і ў якім парадку.
//
// Усё лічыцца ў браўзеры, бо старонка паказвае словы аднаго чалавека, і іх
// дзясяткі. Для агульнага спісу сайта так рабіць нельга, а тут — можна.
const visible = computed(() => {
    if (!definitions.value) {
        return [];
    }

    const rows = definitions.value.filter((d) => {
        // Схаванае на час праверкі трапляе сюды, а не ў «забаненыя»: рашэння
        // па ім яшчэ няма, і чакае яно разам з астатнімі.
        if (sort.value === 'pending') {
            return Boolean(d.pending_moderation);
        }

        // Забаненае — гэта схаванае, па якім скарга ўжо закрытая.
        if (sort.value === 'banned') {
            return Boolean(d.hidden_at) && !d.pending_moderation;
        }

        return true;
    });

    const byDate = (a, b) => new Date(a.created_at) - new Date(b.created_at);
    // localeCompare, а не звычайнае параўнанне: інакш «Я» стане перад «а»,
    // бо машына раўнуе па нумарах літар, а не па алфавіце
    const byName = (a, b) => a.term.name.localeCompare(b.term.name, 'be');

    if (sort.value === 'first') {
        return [...rows].sort(byDate);
    }

    if (sort.value === 'az') {
        return [...rows].sort(byName);
    }

    if (sort.value === 'za') {
        return [...rows].sort((a, b) => byName(b, a));
    }

    return [...rows].sort((a, b) => byDate(b, a));
});

const pageItems = computed(() =>
    visible.value.slice((currentPage.value - 1) * PAGE_SIZE, currentPage.value * PAGE_SIZE)
);

const emptyNote = computed(() => {
    if (sort.value === 'pending') {
        return 'Ніводнага слова на мадэрацыі няма.';
    }

    if (sort.value === 'banned') {
        return 'Забаненых слоў няма.';
    }

    return 'Пакуль ніводнага слова.';
});

const onSortChange = (value) => {
    sort.value = value;
    currentPage.value = 1;
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

onMounted(async () => {
    await fetchUser();
    await fetchDefinitions();
});

async function fetchUser() {
    if (route.name === 'current-user-words') {
        user.value = await getUser();
        header.value = 'Мае словы';
        canEdit.value = true;
    } else if (route.params.id) {
        let { data, error } = await supabase
            .from('user_profile')
            .select(`id:user_id, name`)
            .filter('user_id', 'eq', route.params.id)
            .single();

        if (error) {
            throw error;
        }

        user.value = data;
        header.value = `Словы ад ${data.name}`;
    }

    if (!user.value) {
        await router.push({ name: 'terms' });
    }
}

// Бяром усе словы чалавека адразу, а не старонкамі.
//
// Інакш адбор «На мадэрацыі» хлусіў бы: ён бачыў бы толькі тыя пятнаццаць
// слоў, што ўжо загружаныя, і паказваў бы пустату там, дзе словы ёсць на
// трэцяй старонцы. Тут гэта танна — старонка паказвае словы аднаго чалавека.
async function fetchDefinitions() {
    let { data, error } = await supabase
        .from('definition')
        .select(`*, term(*), user_profile(name)`)
        .order('created_at', { ascending: false })
        .filter('user_id', 'eq', user.value.id);

    if (error) {
        throw error;
    }

    definitions.value = data;

    await markPending();
}

// Ці ляжыць на слове неразгледжаная скарга.
//
// Пытаемся асобным запытам, а не злучэннем са скаргамі, наўмысна: чытаць
// табліцу скаргаў аўтару слова нельга. Ён убачыў бы, хто паскардзіўся і што
// напісаў, — а гэта проста запрашэнне пайсці высвятляць адносіны. Функцыя
// вяртае адны нумары, і толькі для яго ўласных слоў.
async function markPending() {
    const ids = definitions.value.map((d) => d.id);

    if (!ids.length) {
        return;
    }

    const { data, error } = await supabase.rpc('my_pending_definitions', { ids });

    // Не змаглі спытаць — не выдумляем. Лепш паказаць слова без пазнакі, чым
    // замкнуць праўку па здагадцы.
    if (error) {
        return;
    }

    const pending = new Set((data || []).map((row) => (typeof row === 'object' ? row.definition_id : row)));

    definitions.value = definitions.value.map((d) => ({ ...d, pending_moderation: pending.has(d.id) }));
}

const currentPage = ref(1);
const onPageChange = (page) => {
    currentPage.value = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

const MAX_DEFINITION_LENGTH = 55;
function getShortDefinitionContent(definition) {
    const { content } = definition;

    if (content.length <= MAX_DEFINITION_LENGTH) {
        return content;
    }

    const slicedDef = content.slice(0, MAX_DEFINITION_LENGTH);
    const slicedWordEnd = content.slice(MAX_DEFINITION_LENGTH, content.length).split(' ')[0];
    return `${slicedDef}${slicedWordEnd}...`;
}
</script>

<style scoped></style>
