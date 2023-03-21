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
                <div class="card-tags">
                    <span class="user-tag" v-for="tagItem of item.definition[0].tags">
                        {{ tagItem['tag']['name'] }}
                    </span>
                    <!--                    <span class="embedded-tag">Tag2</span>-->
                </div>
                <div class="card-info">
                    <router-link :to="{name: 'user-words', params: {id: item.definition[0].user.user_id}}"
                                 class="card-info_link">
                        {{ item.definition[0].user.name }}
                    </router-link>
                    <div class="card-info_date">
                        <span :title="item.definition[0].created_at">
                            {{ formatLongDate(item.definition[0].created_at) }}
                        </span>
                    </div>
                </div>
                <div class="card-buttons">
                    <div class="card-buttons_actions">
                        <button
                            class="card-buttons-actions_dislike"
                            :class="{'card-buttons-actions_dislike--voted': getVoteResult(item.definition[0]).is_downvoted}"
                            @click="update(item.definition[0], 'downvote')">
                            <icon-dislike/>
                        </button>
                        <div class="dislikes-amount">
                            {{ getVoteResult(item.definition[0]).downvotes }}
                        </div>
                        <button
                            class="card-buttons-actions_like"
                            :class="{'card-buttons-actions_like--voted': getVoteResult(item.definition[0]).is_upvoted}"
                            @click="update(item.definition[0], 'upvote')">
                            <icon-like/>
                        </button>
                        <div class="likes-amount">
                            {{ getVoteResult(item.definition[0]).upvotes }}
                        </div>

                        <router-link class="card-buttons-actions_flag" :to="{name: 'complain', query: {id: item.definition[0].id}}">
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
import {onMounted, ref}      from "vue";
import {ElMessage}           from "element-plus";
import {supabase}            from "./supabase.js";
import {formatLongDate}      from "./date.js";
import {vote, getVoteResult} from "./vote.js";
import {getUser}             from "./user.js";
import IconDislike           from "./icons/IconDislike.vue";
import IconLike              from "./icons/IconLike.vue";

const terms   = ref([]);
const count   = ref(0)
const account = ref(getUser())

const update = async (definition, type) => {
    if (!account.value) {
        ElMessage.warning('Каб прагаласаваць, вам трэба залагініцца');
        return;
    }

    await vote(definition, type)
    await fetchTerms()
    await fetchCount()
}

const currentPage  = ref(1)
const onPageChange = async (page) => {
    currentPage.value = page;
    await fetchTerms()
}

const fetchTerms = async () => {
    //TODO сделать view вместо выборки
    let {data, error} = await supabase
        .from("term")
        .select(`*, definition(*,user:user_profile(*),vote_results(*),tags:definition_tag(tag(*)))`)
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
