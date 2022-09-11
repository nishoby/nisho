<template>
    <navbar></navbar>
    <sidebar></sidebar>
    <div class="scene mrgn-t-130px mil-mrgn-t-80px">
        <div class="committee-list size-70 mil-size-100 mil-flex-column is-center" v-if="term">
            <div class="committee-unit mil-flex-column"
                 v-for="item of term.definition">
                <div
                    class="section size-100 pdng-r-20px pdng-l-30px pdng-t-20px pdng-b-20px mil-size-100 mil-pdng-15px">
                    <h2 class="txt-color-1 txt-size-28pxpx txt-medium mil-txt-size-16px">
                        <router-link :to="{'name': 'term', params: {id: term.id}}">
                            {{ term.name }}
                        </router-link>
                    </h2>
                    <div class="txt-color-2 txt-size-18px pdng-t-15px">
                        {{ item.content }}
                    </div>
                    <div class="txt-color-2 txt-size-18px pdng-t-15px txt-italic">
                        {{ item.example }}
                    </div>
                    <div class="pdng-t-25px">
                        <b>
                            Аўтар: {{ item.user.name }}
                            <span :title="item.created_at">
                                {{ formatDate(item.created_at) }}
                            </span>
                        </b>
                    </div>
                    <div class="pdng-t-20px">
                        <el-button-group>
                            <el-button type="primary"
                                       :icon="Top"
                                       :plain="item.vote_results.length && item.vote_results[0].is_upvoted">
                                {{item.vote_results.length > 0 ? item.vote_results[0].upvotes : 0}}
                            </el-button>
                            <el-button
                                        type="danger"
                                        :plain="item.vote_results.length && item.vote_results[0].is_downvoted"
                                        :icon="Bottom">
                                {{item.vote_results.length > 0 ? item.vote_results[0].downvotes : 0}}
                            </el-button>
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
import {Top, Bottom}    from '@element-plus/icons-vue'
import Sidebar          from "./Sidebar.vue";
import {formatDate}     from "./date.js";

onMounted(async () => {
    const route = useRoute()
    let id      = route.params.id;
    await fetchTerm(id)
})

const term = ref(null)

async function fetchTerm(id) {
    let {data, error} = await supabase
        .from("term")
        .select(`*, definition(*, user:user_profile(*),vote_results(*))`)
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
