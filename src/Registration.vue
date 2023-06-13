<template>
    <div class="registration bcg-reg">
        <h1 class="title title-white">Рэгістрацыя</h1>
        <el-form class="login_form" label-position="top" ref="form" :rules="rules" @submit.prevent="submit">
            <button type="reset" class="cross" @click="router.back()"></button>
            <el-form-item label="Email" prop="email">
                <el-input
                    class="email_input"
                    name="email"
                    placeholder="Email"
                    id="email_input"
                    v-model="signUpData.email"
                />
            </el-form-item>
            <el-form-item label="Лагін" prop="login">
                <el-input name="login" placeholder="Лагін" id="login_input" v-model="signUpData.login" />
            </el-form-item>
            <el-form-item label="Пароль" prop="password">
                <el-input
                    class="password_input"
                    type="password"
                    name="password"
                    id="password_input"
                    v-model="signUpData.password"
                />
            </el-form-item>
            <el-form-item label="Паўторна пароль" prop="password">
                <el-input
                    class="password_input"
                    type="password"
                    name="password_repeat"
                    id="password_repeat_input"
                    v-model="signUpData.password_repeat"
                />
            </el-form-item>

            <input class="registration-submit-btn" type="submit" value="Зарэгістравацца" :disabled="loading" />
            <div class="horiz-line"><p>Ці</p></div>

            <div class="gmail-registration">
                <img class="gmail-img" style="width: 2rem" src="/assets/img/gmail.svg" alt="" />
                <button class="gmail-registration-btn" type="button" @click="signInWithGoogle">Логін праз Gmail</button>
            </div>

            <div class="account">
                <p>Ужо ёсць аккаунт?</p>
                <router-link :to="{ name: 'login' }" class="registration-link"> Уваход</router-link>
            </div>
        </el-form>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { reactive, ref } from 'vue';
import { signInWithGoogle, signUp } from './auth.js';
import { ElMessage } from 'element-plus';
import { commonError } from './error.js';

const router = useRouter();
const account = ref();
const loading = ref(false);
const signUpData = reactive({
    login: '',
    email: '',
    password: '',
    password_repeat: '',
});

const rules = reactive({
    term_name: [
        {
            required: true,
            message: 'Лог павінна быць не меньш 3 сымбалеў',
            trigger: 'blur',
        },
        {
            min: 3,
            message: 'Логін павінен быць не меньш 3 сымбалеў',
            trigger: 'blur',
        },
        {
            max: 25,
            message: 'Логін павінна быць не меньш 25 сымбалеў',
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
        await signUp(signUpData.email, signUpData.password, signUpData.login);
        ElMessage.error('Вы зарэгістраваліся! Перайдзіце па спасылцы ў лісце на сваім паштовай скрыні');
        await router.push({ name: 'terms' });
    } catch (e) {
        ElMessage.error(commonError);
        throw e;
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped></style>
