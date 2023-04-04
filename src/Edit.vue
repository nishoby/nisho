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
            <router-link :to="{ name: 'rules' }" target="_blank">гайдлайны</router-link>
            перад тым як даваць новаe слова ці яго тлумачэнне.
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
                <el-input
                    v-model="newTag"
                    ref="newTagInput"
                    size="large"
                    class="add-word__tags-input"
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
const rules = reactive({
    term_name: [
        {
            required: true,
            message: 'Слова павінна быць не меньш 3 сымбалеў',
            trigger: 'blur',
        },
        {
            min: 3,
            message: 'Слова павінна быць не меньш 3 сымбалеў',
            trigger: 'blur',
        },
    ],
    definition: [
        {
            required: true,
            message: 'Павінна быць змястоўнае тлумачэнне',
            trigger: 'blur',
        },
        {
            min: 10,
            message: 'Павінна быць змястоўнае тлумачэнне',
            trigger: 'blur',
        },
    ],
    example: [
        {
            required: true,
            message: 'Павінен быць змястоўны прыклад',
            trigger: 'blur',
        },
        { min: 10, message: 'Павінен быць змястоўны прыклад', trigger: 'blur' },
    ],
});
const form = ref();
const account = ref(getUser());

onMounted(async () => {
    if (!account.value) {
        await router.back();
        return;
    }

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
            ElMessage.error('Адбылася памылка');
            throw error;
        }
    });
};

const handleRemoveTag = (tag) => {
    new_term.tags.splice(new_term.tags.indexOf(tag), 1);
};

const handleAddTag = () => {
    const normalizedValue = newTag.value.trim();

    if (!normalizedValue) return;

    if (normalizedValue && !new_term.tags.includes(normalizedValue)) {
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
