<template>
    <h1 class="title">Рэдагаваць слова</h1>
    <PageContentSpinner v-if="!definition" page-theme="green" />
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
            перад тым як даваць новае слова ці яго тлумачэнне.
        </p>
        <el-form-item label="Слова:" prop="term_name">
            <el-input v-model="new_term.term_name" disabled />
        </el-form-item>
        <el-form-item label="Тлумачэнне:" prop="definition">
            <el-input v-model="new_term.definition" type="textarea" :rows="5" />
        </el-form-item>
        <el-form-item label="Прыклад:" prop="example">
            <el-input v-model="new_term.example" type="textarea" :rows="5" />
        </el-form-item>
        <el-form-item label="Тэгі:" prop="tags">
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
                    {{ tag }}
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
                <el-input
                    v-model="newTag"
                    ref="newTagInput"
                    size="large"
                    class="add-word__tags-input"
                    @input="refreshTagHint"
                    @keydown.enter.prevent="handleAddTag"
                    @blur="handleAddTag"
                />
            </div>
        </el-form-item>
        <input class="submit-btn" type="submit" value="Гатова" :disabled="loading" />
    </el-form>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { supabase } from './supabase.js';
import { ElMessage } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';
import { getUser } from './auth.js';
import PageContentSpinner from './PageContentSpinner.vue';
import { commonError } from './error.js';

const router = useRouter();
const newTag = ref('');
const newTagInput = ref();

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
const form = ref();
const account = ref();

onMounted(async () => {
    account.value = await getUser();

    await fetchDefinition();
});

const route = useRoute();
const definition_id = route.query.id;
const definition = ref(null);

async function fetchDefinition() {
    const { data, error } = await supabase
        .from('definition')
        .select(`*, term(*), tags:definition_tag(tag(*))`)
        .filter('id', 'eq', definition_id)
        .single();

    if (error) {
        throw error;
    }

    if (data.user_id !== account.value.id) {
        ElMessage.warning('Вы не можаце рэдагаваць гэтае слова');
        await router.back();
        return;
    }

    definition.value = data;
    new_term.term_name = data.term.name;
    new_term.definition = data.content;
    new_term.example = data.example;
    new_term.tags = Array.isArray(data.tags) ? data.tags.map((i) => i.tag.name) : [];
}

const submit = async () => {
    if (!form.value) {
        return;
    }
    loading.value = true;

    await form.value.validate(async (valid) => {
        if (!valid) return;

        try {
            let { error } = await supabase.rpc('edit_term', {
                definition_id,
                definition: new_term.definition,
                example: new_term.example,
                tags: new_term.tags,
            });
            loading.value = false;
            if (error) {
                throw error;
            }
            ElMessage.success('Паспяхова адрэдагаваны тэрмін');
            await router.back();
        } catch (error) {
            ElMessage.error(commonError);
            throw error;
        }
    });
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
    const normalizedValue = newTag.value.trim().replace(/ +/g, ' ');

    if (!normalizedValue) return;

    // «Мова» і «мова» — той самы тэг, таму параўноўваем без уліку рэгістра.
    // Ранейшая праверка звярала напісанне дакладна і прапускала абодва ў адну картку.
    const alreadyAdded = new_term.tags.find((tag) => tag.toLowerCase() === normalizedValue.toLowerCase());

    if (alreadyAdded) {
        // Моўчкі не дадаць — значыць пакінуць чалавека ў здагадках: поле ачысцілася,
        // а тэг не з'явіўся. Называем тое напісанне, якое ўжо стаіць, каб было бачна,
        // чаму «мова» не дадалася, калі ў картцы «Мова».
        ElMessage.info(`«${alreadyAdded}» ужо ёсць`);
    } else {
        new_term.tags.push(normalizedValue);
    }

    newTag.value = '';
    newTagInput.value.input.focus();
};

const handleTagsWrapperClick = () => {
    newTagInput.value.input.focus();
};
</script>

<style scoped></style>
