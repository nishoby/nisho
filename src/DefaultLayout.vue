<template>
    <header class="header">
        <navbar></navbar>
    </header>
    <main>
        <router-view></router-view>
    </main>
    <footer class="footer">
        <div class="links">
            <div class="social-links">
                <a href="#" class="link">
                    <img src="/assets/img/instagram.svg" alt="">
                </a>
                <a href="#" class="link">
                    <img src="/assets/img/discord.svg" alt="">
                </a>
            </div>
            <div class="about-links">
                <router-link :to="{'name' : 'about'}">Апісанне</router-link>
                <router-link :to="{'name' : 'team'}">Каманда</router-link>
                <router-link :to="{'name' : 'donation'}">Заданаціць</router-link>
                <router-link :to="{'name' : 'contacts'}">Кантакты</router-link>
                <a href="">Гайдлайны</a>
            </div>
        </div>
        {{ year }} NISHO
    </footer>
</template>

<script setup>
import Navbar from "./Navbar.vue";

let year = (new Date()).getUTCFullYear()
</script>

<style scoped>

</style>
