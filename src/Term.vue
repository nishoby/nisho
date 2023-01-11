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
                        <!--                        TODO нужен статус для обозначения, что сам пользователь пролайкал-->
                        <button @click="update(item, 'upvote')" class="card-buttons-actions_dislike">
                            <img class="dislike-img" src="/assets/img/dislike.svg" alt="">
                        </button>
                        <div class="dislikes-amount">
                            {{ item.vote_results.length > 0 ? item.vote_results[0].downvotes : 0 }}
                        </div>
                        /
                        <button class="card-buttons-actions_like" @click="update(item, 'downvote')">
                            <img class="like-img" src="/assets/img/like.svg" alt="">
                        </button>
                        <div class="likes-amount">
                            {{ item.vote_results.length > 0 ? item.vote_results[0].upvotes : 0 }}
                        </div>

                        <button class="card-buttons-actions_flag">
                            <img class="flag-img" src="/assets/img/flag.svg" alt="">
                        </button>
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
import {useRoute}       from 'vue-router'
import {onMounted, ref} from "vue";
import {supabase}       from "./supabase.js";
import {formatDate}     from "./date.js";
import {vote}           from './vote.js'

const route = useRoute()
let id      = route.params.id;

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

const update = async (definition, type) => {
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
<style>
:root {
    --el-color-primary: #D6FB89;
    --el-color-white: black;
}

</style>
