<template>
    <!-- Той жа ўбор, што ў «Дадаць слова»: цёмны загаловак на зялёным,
         чорная стрэлка назад -->
    <h1 class="title">
        <button class="back-btn" type="button" aria-label="Назад" @click="router.back()">
            <img src="/assets/img/back-black.svg" alt="" /></button
        >Профіль
    </h1>

    <div class="add-word_form profile-page">
        <button type="reset" class="cross" @click="router.back()"></button>

        <!-- Бан — самым першым на старонцы, вышэй за лагін: калі ён ёсць, гэта
        галоўная навіна, і яе трэба ўбачыць адразу. -->
        <div class="profile-ban" v-if="myBanRow">
            <p class="banned-note_main">
                На жаль, ты ў бане да {{ formatLongDate(myBanRow.until) }} {{ banPhrase(myBanRow.reason) }}.
            </p>
            <p class="banned-note_why" v-if="myBanRow.comment">{{ myBanRow.comment }}</p>
            <p class="banned-note_calm">
                Бан не азначае, што ўсе твае словы будуць выдаленыя. Калі са словам усё добра, яно застанецца на сайце.
            </p>
            <p class="banned-note_calm">
                Пакуль адпачываеш, можаш пачытаць
                <router-link :to="{ name: 'rules' }">правілы</router-link>.
            </p>
        </div>

        <!-- Наладкі — звычайным узорам: значэнне ў рамцы, аловачак унутры;
             па націску рамка становіцца полем з «Захаваць» і «Адмена». -->
        <div class="profile-row">
            <span class="profile-row_label">Лагін</span>

            <div class="profile-row_line" v-if="editing !== 'name'">
                <span class="profile-row_value">{{ savedName || '—' }}</span>
                <button
                    class="profile-edit"
                    type="button"
                    title="Змяніць лагін"
                    aria-label="Змяніць лагін"
                    @click="startEdit('name')"
                >
                    <IconEdit />
                </button>
            </div>
            <div class="profile-row_edit" v-else>
                <el-input v-model="draft" @keydown.enter="saveName" @keydown.esc="cancelEdit" />
                <button class="profile-save" type="button" @click="saveName">Захаваць</button>
                <button class="profile-cancel" type="button" @click="cancelEdit">Адмена</button>
            </div>
        </div>

        <div class="profile-row">
            <span class="profile-row_label">Пошта</span>

            <div class="profile-row_line" v-if="editing !== 'email'">
                <span class="profile-row_value">{{ account ? account.email : '' }}</span>
                <button
                    class="profile-edit"
                    type="button"
                    title="Змяніць пошту"
                    aria-label="Змяніць пошту"
                    @click="startEdit('email')"
                >
                    <IconEdit />
                </button>
            </div>
            <div class="profile-row_edit" v-else>
                <el-input v-model="draft" type="email" @keydown.enter="saveEmail" @keydown.esc="cancelEdit" />
                <button class="profile-save" type="button" @click="saveEmail">Захаваць</button>
                <button class="profile-cancel" type="button" @click="cancelEdit">Адмена</button>
            </div>

            <!-- пошта не мяняецца імгненна: спярша ліст-пацверджанне на новы
                 адрас — кажам гэта адразу пасля «Захаваць», іначай чалавек
                 бачыць стары адрас і думае, што нічога не спрацавала -->
            <span class="profile-row_hint profile-row_hint--notice" v-if="emailNotice">{{ emailNotice }}</span>
        </div>

        <!-- Статыстыка: тры галоўныя лічбы адразу (плюс узнагароды і бан, калі
             яны не нулявыя), астатняе — у класічным акардэоне ніжэй. Нулявыя
             радкі не паказваюцца нідзе. -->
        <div class="profile-stats">
            <!-- пра чалавека, а не пра лічбы — таму сказ, а не радок табліцы -->
            <p class="profile-stat profile-since" v-if="since">З намі з {{ since }}.</p>

            <!-- зорачкі — асобным радком над баламі, і кожнай прыступцы сваё
                 званне: адна — памочнік рэдактара, дзве — рэдактар са стажам,
                 тры — галоўны рэдактар -->
            <p class="profile-stat profile-stat_stars" v-if="stars">
                <span class="profile-stat_label">Статус:</span>
                <span class="profile-stat_rank">{{ rank }}</span>
                <IconStar class="profile-stat_star" v-for="n of stars" :key="n" />
            </p>

            <!-- класічны акардэон з бібліятэкі: загаловак, стрэлка справа,
                 змест раскрываецца ўніз -->
            <el-collapse class="profile-collapse" v-if="hasMore">
                <el-collapse-item title="Статыстыка" name="more">
                    <p class="profile-stat" v-if="score">
                        <span class="profile-stat_num">{{ score }}</span>
                        <span class="profile-stat_label"
                            >{{ plural(score, 'бал', 'балы', 'балаў') }} за актыўнасць</span
                        >
                    </p>
                    <p class="profile-stat" v-if="stats.onSite">
                        <span class="profile-stat_num">{{ stats.onSite }}</span>
                        <span class="profile-stat_label"
                            >{{ plural(stats.onSite, 'слова', 'словы', 'слоў') }} на сайце</span
                        >
                    </p>
                    <p class="profile-stat" v-if="stats.liked">
                        <span class="profile-stat_num">{{ stats.liked }}</span>
                        <span class="profile-stat_like profile-stat_like--row"><IconLike /></span>
                        <span class="profile-stat_label">
                            {{ plural(stats.liked, 'падабайка атрыманая', 'падабайкі атрымана', 'падабаек атрымана') }}
                        </span>
                    </p>
                    <p class="profile-stat" v-if="stats.praised">
                        <span class="profile-stat_num">{{ stats.praised }}</span>
                        <span class="profile-stat_label">
                            {{ plural(stats.praised, 'узнагарода', 'узнагароды', 'узнагарод') }} ад мадэратараў
                        </span>
                    </p>
                    <p class="profile-stat" v-if="stats.banDays">
                        <span class="profile-stat_num">{{ stats.banDays }}</span>
                        <span class="profile-stat_label"
                            >{{ plural(stats.banDays, 'дзень', 'дні', 'дзён') }} у бане</span
                        >
                    </p>
                    <p class="profile-stat" v-if="stats.given">
                        <span class="profile-stat_num">{{ stats.given }}</span>
                        <span class="profile-stat_like profile-stat_like--row"><IconLike /></span>
                        <span class="profile-stat_label">
                            {{
                                plural(
                                    stats.given,
                                    'падабайка раздадзеная',
                                    'падабайкі раздадзена',
                                    'падабаек раздадзена'
                                )
                            }}
                        </span>
                    </p>
                    <p class="profile-stat" v-if="stats.tagsUsed">
                        <span class="profile-stat_num">{{ stats.tagsUsed }}</span>
                        <span class="profile-stat_label">
                            {{ plural(stats.tagsUsed, 'тэг ужыты', 'тэгі ўжыта', 'тэгаў ужыта') }}
                        </span>
                    </p>
                    <p class="profile-stat" v-if="stats.approved">
                        <span class="profile-stat_num">{{ stats.approved }}</span>
                        <!-- той жа сцяжок, якім скардзяцца на картках -->
                        <span class="profile-stat_like profile-stat_like--row profile-stat_flag">
                            <IconFlag />
                        </span>
                        <span class="profile-stat_label">
                            {{ plural(stats.approved, 'паспяховая скарга', 'паспяховыя скаргі', 'паспяховых скарг') }}
                        </span>
                    </p>
                    <p class="profile-stat" v-if="stats.disliked">
                        <span class="profile-stat_num">{{ stats.disliked }}</span>
                        <span class="profile-stat_like profile-stat_like--row"><IconDislike /></span>
                        <span class="profile-stat_label">
                            {{ plural(stats.disliked, 'непадабайка', 'непадабайкі', 'непадабаек') }}
                        </span>
                    </p>
                    <p class="profile-stat" v-if="stats.removed">
                        <span class="profile-stat_num">{{ stats.removed }}</span>
                        <!-- той жа чэрап, што пры бане на мадэрацыі -->
                        <span class="profile-stat_like profile-stat_like--row profile-stat_skull">
                            <IconSkull />
                        </span>
                        <span class="profile-stat_label">
                            {{ plural(stats.removed, 'выдаленае слова', 'выдаленыя словы', 'выдаленых слоў') }}
                        </span>
                    </p>
                </el-collapse-item>
            </el-collapse>

            <!-- Слова наперадзе, тлумачэнне за ім ціхім тэкстам: гэта подпісы
                 да сваіх слоў, а не радкі падліку. Пад акардэонам, асобным
                 абзацам. -->
            <div class="profile-words" v-if="stats.top || stats.first">
                <p class="profile-stat" v-if="stats.top">
                    <router-link class="profile-stat_word" :to="{ name: 'term', params: { id: stats.top.term_id } }">
                        {{ stats.top.term }}
                    </router-link>
                    <span class="profile-stat_note">
                        {{ stats.top.likes }} <span class="profile-stat_like"><IconLike /></span> — самае папулярнае
                    </span>
                </p>
                <p class="profile-stat" v-if="stats.first">
                    <router-link class="profile-stat_word" :to="{ name: 'term', params: { id: stats.first.term_id } }">
                        {{ stats.first.term }}
                    </router-link>
                    <span class="profile-stat_note">{{ stats.first.when }} — першае слова</span>
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { supabase } from './supabase.js';
import { getUser } from './auth.js';
import { myBan, banPhrase } from './bans.js';
import { formatLongDate } from './date.js';
import { commonError } from './error.js';
import IconEdit from './icons/IconEdit.vue';
import IconStar from './icons/IconStar.vue';
import IconLike from './icons/IconLike.vue';
import IconDislike from './icons/IconDislike.vue';
import IconSkull from './icons/IconSkull.vue';
import IconFlag from './icons/IconFlag.vue';

const router = useRouter();
const account = ref(null);
const myBanRow = ref(null);

// што зараз захавана і што рэдагуецца: 'name', 'email' ці нічога
const savedName = ref('');
const editing = ref(null);
const draft = ref('');
const emailNotice = ref('');

// ці ёсць за стрэлачкай хоць адзін ненулявы радок — інакш яна не паказваецца
const hasMore = computed(() =>
    Boolean(
        score.value ||
            stats.onSite ||
            stats.liked ||
            stats.praised ||
            stats.banDays ||
            stats.given ||
            stats.tagsUsed ||
            stats.approved ||
            stats.disliked ||
            stats.removed
    )
);

// ── Статыстыка ─────────────────────────────────────────────────────────────
// Спіс фактаў, і кожны з жывой крыніцы. «Узнагароды ад мадэратараў» пакуль
// заўсёды 0 — падзякам яшчэ няма дзе захоўвацца ў базе; калі з'явяцца,
// лічба ажыве сама.
const stats = reactive({
    onSite: 0,
    removed: 0,
    praised: 0,
    banDays: 0,
    liked: 0,
    disliked: 0,
    given: 0,
    approved: 0,
    tagsUsed: 0,
    top: null,
    first: null,
});

// «З намі з верасня 2023» — дата рэгістрацыі ляжыць ва ўліковым запісе
const since = computed(() => (account.value?.created_at ? monthYear(account.value.created_at) : ''));

// «2026-08-09T…» → «09.08.2026»
const dmy = (stamp) => {
    const at = new Date(/[zZ]$|[+-]dd:?dd$/.test(stamp) ? stamp : stamp + 'Z');
    const pad = (n) => String(n).padStart(2, '0');

    return pad(at.getDate()) + '.' + pad(at.getMonth() + 1) + '.' + at.getFullYear();
};

// «4 верасня 2026» → «верасня 2026»
const monthYear = (stamp) => formatLongDate(stamp).split(' ').slice(1).join(' ');

// «1 бал», «3 балы», «10 балаў» — лічым як у мове
const plural = (n, one, few, many) => {
    const ten = n % 10;
    const hundred = n % 100;

    if (ten === 1 && hundred !== 11) {
        return one;
    }

    if (ten >= 2 && ten <= 4 && !(hundred >= 12 && hundred <= 14)) {
        return few;
    }

    return many;
};

// Балы — тым жа коштам, што бачыць мадэрацыя: +1 слова, +1 лайк, +1 слушная
// скарга, падзяка мадэратара ўдвая, −1 прыбранае слова. Зорачкі за 15, 50 і
// 100 балаў.
const score = computed(() =>
    Math.max(0, stats.onSite + stats.removed + stats.liked + stats.approved + stats.praised * 2 - stats.removed)
);

const STAR_STEPS = [100, 50, 15];

// званні па прыступках зорачак — імі і падпісваем
const RANKS = ['', 'Памочнік Рэдактара', 'Рэдактар са Стажам', 'Галоўны Рэдактар'];

const rank = computed(() => RANKS[stars.value] || '');

const stars = computed(() => {
    const step = STAR_STEPS.findIndex((min) => score.value >= min);

    return step === -1 ? 0 : STAR_STEPS.length - step;
});

async function loadStats(userId) {
    // колькі слоў прыбрана — адзінае, чаго не відаць праз вітрыну
    const { data: defs } = await supabase.from('definition').select('hidden_at').eq('user_id', userId);

    if (defs) {
        stats.removed = defs.filter((row) => row.hidden_at).length;
    }

    // Свае словы на сайце — адным запытам праз вітрыну: у яе радках ёсць і
    // галасы, і тэгі, і даты. З аднаго адказу выцягваем пяць фактаў.
    const { data: mine } = await supabase.from('terms').select('*').eq('user->>user_id', userId);

    if (mine && mine.length) {
        stats.onSite = mine.length;
        stats.liked = mine.reduce((sum, row) => sum + (row.vote_result?.upvotes || 0), 0);
        stats.disliked = mine.reduce((sum, row) => sum + (row.vote_result?.downvotes || 0), 0);

        // самае папулярнае — з найбольшай колькасцю лайкаў; калі лайкаў няма
        // ні ў кога, радок не паказваецца
        const up = (row) => row.vote_result?.upvotes || 0;
        const best = mine.slice().sort((a, b) => up(b) - up(a))[0];

        if (up(best) > 0) {
            stats.top = { term_id: best.term_id, term: best.term, likes: up(best) };
        }

        // першае слова — самае ранняе з тых, што жывуць на сайце
        const oldest = mine.slice().sort((a, b) => new Date(a.created_at) - new Date(b.created_at))[0];

        stats.first = { term_id: oldest.term_id, term: oldest.term, when: dmy(oldest.created_at) };

        // колькі розных тэгаў абжыта — розныя напісанні лічым адным тэгам
        stats.tagsUsed = new Set(
            mine.flatMap((row) => (row.tags || []).map((tag) => tag.trim().toLowerCase()).filter(Boolean))
        ).size;
    }

    // колькі лайкаў раздадзена іншым
    const { data: given } = await supabase.from('votes').select('id').eq('user_id', userId).eq('type', 'upvote');

    if (given) {
        stats.given = given.length;
    }

    // свае скаргі, пасля якіх слова сапраўды прыбралі
    const { data: complaints } = await supabase.from('complaint').select('resolved_status').eq('user_id', userId);

    if (complaints) {
        stats.approved = complaints.filter((row) => row.resolved_status === 'hidden').length;
    }

    // колькі дзён праведзена ў бане — па ўсіх банах, і адбытых, і цяперашнім.
    // Лік сумленны: бан, зняты датэрмінова, лічыцца да дня зняцця, а не да
    // тэрміну, які быў прызначаны.
    const { data: bans } = await supabase.from('ban').select('created_at, until, lifted_at').eq('user_id', userId);

    if (bans) {
        const day = 86400000;

        stats.banDays = Math.round(
            bans.reduce((sum, row) => {
                const start = new Date(row.created_at);
                const end = Math.min(
                    new Date(row.until).getTime(),
                    row.lifted_at ? new Date(row.lifted_at).getTime() : Date.now(),
                    Date.now()
                );

                return sum + Math.max(0, end - start.getTime()) / day;
            }, 0)
        );
    }
}

onMounted(async () => {
    account.value = await getUser();
    myBanRow.value = account.value ? await myBan() : null;
    savedName.value = account.value?.user_metadata?.username || '';

    if (account.value) {
        await loadStats(account.value.id);
    }
});

function startEdit(field) {
    editing.value = field;
    draft.value = field === 'name' ? savedName.value : account.value?.email || '';
}

function cancelEdit() {
    editing.value = null;
    draft.value = '';
}

async function saveName() {
    const typed = draft.value.trim();

    // пустое ці тое ж самае — проста зачыняем праўку, захоўваць няма чаго
    if (!typed || typed === savedName.value) {
        cancelEdit();
        return;
    }

    const { data, error } = await supabase.auth.updateUser({ data: { username: typed } });

    if (error) {
        ElMessage.error(commonError);
        throw error;
    }

    savedName.value = data.user.user_metadata.username;
    ElMessage.success('Лагін зменены');
    cancelEdit();
}

async function saveEmail() {
    const typed = draft.value.trim();

    if (!typed || typed === account.value?.email) {
        cancelEdit();
        return;
    }

    if (!typed.includes('@')) {
        ElMessage.error('Гэта не падобна на пошту');
        return;
    }

    const { error } = await supabase.auth.updateUser({ email: typed });

    if (error) {
        ElMessage.error(commonError);
        throw error;
    }

    // Пошта не мяняецца імгненна: Supabase спярша шле ліст-пацверджанне на
    // новы адрас. Таму стары адрас застаецца на экране, а побач — тлумачэнне,
    // чаму так і што рабіць.
    emailNotice.value = `Даслалі ліст на ${typed} — пацвердзі яго, і пошта зменіцца.`;
    cancelEdit();
}
</script>

<style scoped></style>
