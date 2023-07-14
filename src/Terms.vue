<template>
    <div class="main-container container">
        <div class="sort-settings">
            <span class="all-words-title">Сартыроўка:</span>
            <el-select v-model="sort" placeholder="Сартыроўка">
                <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
        </div>
        <PageContentSpinner v-if="!terms" />
        <div v-else class="cards-div">
            <div v-if="searchQuery && !terms.length" class="terms__not-found-card">
                Нічога не знойдзена для запыту <span class="terms__search-query">{{ searchQuery }}</span>
            </div>

            <div class="card" v-for="item of terms" :key="item.definition_id">
                <router-link class="card-title" :to="{ name: 'term', params: { id: item.term_id } }">
                    {{ item.term }}
                </router-link>
                <div class="card-description">
                    {{ item.definition }}
                </div>
                <div class="card-example">
                    {{ item.example }}
                </div>
                <div class="card-tags">
                    <span class="user-tag" v-for="tag of item.tags">
                        {{ tag }}
                    </span>
                    <!-- <span class="embedded-tag">Tag2</span> -->
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
                            :to="{
                                name: 'complaint',
                                query: { id: item.definition_id },
                            }"
                        >
                            <img class="flag-img" src="/assets/img/flag.svg" alt="" />
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
                :pager-count="4"
                layout="prev, pager, next"
                :total="count"
            />
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { supabase } from './supabase.js';
import { formatLongDate } from './date.js';
import { vote, getVoteResult } from './vote.js';
import { getUser } from './auth.js';
import IconDislike from './icons/IconDislike.vue';
import IconLike from './icons/IconLike.vue';
import PageContentSpinner from './PageContentSpinner.vue';

const options = [
    {
        value: 'last',
        label: 'Апошнія дададзеныя',
    },
    {
        value: 'first',
        label: 'Першыя дадазеныя',
    },
    {
        value: 'random',
        label: 'Выпадковыя словы',
    },
];

const router = useRouter();
const route = useRoute();
const searchQuery = route.query.poshuk?.trim();
const terms = ref(null);
const count = ref(0);
const account = ref();
const sort = ref('last');

const update = async (definition, type) => {
    if (!account.value) {
        ElMessage.warning('Каб прагаласаваць, вам трэба залагініцца');
        return;
    }

    await vote(definition, type);
    await fetchTerms();
};

const currentPage = ref(1);
const onPageChange = async (page) => {
    currentPage.value = page;
    await fetchTerms();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

const fetchTerms = async () => {
    //TODO сделать view вместо выборки
    let queryBuilder = supabase
        .from(sort.value === 'random' ? 'terms_random' : 'terms')
        .select(`*`, { count: 'exact' })
        .range((currentPage.value - 1) * 15, currentPage.value * 15 - 1);

    if (sort.value !== 'random') {
        queryBuilder = queryBuilder.order('created_at', { ascending: sort.value === 'first' });
    }

    if (searchQuery) {
        queryBuilder = queryBuilder.filter('name', 'ilike', `%${searchQuery}%`);
    }

    let { data, error, count: termsCount } = await queryBuilder;

    if (error) {
        throw error;
    }
    terms.value = data;
    count.value = termsCount;
};

watch(sort, () => {
    fetchTerms();
});

onMounted(async () => {
    account.value = await getUser();
    await fetchTerms();
});
</script>

<style scoped></style>
