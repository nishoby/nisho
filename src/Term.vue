<template>
    <navbar></navbar>
    <div class="scene mrgn-t-170px">
        <div class="committee-list size-50 mil-size-100 mil-flex-column is-center" v-if="term">
            <div class="committee-unit mil-flex-column"
                 v-for="item of term.definition">
                <div
                    class="section size-100 pdng-r-20px pdng-l-30px pdng-t-20px pdng-b-20px mil-size-100 mil-pdng-15px">
                    <h2 class="txt-color-1 txt-size-28pxpx txt-medium mil-txt-size-16px">
                        <router-link :to="{'name': 'term', params: {id: term.id}}">
                            {{ term.term }}
                        </router-link>
                    </h2>
                    <div class="txt-color-2 txt-size-18px pdng-t-15px">
                        {{ item.content }}
                    </div>
                    <div class="pdng-t-20px">
                        <el-button-group>
                            <el-button type="success" :icon="Top">0</el-button>
                            <el-button type="danger" :icon="Bottom">0</el-button>
                        </el-button-group>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {useRoute}       from 'vue-router'
import {onMounted, ref} from "vue";
import {supabase}       from "./supabase.js";
import Navbar           from "./Navbar.vue";

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
