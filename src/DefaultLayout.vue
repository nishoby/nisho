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
                <a href="">Пра нас</a>
                <a href="">Гайдлайны</a>
            </div>
        </div>
        @2022 Nisho
    </footer>
</template>

<script setup>
import Navbar from "./Navbar.vue";
</script>

<style scoped>

</style>
