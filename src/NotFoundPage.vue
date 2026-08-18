<template>
    <div class="error-wrapper">
        <!-- бачная толькі на мабільным (base: display none, <=650: inline) -->
        <button class="back-btn back-btn--error" type="button" aria-label="Назад" @click="router.back()">
            <img src="/assets/img/back-black.svg" alt="" />
        </button>
        <p class="error-title">Памылка 404</p>
        <p class="error-caption">
            Старонка не знойдзена...
            <br />
            <router-link :to="{ name: 'terms' }" class="error-link"> вярнуцца да словаў </router-link>
        </p>
        <img class="error-img" src="/assets/img/goat.png" alt="" />
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();
</script>
