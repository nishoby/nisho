<template>
    <div class="main-container container">
        <p class="my-words-title">{{ header }}</p>

        <div class="my-cards-div">
            <div
                class="my-card"
                :class="{ 'moderation': definition.pending_moderation }"
                v-for="definition of definitions"
            >
                <div class="my-card-wrapper">
                    <div class="date-edit">
                        <div class="date-edit_date">
                            {{ formatShortDate(definition.created_at) }}
                        </div>
                        <div v-if="false" class="moderate-caption">на мадэрацыі</div>
                        <div v-if="canEdit" class="date-edit_edit">
                            <router-link :to="{ name: 'edit', query: { id: definition.id } }">
                                <img src="/assets/img/edit.svg" alt="" />
                            </router-link>
                        </div>
                    </div>
                    <div class="my-card-text">
                        <router-link
                            :to="{
                                name: 'term',
                                params: { id: definition.term.id },
                            }"
                            class="my-card-title"
                        >
                            {{ definition.term.name }}
                        </router-link>

                        <p class="my-card-description">- {{ getShortDefinitionContent(definition) }}</p>
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
            />
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { getUser } from './user.js';
import { supabase } from './supabase.js';
import { useRoute, useRouter } from 'vue-router';
import { formatShortDate } from './date.js';

const PAGE_SIZE = 15;
const router = useRouter();
const route = useRoute();
const definitions = ref([]);
const count = ref();
const user = ref();
const header = ref('Словы');
const canEdit = ref(false);

onMounted(async () => {
    await fetchUser();
    await fetchDefinitions();
    await fetchCount();
});

async function fetchUser() {
    if (route.name === 'current-user-words') {
        user.value = getUser();
        header.value = 'Мае словы';
        canEdit.value = true;
    } else if (route.params.id) {
        let { data, error } = await supabase
            .from('user_profile')
            .select(`id:user_id, name`)
            .filter('user_id', 'eq', route.params.id)
            .single();

        if (error) {
            throw error;
        }

        user.value = data;
        header.value = `Словы ад ${data.name}`;
    }

    if (!user.value) {
        await router.push({ name: 'terms' });
    }
}

async function fetchDefinitions() {
    let { data, error } = await supabase
        .from('definition')
        .select(`*, term(*), user_profile(name)`, { count: 'exact' })
        .order('created_at', { ascending: false })
        .filter('user_id', 'eq', user.value.id)
        .range((currentPage.value - 1) * PAGE_SIZE, currentPage.value * PAGE_SIZE - 1);

    if (error) {
        throw error;
    }

    definitions.value = data;
}

async function fetchCount() {
    let { count: data, error } = await supabase
        .from('definition')
        .select(`*`, { count: 'exact', head: true })
        .filter('user_id', 'eq', user.value.id);

    if (error) {
        throw error;
    }

    count.value = data;
}

const currentPage = ref(1);
const onPageChange = async (page) => {
    currentPage.value = page;
    await fetchDefinitions();
};

const MAX_DEFINITION_LENGTH = 55;
function getShortDefinitionContent(definition) {
    const { content } = definition;

    if (content.length <= MAX_DEFINITION_LENGTH) {
        return content;
    }

    const slicedDef = content.slice(0, MAX_DEFINITION_LENGTH);
    const slicedWordEnd = content.slice(MAX_DEFINITION_LENGTH, content.length).split(' ')[0];
    return `${slicedDef}${slicedWordEnd}...`;
}
</script>

<style scoped></style>
