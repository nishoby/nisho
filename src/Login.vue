<template>
    <div class="login bcg-purple">
        <h1 class="title title-white">Уваход</h1>
        <el-form
            class="login_form"
            ref="form"
            :model="signInData"
            :rules="rules"
            @submit.prevent="submit"
            label-position="top"
        >
            <button type="reset" class="cross" @click="router.back()"></button>
            <el-form-item label="Лагін" prop="email">
                <el-input
                    class="email_input"
                    name="email"
                    placeholder="Email"
                    id="email_input"
                    v-model="signInData.email"
                />
            </el-form-item>
            <el-form-item label="Пароль" prop="password">
                <el-input
                    class="password_input"
                    type="password"
                    name="password"
                    id="password_input"
                    v-model="signInData.password"
                />
            </el-form-item>

            <router-link class="change-password" :to="{ name: 'restore-password' }"> Не памятаю пароль </router-link>

            <input class="login-submit-btn" type="submit" value="Уваход" :disabled="loading" />

            <div class="divider">
                <div class="divider-line"></div>
                <p>Ці</p>
                <div class="divider-line"></div>
            </div>
            <div class="gmail-registration">
                <img class="gmail-img" style="width: 2rem" src="/assets/img/gmail.svg" alt="" />
                <button class="gmail-registration-btn" type="button" @click="signInWithGoogle">Логін праз Gmail</button>
            </div>
            <div class="account">
                <p>Патрэбны аккаунт?</p>
                <router-link :to="{ name: 'registration' }" class="registration-link"> Рэгістрацыя</router-link>
            </div>
        </el-form>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { reactive, ref } from 'vue';
import { signInWithGoogle, signIn } from './auth.js';
import { ElMessage } from 'element-plus';

const router = useRouter();

const loading = ref(false);
const form = ref();

const rules = reactive({
    email: [
        {
            required: true,
            message: 'Логін павінен быць',
            trigger: 'blur',
        },
    ],
    password: [
        {
            required: true,
            message: 'Пароль павінен быць',
            trigger: 'blur',
        },
    ],
});
const signInData = reactive({
    email: '',
    password: '',
});

const submit = async () => {
    if (!form.value) {
        return;
    }
    await form.value.validate(async (valid) => {
        if (!valid) return;
        loading.value = true;
        try {
            await signIn(signInData.email, signInData.password);
            ElMessage.success('Паспяховая аўтарызацыя');
            await router.push({ name: 'terms' });
        } catch (e) {
            let message = 'Праізашла памылка ў логіцы працы праграммы, не турбуйцеся, вы ўсе зрабілі правільна';
            if (typeof e === 'object' && e.message && e.message === 'Invalid login credentials') {
                message = 'Неверный email ці пароль';
            }
            ElMessage.error(message);
            throw e;
        } finally {
            loading.value = false;
        }
    });
};
</script>

<style scoped></style>
