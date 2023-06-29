<template>
    <div class="main-container container">
        <PageContentSpinner v-if="!definitions" />
        <div v-else class="cards-div">
            <div class="card" v-for="item of definitions">
                <router-link class="card-title" :to="{ name: 'term', params: { id: item.term.id } }">
                    {{ item.term.name }}
                </router-link>
                <div class="card-description">
                    {{ item.content }}
                </div>
                <div class="card-example">
                    {{ item.example }}
                </div>
                <div class="card-tags">
                    <span class="user-tag" v-for="tagItem of item.tags">
                        {{ tagItem.tag.name }}
                    </span>
                    <!--                    <span class="embedded-tag">Tag2</span>-->
                </div>
                <div class="card-info">
                    <router-link
                        :to="{
                            name: 'user-words',
                            params: { id: item.user.user_id },
                        }"
                        class="card-info_link"
                    >
                        {{ item.user.name }}
                    </router-link>
                    <div class="card-info_date">
                        <span :title="item.created_at">
                            {{ formatLongDate(item.created_at) }}
                        </span>
                    </div>
                </div>
                <div class="card-buttons">
                    <div class="card-buttons_actions">
                        <button
                            class="card-buttons-actions_dislike"
                            :class="{
                                'card-buttons-actions_dislike--voted': getVoteResult(item).is_downvoted,
                            }"
                            @click="update(item, 'downvote')"
                        >
                            <icon-dislike />
                        </button>
                        <div class="card-buttons_actions_dislikes-amount">
                            {{ getVoteResult(item).downvotes }}
                        </div>
                        <div class="card-buttons-actions_likes-separator">/</div>
                        <button
                            class="card-buttons-actions_like"
                            :class="{
                                'card-buttons-actions_like--voted': getVoteResult(item).is_upvoted,
                            }"
                            @click="update(item, 'upvote')"
                        >
                            <icon-like />
                        </button>
                        <div class="card-buttons-actions_likes-amount">
                            {{ getVoteResult(item).upvotes }}
                        </div>

                        <router-link
                            class="card-buttons-actions_flag"
                            :to="{ name: 'complaint', query: { id: item.id } }"
                        >
                            <img class="flag-img" src="/assets/img/flag.svg" alt="" />
                        </router-link>
                    </div>
                </div>
            </div>
        </div>

        <div class="pages-list" v-if="count > PAGE_SIZE">
            <el-pagination
                :background="true"
                :current-page="currentPage"
                @update:current-page="onPageChange"
                :page-size="PAGE_SIZE"
                layout="prev, pager, next"
                :total="count"
                :pager-count="4"
            />
        </div>
    </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { supabase } from './supabase.js';
import { formatLongDate } from './date.js';
import { vote, getVoteResult } from './vote.js';
import { getUser } from './auth.js';
import IconDislike from './icons/IconDislike.vue';
import IconLike from './icons/IconLike.vue';
import PageContentSpinner from './PageContentSpinner.vue';

const PAGE_SIZE = 15;
const route = useRoute();
const id = route.params.id;

onMounted(async () => {
    await fetchTerm();
});

const currentPage = ref(1);
const onPageChange = async (page) => {
    currentPage.value = page;
    await fetchTerm();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

const account = ref();
const update = async (definition, type) => {
    if (!account.value) {
        ElMessage.warning('Каб прагаласаваць, вам трэба залагініцца');
        return;
    }

    await vote(definition, type);
    await fetchTerm();
};

const definitions = ref(null);
const count = ref(0);

async function fetchTerm() {
    //TODO handle term not found
    let {
        data,
        error,
        count: definitionsCount,
    } = await supabase
        .from('definition')
        .select(`*,term(*),user:user_profile(*),vote_results(*),tags:definition_tag(tag(*))`, {
            count: 'exact',
        })
        .order('created_at', { ascending: false })
        .filter('term_id', 'eq', id)
        .range((currentPage.value - 1) * PAGE_SIZE, currentPage.value * PAGE_SIZE - 1);

    if (error) {
        throw error;
    }
    definitions.value = data;
    count.value = definitionsCount;
}
onMounted(async () => {
    account.value = await getUser();
});
</script>

<style scoped></style>
