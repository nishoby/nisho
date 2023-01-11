<template>
    <div class="scene mrgn-t-130px">
        <router-link :to="{name: 'terms'}">
            <el-button>Вярнуцца</el-button>
        </router-link>
        About
    </div>
</template>

<script setup>
import {useRoute}       from 'vue-router'
import {onMounted, ref} from "vue";
import {supabase}       from "./supabase.js";
import Navbar           from "./Navbar.vue";

onMounted(async () => {
})

const term = ref(null)

</script>

<style scoped>

</style>
