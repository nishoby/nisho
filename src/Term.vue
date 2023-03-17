<template>
    <div class="main-container container">
        <div class="cards-div" v-if="term">
            <div class="card" v-for="item of term.definition">
                <router-link class="card-title" :to="{'name': 'term', params: {id: term.id}}">
                    {{ term.name }}
                </router-link>
                <div class="card-description">
                    {{ item.content }}
                </div>
                <div class="card-example">
                    {{ item.example }}
                </div>
                <div class="card-tags" v-if="false">
                    <span class="user-tag">Tag1</span>
                    <span class="embedded-tag">Tag2</span>
                </div>
                <div class="card-info">
                    <a class="card-info_link">
                        {{ item.user.name }}
                    </a>
                    <div class="card-info_date">
                        <span :title="item.created_at">
                            {{ formatDate(item.created_at) }}
                        </span>
                    </div>
                </div>
                <div class="card-buttons">
                    <div class="card-buttons_actions">
                        <button
                            class="card-buttons-actions_dislike"
                            :class="{'card-buttons-actions_dislike--voted': getVoteResult(item).is_downvoted}"
                            @click="update(item, 'downvote')">
                            <icon-dislike />
                        </button>
                        <div class="dislikes-amount">
                            {{ getVoteResult(item).downvotes }}
                        </div>

                        <button
                            class="card-buttons-actions_like"
                            :class="{'card-buttons-actions_like--voted': getVoteResult(item).is_upvoted}"
                            @click="update(item, 'upvote')">
                            <icon-like />
                        </button>
                        <div class="likes-amount">
                            {{ getVoteResult(item).upvotes }}
                        </div>

                        <router-link class="card-buttons-actions_flag" :to="{name: 'complain', query: {id: item.id}}">
                            <img class="flag-img" src="/assets/img/flag.svg" alt="">
                        </router-link>
                    </div>
                </div>
            </div>
        </div>
        <div class="pages-list" v-if="count > 15">
            <el-pagination
                :background="true"
                :current-page="currentPage"
                @update:current-page="onPageChange"
                :page-size="15"
                layout="prev, pager, next"
                :total="count"
            />
        </div>
    </div>
</template>

<script setup>
import {useRoute}            from 'vue-router'
import {onMounted, ref}      from "vue";
import {ElMessage}           from "element-plus";
import {supabase}            from "./supabase.js";
import {formatDate}          from "./date.js";
import {vote, getVoteResult} from './vote.js';
import {getUser}             from "./user.js";
import IconDislike           from "./icons/IconDislike.vue";
import IconLike              from "./icons/IconLike.vue";

const route = useRoute()
const id    = route.params.id;

onMounted(
    async () => {
        await fetchTerm()
        await fetchCount()
    }
)

const currentPage = ref(1)
const onPageChange = async (page) => {
    currentPage.value = page;
    await fetchTerm()
}

const account = ref(getUser())
const update = async (definition, type) => {
    if (!account.value) {
        ElMessage.warning('Каб прагаласаваць, вам трэба залагініцца');
        return;
    }

    await vote(definition, type)
    await fetchTerm()
    await fetchCount()
}

const term   = ref(null)
const count  = ref(0)

async function fetchTerm() {

    let {data, error} = await supabase
        .from("term")
        .select(`*, definition(*, user:user_profile(*),vote_results(*))`, {count: 'exact'})
        .order('created_at', {ascending: false, foreignTable: 'definition'})
        .filter('id', 'eq', id)
        .single()

    if (error) {
        throw error
    }
    term.value = data;
}

async function fetchCount() {
    let {count: data, error} = await supabase
        .from("definition")
        .select(`*`, {count: 'exact', head: true})
        .filter('term_id', 'eq', id)

    if (error) {
        throw error
    }
    count.value = data;
}
</script>

<style scoped>

</style>
