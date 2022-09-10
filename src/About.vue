<template>
    <navbar></navbar>
    <div class="scene mrgn-t-170px">
        About
    </div>
</template>

<script setup>
import {useRoute}       from 'vue-router'
import {onMounted, ref} from "vue";
import {supabase}       from "./supabase.js";
import Navbar           from "./Navbar.vue";
import {Top, Bottom}    from '@element-plus/icons-vue'

onMounted(async () => {
    const route = useRoute()
    let id      = route.params.id;
    await fetchTerm(id)
})

const term = ref(null)

async function fetchTerm(id) {
    let {data, error} = await supabase
        .from("term")
        .select(`*, definition(*)`)
        .order('created_at', {ascending: false, foreignTable: 'definition'})
        .filter('id', 'eq', id)
        .single()
    if (error) {
        throw error
    }
    term.value = data;
}
</script>

<style scoped>

</style>
