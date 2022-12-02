<template>
    <navbar></navbar>
    <sidebar></sidebar>
    <div class="scene pdng-0 mrgn-t-170px mil-mrgn-t-80px pdng-b-50px" style="width: 1200px">
        <template v-if="terms">
            <div class="committee-list size-60 mil-size-100 mil-flex-column is-center">
                <div class="committee-unit mil-flex-column"
                     v-for="item of terms">
                    <div
                        class="section size-100 pdng-r-20px pdng-l-30px pdng-t-20px pdng-b-20px mil-size-100 mil-pdng-15px">
                        <h2 class="txt-color-1 txt-size-28pxpx txt-medium mil-txt-size-16px">
                            <router-link :to="{'name': 'term', params: {id: item.id}}">
                                {{ item.name }}
                            </router-link>
                        </h2>
                        <div class="txt-color-2 txt-size-18px pdng-t-25px">
                            {{ item.definition[0].content }}
                        </div>
                        <div class="txt-color-2 txt-size-18px pdng-t-25px txt-italic">
                            {{ item.definition[0].example }}
                        </div>
                        <div class="pdng-t-25px">
                            <b>
                                Аўтар: {{ item.definition[0].user.name }}
                                <span :title="item.definition[0].created_at">
                                    {{ formatDate(item.definition[0].created_at) }}
                                </span>
                            </b>
                        </div>
                        <div class="pdng-t-25px">
                            <el-button-group>
                                <el-button type="primary"
                                           :icon="Top"
                                           @click="update(item.definition[0], 'upvote')"
                                           :plain="item.definition[0].vote_results.length > 0 && item.definition[0].vote_results[0].is_upvoted">
                                    {{ item.definition[0].vote_results.length > 0 ? item.definition[0].vote_results[0].upvotes : 0 }}
                                </el-button>
                                <el-button
                                    type="danger"
                                    @click="update(item.definition[0], 'downvote')"
                                    :plain="item.definition[0].vote_results.length > 0 && item.definition[0].vote_results[0].is_downvoted"
                                    :icon="Bottom">
                                    {{ item.definition[0].vote_results.length > 0 ? item.definition[0].vote_results[0].downvotes : 0 }}
                                </el-button>
                            </el-button-group>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<script setup>
import {onMounted, ref} from "vue";
import {supabase}       from "./supabase.js";
import {Top, Bottom}    from '@element-plus/icons-vue'
import Navbar           from "./Navbar.vue";
import Sidebar          from "./Sidebar.vue";
import {formatDate}     from "./date.js";
import {vote}           from "./vote.js";

const terms = ref([]);

const update = async (definition, type) => {
    await vote(definition, type)
    await fetchTerms()
}

const fetchTerms = async () => {
    let {data, error} = await supabase
        .from("term")
        .select(`*, definition(*,user:user_profile(*),vote_results(*))`)
        .order('created_at', {ascending: false, foreignTable: 'definition'})
        .limit(1, {foreignTable: 'definition'})
        .limit(20)
    if (error) {
        throw error
    }
    terms.value = data;
}

onMounted(() => {
    fetchTerms()
})

</script>

<style scoped>

</style>
