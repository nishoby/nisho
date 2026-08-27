<template>
    <div class="registration bcg-reg">
        <h1 class="title title-white">
            <button class="back-btn" type="button" aria-label="Назад" @click="router.back()">
                <img src="/assets/img/back.svg" alt="" /></button
            >Змена пароля
        </h1>
        <el-form class="login_form" label-position="top" ref="form" :rules="rules" @submit.prevent="submit">
            <button type="reset" class="cross" @click="router.back()"></button>
            <el-form-item label="Пароль" prop="password">
                <PasswordInput
                    class="password_input"
                    name="password"
                    id="password_input"
                    v-model="newPasswordData.password"
                />
            </el-form-item>
            <el-form-item label="Паўторна пароль" prop="password">
                <PasswordInput
                    class="password_input"
                    name="password_repeat"
                    id="password_repeat_input"
                    v-model="newPasswordData.password_repeat"
                />
            </el-form-item>

            <input class="registration-submit-btn" type="submit" value="Захаваць" :disabled="loading" />
        </el-form>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { reactive, ref } from 'vue';
import PasswordInput from './PasswordInput.vue';
import { setPassword } from './auth.js';
import { ElMessage } from 'element-plus';
import { commonError } from './error.js';

const router = useRouter();
const loading = ref(false);
const newPasswordData = reactive({
    password: '',
    password_repeat: '',
});

// Шэсць знакаў — не наша прыдумка, а мінімум самога Supabase. Пісаць сваю
// лічбу няма сэнсу: карацейшы пароль база ўсё роўна не прыме, і чалавек
// даведаўся б пра гэта ўжо пасля націску.
const rules = reactive({
    password: [
        { required: true, message: 'Прыдумай пароль', trigger: 'blur' },
        { min: 6, message: 'Не менш за шэсць знакаў', trigger: 'blur' },
    ],
});
const form = ref();

const submit = async () => {
    if (!form.value) {
        return;
    }

    await form.value.validate(async (valid) => {
        if (!valid) {
            return;
        }

        // Два аднолькавыя палі і ёсць уся праверка: чалавек не бачыць, што
        // друкуе, і памылка ў пароле выявілася б толькі пры наступным уваходзе.
        // Цяпер, праўда, пароль можна і паказаць — але поле для паўтору
        // застаецца, бо паказваць яго будуць не заўсёды.
        if (newPasswordData.password !== newPasswordData.password_repeat) {
            ElMessage.error('Паролі не супадаюць');
            return;
        }

        loading.value = true;

        try {
            await setPassword(newPasswordData.password);
            ElMessage.success('Пароль зменены');
            await router.push({ name: 'terms' });
        } catch (e) {
            const said = String(e?.message || '').toLowerCase();

            // Спасылка з ліста жыве не вечна, і без сесіі мяняць няма каму.
            if (said.includes('session') || said.includes('jwt') || said.includes('not authenticated')) {
                ElMessage.error('Спасылка састарэла. Запытай новы ліст праз «Не памятаю пароль»');
            } else if (said.includes('should be at least') || said.includes('password')) {
                ElMessage.error('Такі пароль не падыходзіць — паспрабуй даўжэйшы');
            } else {
                ElMessage.error(commonError);
            }

            throw e;
        } finally {
            loading.value = false;
        }
    });
};
</script>

<style scoped></style>
