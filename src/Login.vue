<template>
    <div class="login bcg-purple">
        <h1 class="title title-white">Уваход</h1>
        <el-form class="login_form" ref="form" :model="signInData" @submit.prevent label-position="top">
            <button type="reset" class="cross" @click="router.back()"></button>
            <el-form-item label="Лагін" prop="login">
                <el-input
                    class="login_input"
                    name="login"
                    placeholder="Лагін"
                    id="login_input"
                    v-model="signInData.login"
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

            <a class="change-password" href="#">Не памятаю пароль</a>

            <input class="login-submit-btn" type="submit" value="Уваход" />

            <div class="divider">
                <div class="divider-line"></div>
                <p>Ці</p>
                <div class="divider-line"></div>
            </div>
            <div class="gmail-registration">
                <img class="gmail-img" style="width: 2rem" src="/assets/img/gmail.svg" alt="" />
                <button class="gmail-registration-btn" type="button" @click="signInWithGoogle">
                    Логін праз Gmail
                </button>
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
import { reactive } from 'vue';
import { signInWithGoogle } from './auth.js';

const router = useRouter();

const signInData = reactive({
    login: '',
    password: '',
});
</script>

<style scoped></style>
