<template>
    <div class="registration bcg-reg">
        <h1 class="title title-white">Аднавіць пароль</h1>
        <el-form
            class="login_form"
            label-position="top"
            ref="form"
            :model="restorePasswordData"
            :rules="rules"
            @submit.prevent="submit"
        >
            <button type="reset" class="cross" @click="router.back()"></button>
            <el-form-item label="Email" prop="email">
                <el-input
                    class="email_input"
                    name="email"
                    placeholder="Email"
                    id="email_input"
                    v-model="restorePasswordData.email"
                />
            </el-form-item>

            <input class="registration-submit-btn" type="submit" value="Адправіць спасылку" :disabled="loading" />
        </el-form>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { reactive, ref } from 'vue';
import { restorePassword } from './auth.js';
import { ElMessage } from 'element-plus';

const router = useRouter();
const account = ref();
const loading = ref(false);
const restorePasswordData = reactive({
    email: '',
});

const rules = reactive({
    email: [
        {
            required: true,
            message: 'Лог павінна быць не меньш 3 сымбалеў',
            trigger: 'blur',
        },
    ],
});
const form = ref();

const submit = async () => {
    if (!form.value) {
        return;
    }
    loading.value = true;
    try {
        const data = await restorePassword(restorePasswordData.email);
        console.log(data);
        ElMessage.success('Адпраўлена спасылка на email');
        await router.push({ name: 'terms' });
    } catch (e) {
        ElMessage.error('Праізашла памылка');
        throw e;
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped></style>
