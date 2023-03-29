<template>
    <h1 class="title">Дадаць слова</h1>
    <el-form
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
            <el-input v-model="new_term.term_name" />
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
import { reactive, ref } from 'vue';
import { supabase } from './supabase.js';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { getUser } from './auth.js';

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
const submit = async () => {
    if (!form.value) {
        return;
    }
    if (!account.value) {
        ElMessage.warning('Каб дадаць слова, вам трэба залагініцца');
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
