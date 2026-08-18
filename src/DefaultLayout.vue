<template>
    <header class="header" ref="header">
        <navbar></navbar>
    </header>
    <main>
        <router-view></router-view>
    </main>
    <footer class="footer">
        <div class="links">
            <div class="social-links">
                <a href="https://discord.gg/YDyDdJY6" class="link">
                    <img src="/assets/img/discord.svg" alt="" />
                </a>
                <a href="https://www.instagram.com/nisho_slounik/" class="link">
                    <img src="/assets/img/instagram.svg" alt="" />
                </a>
            </div>
            <div class="about-links">
                <router-link :to="{ name: 'about' }">Пра праект</router-link>
                <router-link :to="{ name: 'team' }">Каманда</router-link>
                <router-link :to="{ name: 'donation' }">Заданаціць</router-link>
                <router-link :to="{ name: 'rules' }">Правілы</router-link>
                <router-link :to="{ name: 'bugs' }">Багі</router-link>
                <router-link :to="{ name: 'faq' }">FAQ</router-link>
            </div>
        </div>
        {{ year }} NISHO
    </footer>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import Navbar from './Navbar.vue';

let year = new Date().getUTCFullYear();

const header = ref(null);

// Градыент старонкі расцягнуты на ўсю яе вышыню — чым ніжэй заехаў, тым цяплей.
// Ліпкая шапка малявала б заўсёды адзін і той жа кавалак, і пры пракрутцы пад ёй
// вылазіла б шво. Таму раскладваем фон шапкі на вышыню ўсяго дакумента і
// зрушваем яго ўверх роўна на пракрутку: шапка паказвае тое, што было б пад ёй.
let frame = null;

const syncHeaderBackground = () => {
    if (frame) {
        return;
    }

    frame = requestAnimationFrame(() => {
        frame = null;

        if (!header.value) {
            return;
        }

        header.value.style.backgroundSize = `100% ${document.documentElement.scrollHeight}px`;
        header.value.style.backgroundPosition = `0 ${-window.scrollY}px`;
    });
};

onMounted(() => {
    syncHeaderBackground();
    window.addEventListener('scroll', syncHeaderBackground, { passive: true });
    window.addEventListener('resize', syncHeaderBackground);
});

onUnmounted(() => {
    window.removeEventListener('scroll', syncHeaderBackground);
    window.removeEventListener('resize', syncHeaderBackground);

    if (frame) {
        cancelAnimationFrame(frame);
    }
});
</script>

<style scoped></style>
