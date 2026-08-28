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

        <!-- Уліковы запіс. Тры пары «подпіс — значэнне» стаяць заўсёды і не
             ссоўваюцца: па націску «Змяніць» значэнне на тым самым месцы
             робіцца полем, вакол яго з'яўляецца шэрая рамка. Нічога не
             пераскоквае, чытаць нанова не трэба — відаць, што менавіта правіш.

             Пароль паказваецца кропкамі: звыклая ўмоўнасць, кажа «ён ёсць»,
             не паказваючы яго. У праўцы гэта пустое поле — не чапаеш, значыць
             пароль не мяняецца. -->
        <div class="profile-account" :class="{ 'profile-account--edit': editing === 'account' }">
            <div class="profile-account_lines">
                <div class="profile-account_line">
                    <!-- Подпісы паказваем толькі ў праўцы: у спакойным стане імя,
                         пошта і кропкі пароля пазнаюцца самі, і тры назвы над імі —
                         лішнія словы на самай віднай картцы старонкі. -->
                    <span class="profile-row_label" v-if="editing === 'account'">Лагін:</span>
                    <!-- Імя вядзе да сваіх слоў — тым жа шляхам, што імя аўтара на
                         картках. Фіялетавае з падкрэсленнем, бо гэта спасылка, а не
                         радок дадзеных. -->
                    <router-link
                        class="profile-account_value profile-account_name"
                        v-if="editing !== 'account' && account"
                        :to="{ name: 'terms', query: { autar: account.id } }"
                    >
                        {{ savedName || '—' }}
                    </router-link>
                    <span class="profile-account_value" v-else-if="editing !== 'account'">—</span>
                    <el-input class="profile-account_input profile-account_input--name" v-model="form.name" v-else />
                </div>

                <div class="profile-account_line">
                    <span class="profile-row_label" v-if="editing === 'account'">
                        Пошта:
                        <!-- Пошта не мяняецца імгненна: спярша ліст-пацверджанне на
                             новы адрас. Кажам гэта пры подпісе і загадзя, а не пасля
                             націску, — іначай чалавек бачыць стары адрас і думае, што
                             нічога не спрацавала. -->
                        <span class="profile-row_hint" v-if="editing === 'account'">
                            новы адрас трэба будзе пацвердзіць лістом
                        </span>
                    </span>
                    <span
                        class="profile-account_value"
                        v-if="editing !== 'account'"
                        :title="account ? account.email : ''"
                        >{{ account ? account.email : '' }}</span
                    >
                    <el-input class="profile-account_input" v-model="form.email" type="email" v-else />
                </div>

                <div class="profile-account_line">
                    <span class="profile-row_label" v-if="editing === 'account'">Пароль:</span>
                    <span class="profile-account_value" v-if="editing !== 'account'">••••••••</span>
                    <PasswordInput
                        class="profile-account_input"
                        v-model="pass.next"
                        placeholder="Пакінь пустым, каб не мяняць"
                        v-else
                    />
                </div>

                <!-- Два дадатковыя палі вылазяць толькі калі пароль пачалі мяняць:
                     пакуль поле пустое, іх няма і яны не займаюць месца. -->
                <template v-if="editing === 'account' && pass.next">
                    <div class="profile-account_line">
                        <span class="profile-row_label">Паўтары новы:</span>
                        <PasswordInput class="profile-account_input" v-model="pass.again" />
                    </div>
                    <div class="profile-account_line">
                        <span class="profile-row_label">Цяперашні пароль:</span>
                        <!-- Пытаемся не дзеля бюракратыі: без старога пароля кожны, хто
                             дарваўся да незамкнёнага браўзера, мяняе пароль і замыкае
                             гаспадара за дзвярыма. -->
                        <PasswordInput class="profile-account_input" v-model="pass.old" />
                        <span class="profile-row_hint">Не менш за шэсць знакаў.</span>
                    </div>
                </template>

                <p class="tags-notice" v-if="passNotice">{{ passNotice }}</p>
                <span class="profile-row_hint profile-row_hint--notice" v-if="emailNotice">{{ emailNotice }}</span>
            </div>

            <!-- Словам, а не аловачкам: значок стаў бы ў тым самым куце, што і
                 крыжык «зачыніць», і два значкі побач спрачаліся б за ўвагу. -->
            <button class="profile-textbtn" type="button" v-if="editing !== 'account'" @click="startEdit('account')">
                Змяніць
            </button>

            <span class="profile-row_actions" v-else>
                <button class="profile-cancel" type="button" @click="cancelEdit">Адмена</button>
                <button class="profile-save" type="button" :disabled="saving" @click="saveAccount">Захаваць</button>
            </span>
        </div>

        <!-- Статыстыка: тры галоўныя лічбы адразу (плюс узнагароды і бан, калі
             яны не нулявыя), астатняе — у класічным акардэоне ніжэй. Нулявыя
             радкі не паказваюцца нідзе. -->
        <div class="profile-stats">
            <!-- Класічны акардэон з бібліятэкі, але загалоўкам яму служыць сам
                 радок звання: слова «Статыстыка» над ім было б трэцім подпісам
                 запар і нічога не дадавала б. Стрэлка справа, змест уніз.
                 «Статыстыка» застаецца толькі як запасны загаловак — для таго,
                 хто яшчэ не набраў ніводнай зорачкі і звання не мае. -->
            <el-collapse class="profile-collapse" v-if="hasMore">
                <el-collapse-item name="more">
                    <template #title>
                        <!-- Слова «Узровень» прыбранае: званне гаворыць само за сябе, а
                             подпіс над ім быў трэцім радком запар. Хто не зразумее —
                             убачыць падказку пры навядзенні. -->
                        <span class="profile-stat profile-stat_stars hover-hint-anchor" v-if="stars">
                            <span class="hover-hint">Узровень</span>
                            <span class="profile-stat_rank">{{ rank }}</span>
                            <IconStar class="profile-stat_star" v-for="n of stars" :key="n" />
                        </span>
                        <span v-else>Статыстыка</span>
                    </template>

                    <p class="profile-stat" v-if="score">
                        <span class="profile-stat_lead">
                            <span class="profile-stat_num">{{ score }}</span>
                        </span>
                        <span class="profile-stat_label"
                            >{{ plural(score, 'бал', 'балы', 'балаў') }} за актыўнасць</span
                        >
                    </p>
                    <p class="profile-stat" v-if="stats.onSite">
                        <span class="profile-stat_lead">
                            <span class="profile-stat_num">{{ stats.onSite }}</span>
                        </span>
                        <span class="profile-stat_label"
                            >{{ plural(stats.onSite, 'слова', 'словы', 'слоў') }} на сайце</span
                        >
                    </p>
                    <p class="profile-stat" v-if="stats.liked">
                        <span class="profile-stat_lead">
                            <span class="profile-stat_num">{{ stats.liked }}</span>
                            <span class="profile-stat_like profile-stat_like--row"><IconLike /></span>
                        </span>
                        <span class="profile-stat_label">
                            {{ plural(stats.liked, 'падабайка атрыманая', 'падабайкі атрымана', 'падабаек атрымана') }}
                        </span>
                    </p>
                    <p class="profile-stat" v-if="stats.praised">
                        <span class="profile-stat_lead">
                            <span class="profile-stat_num">{{ stats.praised }}</span>
                        </span>
                        <span class="profile-stat_label">
                            {{ plural(stats.praised, 'узнагарода', 'узнагароды', 'узнагарод') }} ад мадэратараў
                        </span>
                    </p>
                    <p class="profile-stat" v-if="stats.banDays">
                        <span class="profile-stat_lead">
                            <span class="profile-stat_num">{{ stats.banDays }}</span>
                        </span>
                        <span class="profile-stat_label"
                            >{{ plural(stats.banDays, 'дзень', 'дні', 'дзён') }} у бане</span
                        >
                    </p>
                    <p class="profile-stat" v-if="stats.disliked">
                        <span class="profile-stat_lead">
                            <span class="profile-stat_num">{{ stats.disliked }}</span>
                            <span class="profile-stat_like profile-stat_like--row profile-stat_dislike"><IconDislike /></span>
                        </span>
                        <span class="profile-stat_label">
                            {{
                                plural(
                                    stats.disliked,
                                    'непадабайка атрыманая',
                                    'непадабайкі атрымана',
                                    'непадабаек атрымана'
                                )
                            }}
                        </span>
                    </p>
                    <p class="profile-stat" v-if="stats.approved">
                        <span class="profile-stat_lead">
                            <span class="profile-stat_num">{{ stats.approved }}</span>
                            <!-- той жа сцяжок, якім скардзяцца на картках -->
                            <span class="profile-stat_like profile-stat_like--row profile-stat_flag">
                                <IconFlag />
                            </span>
                        </span>
                        <span class="profile-stat_label">
                            {{ plural(stats.approved, 'паспяховая скарга', 'паспяховыя скаргі', 'паспяховых скаргаў') }}
                        </span>
                    </p>
                    <p class="profile-stat" v-if="stats.given">
                        <span class="profile-stat_lead">
                            <span class="profile-stat_num">{{ stats.given }}</span>
                            <span class="profile-stat_like profile-stat_like--row"><IconLike /></span>
                        </span>
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
                    <p class="profile-stat" v-if="stats.disgiven">
                        <span class="profile-stat_lead">
                            <span class="profile-stat_num">{{ stats.disgiven }}</span>
                            <span class="profile-stat_like profile-stat_like--row profile-stat_dislike"><IconDislike /></span>
                        </span>
                        <span class="profile-stat_label">
                            {{
                                plural(
                                    stats.disgiven,
                                    'непадабайка раздадзеная',
                                    'непадабайкі раздадзена',
                                    'непадабаек раздадзена'
                                )
                            }}
                        </span>
                    </p>
                    <p class="profile-stat" v-if="stats.removed">
                        <span class="profile-stat_lead">
                            <span class="profile-stat_num">{{ stats.removed }}</span>
                            <!-- той жа чэрап, што пры бане на мадэрацыі -->
                            <span class="profile-stat_like profile-stat_like--row profile-stat_skull">
                                <IconSkull />
                            </span>
                        </span>
                        <span class="profile-stat_label">
                            {{ plural(stats.removed, 'слова выдалена', 'словы выдалена', 'слоў выдалена') }}
                        </span>
                    </p>
                    <p class="profile-stat" v-if="stats.tagsUsed">
                        <span class="profile-stat_lead">
                            <span class="profile-stat_num">{{ stats.tagsUsed }}</span>
                        </span>
                        <span class="profile-stat_label">
                            {{ plural(stats.tagsUsed, 'тэг ужыты', 'тэгі ўжыта', 'тэгаў ужыта') }}
                        </span>
                    </p>
                    <!-- Слова наперадзе, за ім тлумачэнне: гэта подпісы да сваіх
                         слоў, а не радкі падліку. Стаяць у самым нізе акардэона,
                         пад лічбамі, і разам з імі знікаюць, калі ён закрыты. -->
                    <div class="profile-words" v-if="stats.top || stats.first">
                        <p class="profile-stat" v-if="stats.top">
                            <router-link
                                class="profile-stat_word"
                                :to="{ name: 'term', params: { id: stats.top.term_id } }"
                            >
                                {{ stats.top.term }}
                            </router-link>
                            <!-- спярша палец, потым лічба — як на картках слоў, дзе
                             лічыльнік галасоў стаіць за самой кнопкай -->
                            <!-- лічба, потым знак — як у радках падліку вышэй -->
                            <span class="profile-stat_note">
                                {{ stats.top.likes }} <span class="profile-stat_like"><IconLike /></span> — самае
                                папулярнае
                            </span>
                        </p>
                        <p class="profile-stat" v-if="stats.first">
                            <router-link
                                class="profile-stat_word"
                                :to="{ name: 'term', params: { id: stats.first.term_id } }"
                            >
                                {{ stats.first.term }}
                            </router-link>
                            <span class="profile-stat_note">{{ stats.first.when }} — першае слова</span>
                        </p>
                    </div>
                </el-collapse-item>
            </el-collapse>
        </div>

        <!-- Лексіка 18+ — мацюкі і сэксуалізаванае. Пазнака слова — дарослы тэг,
             таму ўсё трымаецца на ўжо існуючай сістэме тэгаў.

             Перамыкачы два, і абодва самастойныя: мацюкі і сэкс — розныя рэчы,
             каму гідкая лаянка, той не абавязкова хавае размову пра цела.
             Трэцяга, галоўнага, няма наўмысна: ён нічога не вырашаў сам, толькі
             дадаваў лішні крок паміж чалавекам і тым, што ён хоча ўключыць.

             Стаіць апошнім: званне і словы — пра самога чалавека, а гэта
             наладка таго, як яму паказваць сайт. -->
        <div class="profile-adult">
            <p class="profile-adult_title">Паказваць лексіку 18+:</p>

            <p class="profile-stat profile-adult_sub">
                <span class="profile-stat_label">Мацюкі</span>
                <el-switch class="profile-switch" :model-value="showMat" @change="setShowMat" />
            </p>
            <p class="profile-stat profile-adult_sub">
                <span class="profile-stat_label">Сэкс</span>
                <el-switch class="profile-switch" :model-value="showSex" @change="setShowSex" />
            </p>
        </div>

        <!-- Выдаленне акаўнта — апошнім пунктам і ціхім тэкстам: рэч рэдкая і
             незваротная, крычаць ёй няма чаго, а стаяць яна мусіць там, дзе яе
             прывыклі шукаць — у самым нізе наладак. -->
        <div class="profile-danger" v-if="CAN_DELETE_ACCOUNT">
            <button class="profile-delete" type="button" @click="askDelete = true">Выдаліць акаўнт</button>
        </div>

        <!-- Той жа выгляд, што ў пацверджання бана на мадэрацыі: аднолькавыя
             рэчы — адзін выгляд. Перадумаць — крыжыкам зверху, таму асобнай
             «Адмены» тут няма, як і там. -->
        <el-dialog v-model="askDelete" width="30rem" align-center custom-class="ban-dialog profile-dialog">
            <p class="ban-dialog_q">Выдаліць акаўнт?</p>
            <!-- Кажам загадзя і тое, што знікне, і тое, што застанецца: без
                 другога паловы людзей будуць думаць, што забіраюць з сабой і
                 свае словы. -->
            <p class="profile-dialog_note">Лагін і пошта знікнуць назаўжды — вярнуць іх нельга.</p>
            <p class="profile-dialog_note">Твае словы застануцца ў слоўніку, проста без імя аўтара.</p>

            <template #footer>
                <button
                    class="moderation-btn moderation-btn--pink"
                    type="button"
                    :disabled="deleting"
                    @click="deleteAccount"
                >
                    Выдаліць акаўнт
                </button>
            </template>
        </el-dialog>
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
import { showMat, showSex, setShowMat, setShowSex } from './adult.js';
import { commonError } from './error.js';
import PasswordInput from './PasswordInput.vue';
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
const emailNotice = ref('');

// Выдаленне акаўнта. Само выдаленне робіць база: браўзер выдаліць уліковы
// запіс не можа наогул, гэта права ёсць толькі ў функцыі на баку сервера.
// Функцыя ж і здымае аўтарства са слоў, пакідаючы самі словы ў слоўніку.
//
// Пакуль той функцыі ў базе няма, пункт не паказваем: кнопка, якая на націск
// адказвае памылкай, горшая за адсутнасць кнопкі. Ставім true, калі
// delete_my_account() з'явіцца — больш нічога мяняць не трэба.
const CAN_DELETE_ACCOUNT = false;

const askDelete = ref(false);
const deleting = ref(false);

async function deleteAccount() {
    deleting.value = true;

    try {
        const { error } = await supabase.rpc('delete_my_account');

        if (error) {
            throw error;
        }

        // Выходзім самі, не чакаючы: запісу ўжо няма, і сесія ў руках трымае
        // мёртвы ключ — любы наступны запыт усё роўна атрымаў бы адмову.
        await supabase.auth.signOut();
        askDelete.value = false;
        router.push({ name: 'terms' });
        ElMessage.success('Акаўнт выдалены');
    } catch (error) {
        console.error(error);
        ElMessage.error('Не выйшла выдаліць акаўнт — паспрабуй пазней');
    } finally {
        deleting.value = false;
    }
}

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
            stats.disgiven ||
            stats.removed
    )
);

// ── Статыстыка ─────────────────────────────────────────────────────────────
// Спіс фактаў, і кожны з жывой крыніцы. «Узнагароды ад мадэратараў» пакуль
// заўсёды 0 — падзякам яшчэ няма дзе захоўвацца ў базе; калі з'явяцца,
// лічба ажыве сама.
const stats = reactive({
    disgiven: 0,
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

// «2026-08-09T…» → «09.08.2026»
const dmy = (stamp) => {
    const at = new Date(/[zZ]$|[+-]dd:?dd$/.test(stamp) ? stamp : stamp + 'Z');
    const pad = (n) => String(n).padStart(2, '0');

    return pad(at.getDate()) + '.' + pad(at.getMonth() + 1) + '.' + at.getFullYear();
};

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

    // колькі непадабаек раздадзена іншым
    const { data: disgiven } = await supabase.from('votes').select('id').eq('user_id', userId).eq('type', 'downvote');

    if (disgiven) {
        stats.disgiven = disgiven.length;
    }

    // колькі лайкаў раздадзена іншым
    const { data: given } = await supabase.from('votes').select('id').eq('user_id', userId).eq('type', 'upvote');

    if (given) {
        stats.given = given.length;
    }

    // Свае скаргі, якія нечаму паслужылі.
    //
    // Раней лічыліся толькі тыя, пасля якіх слова прыбралі. Але дзве прычыны
    // слова не прыбіраюць наогул: «памылка ў тэксце» і «хачу дадаць тэг». Іх
    // карысць у тым, што слова паправілі, а не ў тым, што яго не стала, — і
    // чалавек, які заўважыў апіску, заставаўся ні з чым. Іх лічым, як толькі
    // мадэратар скаргу закрыў; адкрытыя («created») не лічым — яны яшчэ нічым
    // не скончыліся.
    const HELPFUL_REASONS = new Set(['fix-mistake', 'add-tag']);

    const { data: complaints } = await supabase
        .from('complaint')
        .select('reason, resolved_status')
        .eq('user_id', userId);

    if (complaints) {
        stats.approved = complaints.filter(
            (row) =>
                row.resolved_status === 'hidden' ||
                (HELPFUL_REASONS.has(row.reason) && row.resolved_status && row.resolved_status !== 'created')
        ).length;
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

// Уліковы запіс правіцца адным заходам: лагін, пошта і — калі захочуць —
// пароль. Пустыя палі пароля значаць «не чапаць».
const form = reactive({ name: '', email: '' });
const pass = reactive({ old: '', next: '', again: '' });
const passNotice = ref('');
const saving = ref(false);

function startEdit() {
    editing.value = 'account';
    form.name = savedName.value;
    form.email = account.value?.email || '';
    pass.old = '';
    pass.next = '';
    pass.again = '';
    passNotice.value = '';
}

function cancelEdit() {
    editing.value = null;
    pass.old = '';
    pass.next = '';
    pass.again = '';
    passNotice.value = '';
}

async function saveAccount() {
    const name = form.name.trim();
    const email = form.email.trim();

    passNotice.value = '';

    if (email && !email.includes('@')) {
        ElMessage.error('Гэта не падобна на пошту');
        return;
    }

    // Пароль правяраем да ўсякага запісу: калі ён не сыдзецца, лепш не пачынаць
    // мяняць лагін — інакш палова захаваецца, палова не, і чалавек не зразумее,
    // што ў выніку адбылося.
    if (pass.next) {
        if (pass.next.length < 6) {
            passNotice.value = 'Новы пароль — не менш за шэсць знакаў';
            return;
        }

        if (pass.next !== pass.again) {
            passNotice.value = 'Паролі не супадаюць';
            return;
        }

        if (!pass.old) {
            passNotice.value = 'Каб змяніць пароль, увядзі цяперашні';
            return;
        }
    }

    saving.value = true;

    try {
        if (pass.next) {
            // Стары пароль правяраем адзіным спосабам, які дае Supabase:
            // спрабуем увайсці з ім. Атрымалася — пароль правільны, і мы
            // застаемся ў той самай сесіі; не — набіраў не гаспадар.
            const { error: wrong } = await supabase.auth.signInWithPassword({
                email: account.value?.email,
                password: pass.old,
            });

            if (wrong) {
                passNotice.value = 'Цяперашні пароль не падыходзіць';
                return;
            }
        }

        // Лагін, пошта і пароль пішуцца рознымі запытамі: пошта мяняецца толькі
        // пасля пацверджання ў лісце, астатняе — адразу. Мяшаць іх у адзін
        // запыт значыла б не ведаць, што менавіта не спрацавала.
        if (name && name !== savedName.value) {
            const { data, error } = await supabase.auth.updateUser({ data: { username: name } });

            if (error) {
                throw error;
            }

            savedName.value = data.user.user_metadata.username;
        }

        if (pass.next) {
            const { error } = await supabase.auth.updateUser({ password: pass.next });

            if (error) {
                throw error;
            }
        }

        if (email && email !== account.value?.email) {
            const { error } = await supabase.auth.updateUser({ email });

            if (error) {
                throw error;
            }

            emailNotice.value = `Даслалі ліст на ${email} — пацвердзі яго, і пошта зменіцца.`;
        }

        ElMessage.success(pass.next ? 'Захавана, пароль зменены' : 'Захавана');
        cancelEdit();
    } catch (error) {
        console.error(error);
        ElMessage.error(commonError);
    } finally {
        saving.value = false;
    }
}
</script>

<style scoped></style>
