<template>
    <div class="main-container container">
        <div class="cards-div">
            <div class="card" v-for="item of terms">
                <router-link class="card-title" :to="{'name': 'term', params: {id: item.id}}">
                    {{ item.name }}
                </router-link>
                <div class="card-description">
                    {{ item.definition[0].content }}
                </div>
                <div class="card-example">
                    {{ item.definition[0].example }}
                </div>
                <div class="card-tags" v-if="false">
                    <span class="user-tag">Tag1</span>
                    <span class="embedded-tag">Tag2</span>
                </div>
                <div class="card-info">

                    <a class="card-info_link">
                        {{ item.definition[0].user.name }}
                    </a>
                    <div class="card-info_date">
                        <span :title="item.definition[0].created_at">
                            {{ formatDate(item.definition[0].created_at) }}
                        </span>
                    </div>
                </div>
                <div class="card-buttons">
                    <div class="card-buttons_actions">
                        <!--                        TODO нужен статус для обозначения, что сам пользователь пролайкал-->
                        <button @click="update(item.definition[0], 'downvote')" class="card-buttons-actions_dislike">
                            <img class="dislike-img" src="/assets/img/dislike.svg" alt="">
                        </button>
                        <div class="dislikes-amount">
                            {{ getVoteResult(item.definition[0]).downvotes }}
                        </div>
                        /
                        <button class="card-buttons-actions_like" @click="update(item.definition[0], 'upvote')">
                            <img class="like-img" src="/assets/img/like.svg" alt="">
                        </button>
                        <div class="likes-amount">
                            {{ getVoteResult(item.definition[0]).upvotes }}
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
import {onMounted, ref}      from "vue";
import {supabase}            from "./supabase.js";
import {formatDate}          from "./date.js";
import {vote, getVoteResult} from "./vote.js";
import {getUser}             from "./user.js";
import {ElMessage}           from "element-plus";

const terms       = ref([]);
const count       = ref(0)
const account     = ref(getUser())

const update = async (definition, type) => {
    if (!account.value) {
        ElMessage.warning('Каб прагаласаваць, вам трэба залагініцца');
        return;
    }

    await vote(definition, type)
    await fetchTerms()
    await fetchCount()
}

const currentPage = ref(1)
const onPageChange = async (page) => {
    currentPage.value = page;
    await fetchTerms()
}

const fetchTerms = async () => {
    //TODO сделать view вместо выборки
    let {data, error} = await supabase
        .from("term")
        .select(`*, definition(*,user:user_profile(*),vote_results(*))`)
        .order('created_at', {ascending: false, foreignTable: 'definition'})
        .limit(1, {foreignTable: 'definition'})
        .range((currentPage.value - 1) * 15, (currentPage.value * 15) - 1)

    if (error) {
        throw error
    }
    terms.value = data.filter((t) => t.definition.length > 0);
}

async function fetchCount() {
    let {count: data, error} = await supabase
        .from("term")
        .select(`*`, {count: 'exact', head: true})
    if (error) {
        throw error
    }
    count.value = data;
}

onMounted(async () => {
    await fetchTerms()
    await fetchCount()
})

</script>

<style scoped>

</style>
<style>
:root {
    --el-color-primary: #D6FB89;
    --el-color-white: black;
}

</style>
