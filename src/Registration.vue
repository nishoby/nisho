<template>
    <div class="registration bcg-reg">
        <h1 class="title title-white">
            <a class="back-btn" href="">
                <img src="/public/assets/img/back.svg" alt="" />
            </a>
            Рэгістрацыя
        </h1>
        <form class="registration_form" action="">
            <button type="reset" class="cross" @click="router.back()"></button>
            <label class="login_label" for="login">Лагін</label>
            <input class="login_input" type="" name="login" placeholder="лагін" />
            <label class="login_label" for="password">Пароль</label>

            <div class="password-wrapper login_input">
                <input class="password_input" type="password" name="password" />
                <button class="hide-password-btn" type="button">
                    <img src="./assets/img/eye.svg" alt="" class="eye-pswrd" />
                </button>
            </div>

            <label class="login_label email_label" for="mail">Электронная пошта</label>
            <input class="login_input" type="" name="mail" placeholder="e-mail" />

            <input class="registration-submit-btn" type="submit" value="Зарэгістравацца" />
            <div class="horiz-line"><p>Ці</p></div>

            <div class="gmail-registration">
                <img class="gmail-img" style="width: 2rem" src="./assets/img/gmail.svg" alt="" />
                <button class="gmail-registration-btn" type="submit" value="">рэгістрацыя праз Gmail</button>
            </div>

            <div class="account">
                <p>Ужо ёсць аккаунт?</p>
                <router-link :to="{ name: 'login' }" class="registration-link"> Уваход </router-link>
            </div>
        </form>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
</script>

<style scoped></style>
