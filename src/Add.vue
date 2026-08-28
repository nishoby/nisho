<template>
    <h1 class="title">
        <button class="back-btn" type="button" aria-label="Назад" @click="router.back()">
            <img src="/assets/img/back-black.svg" alt="" /></button
        >Дадаць слова
    </h1>
    <!-- Забаненаму форма не адчыняецца зусім — замест яе адразу тлумачэнне.
         Паказваць поле, якое нельга адправіць, значыла б дазволіць чалавеку
         напісаць слова цалкам і толькі потым сказаць «не». -->
    <div class="add-word_form banned-screen" v-if="ban">
        <button type="reset" class="cross" @click="router.back()"></button>

        <p class="banned-note_main">
            На жаль, ты ў бане да {{ formatLongDate(ban.until) }} {{ banPhrase(ban.reason) }}.
        </p>
        <p class="banned-note_why" v-if="ban.comment">{{ ban.comment }}</p>
        <p class="banned-note_calm">
            Бан не азначае, што ўсе твае словы будуць выдаленыя. Калі са словам усё добра, яно застанецца на сайце.
        </p>
        <p class="banned-note_calm">
            Пакуль адпачываеш, можаш пачытаць
            <router-link :to="{ name: 'rules' }">правілы</router-link>.
        </p>
    </div>

    <el-form
        v-else
        :model="new_term"
        ref="form"
        :rules="rules"
        @submit.prevent="submit"
        label-position="top"
        hide-required-asterisk
        class="add-word_form"
    >
        <button type="reset" class="cross" @click="router.back()"></button>
        <p class="note">
            Усе тлумачэнні ў Нішо напісаныя звычайнымі людзьмі. Ты таксама можаш дадаць у слоўнік свае.
            <br />
            Зазірні ў
            <router-link :to="{ name: 'rules' }" target="_blank">правілы</router-link>
            перад тым як даваць новае слова ці яго тлумачэнне. Зазірні ва
            <!-- новая ўкладка: пераход пасярод запаўнення згубіў бы форму -->
            <router-link :to="{ name: 'all-tags' }" target="_blank">Усе тэгі</router-link>
            каб натхніцца.
        </p>
        <el-form-item label="Слова:" prop="term_name">
            <el-input v-model="new_term.term_name" placeholder="Напішы слова" />
        </el-form-item>
        <el-form-item label="Вызначэнне:" prop="definition">
            <!-- пачынаецца з двух радкоў і расцягваецца пад тэкст, а не трымае
                 пастаянную вышыню на пяць радкоў, якая пуставала для кароткіх слоў -->
            <el-input
                v-model="new_term.definition"
                type="textarea"
                :autosize="{ minRows: 2 }"
                placeholder="Дай вызначэнне свайму слову. Паспрабуй напісаць яго як мага больш нейтральна і зразумела."
            />
        </el-form-item>
        <el-form-item label="Прыклад:" prop="example">
            <el-input
                v-model="new_term.example"
                type="textarea"
                :autosize="{ minRows: 2 }"
                placeholder="Напішы сказ ці дыялог з прыкладам ужывання свайго слова. Іншым людзям вельмі дапаможа разуменне кантэксту."
            />
        </el-form-item>
        <el-form-item prop="tags">
            <!-- Падказка пра Enter стаіць пры подпісе, а не ў полі: у полі яна знікла б
                 акурат тады, калі чалавек пачынае пісаць і Enter яму патрэбны.
                 Пакуль поле зачыненае, подпіс пусты: пра тое, што тэг варта дадаць,
                 і так кажа радок пад полем. -->
            <template #label>
                Тэгі:
                <span class="label-hint" v-if="typingTag">(напішы тэг, націсні Enter)</span>
            </template>
            <div class="add-word__tags-input-wrapper" @click="handleTagsWrapperClick">
                <el-tag
                    v-for="tag in new_term.tags"
                    :key="tag"
                    size="large"
                    class="add-word__tags-input-tag"
                    closable
                    :disable-transitions="false"
                    @close="handleRemoveTag(tag)"
                >
                    <!-- клік па самім слове вяртае тэг у поле: паправіць літару лягчэй,
                         чым выдаліць і набраць нанова -->
                    <span class="add-word__tags-input-tag-text" @click="startEditTag(tag)">{{ tag }}</span>
                </el-tag>
                <span v-if="tagHint" class="tag-hint">
                    <!-- mousedown.prevent: без гэтага поле губляе фокус раней за націск,
                         спрацоўвае @blur і паспявае дадаць недапісанае «раз» побач з «размоўнае» -->
                    <button class="tag-hint__accept" type="button" @mousedown.prevent @click="acceptTagHint">
                        {{ tagHint }}
                    </button>
                    <button
                        class="tag-hint__dismiss"
                        type="button"
                        title="Схаваць падказку"
                        @mousedown.prevent
                        @click="dismissTagHint"
                    >
                        ×
                    </button>
                </span>
                <!-- «Плюс» і поле — адно і тое ж месца: націснуў плюс, і ён на месцы
                     робіцца пілюляй, у якой ужо пішаш. Пілюля расце па літарах —
                     шырыню бярэм з нябачнага двайніка, бо сам input расці не ўмее -->
                <span v-if="typingTag" class="tags-typing" ref="tagPill">
                    <span class="tags-typing_mirror" ref="tagMirror">{{ newTag }}</span>
                    <el-input
                        v-model="newTag"
                        ref="newTagInput"
                        size="large"
                        class="add-word__tags-input"
                        :style="{ width: tagWidth }"
                        @input="refreshTagHint"
                        @keydown.enter.prevent="handleAddTag"
                        @keydown.delete="handleBackspace"
                        @blur="handleTagBlur"
                    />
                    <!-- mousedown.prevent: інакш поле губляе фокус раней за націск,
                         спрацоўвае @blur і недапісанае паспявае дадацца тэгам -->
                    <button
                        class="tags-typing_close"
                        type="button"
                        title="Не дадаваць"
                        @mousedown.prevent
                        @click="cancelTag"
                    ></button>
                </span>
                <!-- пакуль не пішуць, месца ўводу займае «плюс»: у радку відаць
                     толькі самі тэгі, а «плюс» сам кажа, што тут можна дадаць -->
                <button v-else class="tags-add" type="button" title="Дадаць тэг" @click="openTagInput"></button>
            </div>
            <p v-if="tagNotice" class="tags-notice">{{ tagNotice }}</p>

            <!-- Падказка знізу: тэгі, якімі карыстаюцца часцей за ўсё.
                 Націснуў — тэг дадаўся ў поле вышэй, націснуў яшчэ раз —
                 знік. Гэта не асобны механізм: тыя ж тэгі, проста без
                 набору рукамі. «18+», «мацюкі», «сэкс» і «эратычнае» тут не
                 выпадкова — па іх сайт хавае дарослае ад тых, хто яго выключыў. -->
            <div class="tag-suggest">
                <span class="tag-suggest_label">Дадай тэг са спісу ці прыдумай свой</span>
                <button
                    v-for="name of SUGGESTED_TAGS"
                    :key="name"
                    class="tag-suggest_item"
                    :class="{ 'tag-suggest_item--on': hasTag(name) }"
                    type="button"
                    @click="toggleTag(name, !hasTag(name))"
                >
                    {{ name }}
                </button>
            </div>
        </el-form-item>
        <input class="submit-btn" type="submit" value="Гатова" :disabled="loading" />
    </el-form>
</template>

<script setup>
import { nextTick, onMounted, reactive, ref, watch } from 'vue';
import { supabase } from './supabase.js';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { commonError } from './error.js';
import { myBan, forgetMyBan, banPhrase } from './bans.js';
import { formatLongDate } from './date.js';

const router = useRouter();
const newTag = ref('');
const newTagInput = ref();

// Поле ўводу тэга з'яўляецца толькі калі ў ім пішуць; астатні час на яго месцы
// стаіць «плюс». Дзеля гэтага фокус ставім не адразу, а пасля перамалёўкі.
const typingTag = ref(false);
const tagPill = ref();

const openTagInput = async () => {
    typingTag.value = true;
    await nextTick();
    newTagInput.value?.input?.focus();

    // Пілюля выцягваецца з кружка «плюса»: колер, вышыня і круглы бок у іх
    // аднолькавыя, таму на вока гэта не падмена аднаго другім, а расцяжка.
    // Канцавую шырыню бяром замерам — у CSS яе не запішаш, яна залежыць ад слова.
    // min-width: 0 у кадрах абавязковы: без яго пілюля не мае права стаць
    // вузейшай за свой змест і абмежаванне шырыні на яе не дзейнічае.
    const pill = tagPill.value;

    if (pill?.animate) {
        pill.animate(
            [
                { minWidth: '0px', maxWidth: '2rem' },
                { minWidth: '0px', maxWidth: `${pill.offsetWidth}px` },
            ],
            { duration: 140, easing: 'ease-out' }
        );
    }
};

// Пілюля расце разам з наборам. Сам input расці не ўмее, таму побач стаіць
// нябачны двайнік з тым жа тэкстам і тым жа шрыфтам — з яго і бяром шырыню.
const tagMirror = ref();
const tagWidth = ref('0.5rem');

watch(newTag, async () => {
    await nextTick();
    // 8px — пустая пілюля, каб яна не схлопвалася ў адзін крыжык
    tagWidth.value = `${Math.max(8, (tagMirror.value?.offsetWidth ?? 0) + 2)}px`;
});

// Крыжык на пілюлі — «перадумаў»: набранае знікае, поле складваецца назад у плюс
const cancelTag = () => {
    newTag.value = '';
    tagHint.value = '';
    editedIndex = null;
    typingTag.value = false;
};

const loading = ref(false);

const new_term = reactive({
    term_name: '',
    definition: '',
    example: '',
    tags: [],
});
// Даўжыню правяраем толькі тады, калі чалавек ужо нешта напісаў. Пустое поле —
// гэта не памылка, а проста яшчэ не запоўненае: чырваніць яго загадзя няветліва.
const minIfFilled = (length, text) => (rule, value, callback) => {
    const written = (value || '').trim();

    if (written && written.length < length) {
        callback(new Error(text));
        return;
    }

    callback();
};

const rules = reactive({
    term_name: [
        // trigger 'submit' у інтэрфейсе не бывае, таму правіла спрацуе толькі пры
        // поўнай праверцы — гэта значыць пры націску «Гатова».
        // Без trigger правіла лічыцца «правяраць заўсёды» і чырваніць пустое поле адразу.
        { required: true, message: 'Напішы слова — хаця б дзве літары', trigger: 'submit' },
        { validator: minIfFilled(2, 'Напішы слова — хаця б дзве літары'), trigger: 'blur' },
    ],
    definition: [
        { required: true, message: 'Змястоўна патлумач слова', trigger: 'submit' },
        { validator: minIfFilled(10, 'Змястоўна патлумач слова'), trigger: 'blur' },
    ],
    example: [
        { required: true, message: 'Дадай прыклад ужывання', trigger: 'submit' },
        { validator: minIfFilled(10, 'Дадай прыклад ужывання'), trigger: 'blur' },
    ],
});
// ── Забаненаму форма не адчыняецца ─────────────────────────────────────────
// Пытаемся пра бан пры адкрыцці старонкі, і калі ён ёсць — замест формы
// стаіць тлумачэнне. Раней тут было ўсплываючае паведамленне па-над формай,
// але форма пад ім усё адно запрашала пісаць — а напісанае не прынялі б.
//
// Тон наўмысна спакойны. Бан часовы, і чалавек часцей за ўсё не злыдзень, а
// той, хто не разабраўся; злы тэкст на такога дзейнічае не лепш, а горш —
// пасля яго вяртаюцца спрачацца, а не чытаць правілы. Парадак радкоў: спярша
// факт і тэрмін, потым словы мадэратара, потым тое, што здымае галоўны
// страх — «а мае словы выдалілі?».
// Радок пра словы — правіла праекта, а не падлік гэтага выпадку: «калі са
// словам усё добра, яно застанецца». Так фраза праўдзівая заўсёды — і калі
// ўсё на месцы, і калі частку прыбралі, — і нічога не трэба пытацца ў базы.
const ban = ref(null);

onMounted(async () => {
    ban.value = await myBan();
});

const form = ref();
const submit = async () => {
    if (!form.value) {
        return;
    }
    loading.value = true;

    await form.value.validate(async (valid) => {
        if (!valid) return;

        try {
            let { data, error } = await supabase.rpc('add_term', {
                definition: new_term.definition,
                example: new_term.example,
                term_name: new_term.term_name.trim(),
                tags: new_term.tags,
            });
            loading.value = false;
            if (error) {
                throw error;
            }
            ElMessage.success('Паспяхова даданы тэрмін');
            await router.push({ name: 'term', params: { id: data } });
        } catch (error) {
            // Замок у базе спрацаваў — значыць, бан з'явіўся ўжо пасля таго,
            // як старонка адкрылася. Форма проста саступае месца тлумачэнню:
            // «нешта пайшло не так» тут было б чыстай няпраўдай.
            if (String(error?.message || '').includes('BANNED')) {
                forgetMyBan();

                const found = await myBan();

                if (found) {
                    ban.value = found;
                    return;
                }
            }

            ElMessage.error(commonError);
            throw error;
        }
    });
};

// Тэгі, якія падказваем пад полем. Першыя чатыры — дарослыя: па іх сайт хавае
// слова ад тых, хто выключыў адпаведную катэгорыю 18+. «Эратычнае» — мякчэйшы
// сусед «сэксу»: хаваецца тым жа перамыкачом, але не абяцае большага, чым ёсць.
const SUGGESTED_TAGS = [
    '18+',
    'мацюкі',
    'сэкс',
    'эратычнае',
    'слэнг',
    'дыялект',
    'русізм',
    'паланізм',
    'англіцызм',
    'лаянка',
];

// Падказаны тэг дадаецца ў той жа спіс, што і набраны рукамі.
const hasTag = (name) => new_term.tags.some((tag) => tag.trim().toLowerCase() === name);

function toggleTag(name, on) {
    if (on) {
        if (!hasTag(name)) {
            // з вялікай літары, як усе тэгі на сайце
            new_term.tags.push(name[0].toUpperCase() + name.slice(1));
        }

        return;
    }

    new_term.tags = new_term.tags.filter((tag) => tag.trim().toLowerCase() !== name);
}

const tagNotice = ref('');
let tagNoticeTimer = null;

const showTagNotice = (text) => {
    tagNotice.value = text;
    clearTimeout(tagNoticeTimer);
    tagNoticeTimer = setTimeout(() => {
        tagNotice.value = '';
    }, 3000);
};

// Backspace у пустым полі прыбірае апошні тэг — звычка з любога поля з пілюлямі.
// Пакуль у полі ёсць літары, ён працуе як звычайна і сцірае іх.
const handleBackspace = (event) => {
    if (newTag.value.length || !new_term.tags.length) {
        return;
    }

    event.preventDefault();
    new_term.tags.pop();
};

// месца, з якога тэг забралі на праўку, — каб выпраўлены вярнуўся туды ж,
// а не ў канец спісу
let editedIndex = null;

// клік па тэксце тэга: прыбіраем яго са спісу і кладзём назад у поле ўводу
const startEditTag = (tag) => {
    editedIndex = new_term.tags.indexOf(tag);
    new_term.tags.splice(editedIndex, 1);
    newTag.value = tag;
    tagHint.value = '';
    // падказка не мусіць выскокваць адразу: чалавек прыйшоў правіць, а не набіраць новае
    hintDismissedFor.value = tag;
    openTagInput();
};

const handleRemoveTag = (tag) => {
    new_term.tags.splice(new_term.tags.indexOf(tag), 1);
};

// Падказка пра ўжо існы тэг: адна, над полем. Чалавек або дакранаецца да яе,
// або проста піша далей і не заўважае.
const tagHint = ref('');
const hintDismissedFor = ref('');
let hintTimer = null;

// Падказваем толькі тое, што чалавек відавочна дапісвае: тэг пачынаецца з набранага
// або з набранага пачынаецца слова ўнутры тэга («сеткі» → «сацыяльныя сеткі»).
// Супадзенне пасярод слова не паказваем: «ва» ў «размоўнае» выглядае як выпадковае слова.
const startsAtWord = (key, lowerQuery) => key.startsWith(lowerQuery) || key.includes(' ' + lowerQuery);

// Выбіраем адзін варыянт, а не спіс: найкарацейшы з тых, што пачынаюцца з набранага.
// Такі найбліжэй да таго, што чалавек, відаць, дапісвае.
const pickHint = (names, query) => {
    const lowerQuery = query.toLowerCase();
    const already = new Set(new_term.tags.map((tag) => tag.trim().toLowerCase()));
    const seen = new Map();

    for (const name of names) {
        const key = name.trim().toLowerCase();

        if (already.has(key) || key === lowerQuery || !startsAtWord(key, lowerQuery)) {
            continue;
        }

        // «Мова» і «мова» — адзін тэг; трымаем напісанне без лішніх прабелаў і ў ніжнім рэгістры
        if (!seen.has(key) || name === name.trim().toLowerCase()) {
            seen.set(key, name.trim());
        }
    }

    const candidates = [...seen.entries()];
    // цэлы тэг з набранага пачынаецца — бліжэй, чым слова ўсярэдзіне
    candidates.sort((a, b) => {
        const byKind = Number(b[0].startsWith(lowerQuery)) - Number(a[0].startsWith(lowerQuery));

        return byKind || a[0].length - b[0].length;
    });

    return candidates.length ? candidates[0][1] : '';
};

const refreshTagHint = () => {
    clearTimeout(hintTimer);

    const query = newTag.value.trim().replace(/ +/g, ' ');
    // % _ * , ( ) — службовыя знакі пошуку і раздзяляльнікі ў запыце; у тэгах іх няма
    const pattern = query.replace(/[%_*,()\\]/g, '');

    // з адной літары падказка — амаль наўгад, чакаем дзве
    if (pattern.length < 2 || query === hintDismissedFor.value) {
        tagHint.value = '';
        return;
    }

    // не б'ём у базу на кожную літару
    hintTimer = setTimeout(async () => {
        // Пытаем толькі тое, што пачынаецца з набранага — цэлы тэг або слова ўнутры яго.
        // Раней быў пошук падрадка з limit 20: пры 600+ тэгах база вяртала 20 адвольных
        // радкоў з сотні супадзенняў, і падказка сапраўды выглядала як выпадковае слова.
        const { data, error } = await supabase
            .from('tag')
            .select('name')
            .or(`name.ilike.${pattern}%,name.ilike.% ${pattern}%`)
            .order('name')
            .limit(50);

        if (error || newTag.value.trim().replace(/ +/g, ' ') !== query) {
            return;
        }

        tagHint.value = pickHint(
            data.map((row) => row.name),
            query
        );
    }, 200);
};

const acceptTagHint = () => {
    newTag.value = tagHint.value;
    tagHint.value = '';
    handleAddTag();
};

const dismissTagHint = () => {
    hintDismissedFor.value = newTag.value.trim();
    tagHint.value = '';
};

const handleAddTag = () => {
    // Прыбіраем крайнія прабелы і сціскаем двайныя ўнутры. У базе праз гэта ўжо ляжаць
    // асобна «школа» і «школа » — розныя радкі толькі з-за хвастовага прабелу.
    // Тыпаграфскі апостраф ’ (яго падстаўляюць Word і тэлефоны) замяняем на просты:
    // інакш «камп’ютары» і «камп'ютары» становяцца двума рознымі тэгамі, а на выгляд
    // яны аднолькавыя.
    const normalizedValue = newTag.value.trim().replace(/ +/g, ' ').replace(/’/g, "'");

    if (!normalizedValue) {
        editedIndex = null;
        return;
    }

    // «Мова» і «мова» — той самы тэг, таму параўноўваем без уліку рэгістра.
    // Ранейшая праверка звярала напісанне дакладна і прапускала абодва ў адну картку.
    const alreadyAdded = new_term.tags.find((tag) => tag.toLowerCase() === normalizedValue.toLowerCase());

    if (alreadyAdded) {
        // Моўчкі не дадаць — значыць пакінуць чалавека ў здагадках: поле ачысцілася,
        // а тэг не з'явіўся. Называем тое напісанне, якое ўжо стаіць, каб было бачна,
        // чаму «мова» не дадалася, калі ў картцы «Мова». Паведамленне стаіць
        // адразу пад полем — усплыўшы наверсе экрана, яно глядзелася адарваным.
        showTagNotice(`«${alreadyAdded}» ужо ёсць`);
    } else if (editedIndex === null) {
        new_term.tags.push(normalizedValue);
    } else {
        new_term.tags.splice(editedIndex, 0, normalizedValue);
    }

    editedIndex = null;

    newTag.value = '';
    // Тэг гатовы — пілюля закрываецца назад у плюс. Пустая зялёная пілюля з адным
    // крыжыком чыталася б як памылка, а не як «пішы далей».
    typingTag.value = false;
};

// Сышоў з поля — недапісанае ўсё роўна захоўваем, а поле хаваецца назад пад «плюс».
const handleTagBlur = () => {
    handleAddTag();
    typingTag.value = false;
};

const handleTagsWrapperClick = (event) => {
    // Клік па пустой падкладцы адчыняе поле. А вось клікі па самих тэгах і
    // кнопках усплываюць сюды таксама — і крыжык «перадумаў» тут жа адчыняў
    // поле нанова. Свае справы яны робяць самі.
    if (event.target !== event.currentTarget) {
        return;
    }

    openTagInput();
};
</script>

<style scoped></style>
