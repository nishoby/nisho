import { computed, ref } from 'vue';
import { supabase } from './supabase.js';
import { getUser } from './auth.js';

// Лексіка 18+.
//
// Пазнака — гэта тэгі, а не асобнае поле ў базе: словы ўжо носяць «мацюкі»,
// «сэкс» і «эратычнае», аўтар ставіць тэг пры дадаванні, а мадэратарка можа
// павесіць яго на любое чужое слова (права з кроку 2). Спісы жывуць тут і
// папаўняюцца адным радком.
//
// Дзве кучкі, бо мацюкі і сэкс — розныя рэчы: каму гідкая лаянка, той не
// абавязкова хавае размову пра цела. Кожная са сваім перамыкачом, і галоўнага
// над імі няма: ён нічога не вырашаў сам, толькі стаяў лішнім крокам паміж
// чалавекам і тым, што той хоча ўключыць.
//
// Трэцяй, «гвалт», тут наўмысна няма. Мат — уласцівасць самога слова, сэкс —
// вузкае значэнне, а гвалт вызначаецца праз тое, што слова апісвае, і мяжа
// расплываецца на пераносных ужываннях («забіў час»). Ды і сама назва
// двухсэнсоўная: па-беларуску гвалт — і насілле, і крык. Катэгорыя, якую аўтары
// пазначаюць па-рознаму, робіць перамыкач нядзейсным, а разам з ім падрывае
// давер і да двух спраўных. Вернемся, калі напішам ёй адназначнае правіла.
// «Мацюкі» — беларуская назва; «мат» пакінуты побач наўмысна: ён калька з
// рускай, але ўжо стаіць на словах у базе, і хтось напіша яго рукамі па
// звычцы. Абодва вядуць да аднаго перамыкача, і слова не згубіцца.
const MAT_TAGS = new Set(['мацюкі', 'мацюк', 'мат']);
// «Секс» праз «е» — рускае напісанне, але ў базе такі тэг ёсць і словы на ім
// вісяць; без яго перамыкач іх бы не бачыў. Той жа выпадак, што і «мат».
//
// «Эратычнае» і «18+» тут жа, разам з «сэксам», і гэта не спрашчэнне дзеля
// коду: калі мадэратарка ставіць голы «18+», не ўдакладняючы, гэта амаль
// заўсёды лёгкая эротыка. Значыць і хавацца яно мусіць тым жа перамыкачом, што
// і сэкс, — іначай той, хто выключыў сэкс, працягваў бы бачыць акурат такія
// словы. «Эратычнае» ў слоўніку ўжо было і азначае тое самае, толькі кажа гэта
// словам, а не лічбай.
const SEX_TAGS = new Set(['сэкс', 'секс', 'эратычнае', '18+']);

const clean = (tags) => (tags || []).map((tag) => String(tag).trim().toLowerCase());

// Па змаўчанні абедзве катэгорыі ўключаныя: слоўнік жывой мовы паказвае мову
// такой, якая яна ёсць, а хто не хоча — выключае. Схаваць па змаўчанні значыла б
// вырашыць за чалавека і схаваць ад яго палову слоўніка моўчкі.
// Выбар жыве ў двух месцах: у браўзеры (працуе адразу і без уваходу) і ў
// профілі ўліковага запісу (пераязджае з прыладай). localStorage можа быць
// недаступны (прыватны рэжым) — тады проста дэфолт.
const KEYS = { mat: 'nisho-18plus-mat', sex: 'nisho-18plus-sex' };

const read = (key) => {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
};

const showMat = ref(read(KEYS.mat) !== 'off');
const showSex = ref(read(KEYS.sex) !== 'off');

// Ці трэба наогул нешта адсяваць — ад гэтага залежыць, як будуецца спіс слоў
const adultFilterOn = computed(() => !showMat.value || !showSex.value);

// Ці хаваць гэтае слова. Правіла адно: слова відаць, калі хоць адна яго
// дарослая пазнака зараз уключаная.
function hiddenByAdult(tags) {
    const list = clean(tags);
    const mat = list.some((tag) => MAT_TAGS.has(tag));
    const sex = list.some((tag) => SEX_TAGS.has(tag));

    // не дарослае зусім — паказваем заўсёды
    if (!mat && !sex) {
        return false;
    }

    if (mat && showMat.value) {
        return false;
    }

    if (sex && showSex.value) {
        return false;
    }

    return true;
}

// Прыехаўшы на новую прыладу, чалавек не мусіць наладжваць сайт нанова:
// пытаемся ў профілю. Ціха і не чакаючы.
(async () => {
    const user = await getUser();
    const saved = user?.user_metadata;

    if (!saved) {
        return;
    }

    if (typeof saved.show_adult_mat === 'boolean') {
        showMat.value = saved.show_adult_mat;
    }

    if (typeof saved.show_adult_sex === 'boolean') {
        showSex.value = saved.show_adult_sex;
    }
})();

async function remember(key, value, field) {
    try {
        localStorage.setItem(key, value ? 'on' : 'off');
    } catch {
        // няма сховішча — выбар пражыве да перазагрузкі, гэта не паломка
    }

    const user = await getUser();

    if (user) {
        try {
            await supabase.auth.updateUser({ data: { [field]: value } });
        } catch (error) {
            console.error(error);
        }
    }
}

async function setShowMat(value) {
    showMat.value = value;
    await remember(KEYS.mat, value, 'show_adult_mat');
}

async function setShowSex(value) {
    showSex.value = value;
    await remember(KEYS.sex, value, 'show_adult_sex');
}

export { showMat, showSex, setShowMat, setShowSex, hiddenByAdult, adultFilterOn };
