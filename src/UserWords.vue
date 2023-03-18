<template>
  <div class="main-container container">
    <p class="my-words-title">Мае словы</p>

    <div class="my-cards-div">
      <div class="my-card"
           :class="{'moderation': definition.pending_moderation}"
           v-for="definition of definitions">
        <div class="my-card-wrapper">
          <div class="date-edit">
            <div class="date-edit_date">
              {{ formatShortDate(definition.created_at) }}
            </div>
            <div v-if="definition.pending_moderation" class="moderate-caption">
              на мадэрацыі
            </div>
            <div v-else class="date-edit_edit">
              <img src="/assets/img/edit.svg" alt="">
            </div>
          </div>
          <div class="my-card-text">
            <a class="my-card-title" href="">
              {{ definition.term.name }}
            </a>

            <p class="my-card-description"> - {{ getShortDefinitionContent(definition) }}</p>
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
import {onMounted, ref} from 'vue'
import {getUser} from './user.js';
import {supabase} from './supabase.js';
import {useRouter} from 'vue-router';
import {formatShortDate} from "./date.js";

const PAGE_SIZE = 15
const router = useRouter();
const account = ref(getUser());
const definitions = ref([])
const count = ref()

onMounted(
    async () => {
      if (!account.value) {
        await router.push({name: 'terms'})
        return
      }

      await fetchDefinitions()
      await fetchCount()
    }
)

async function fetchDefinitions() {
  let {data, error} = await supabase
      .from("definition")
      .select(`*, term(*)`, {count: 'exact'})
      .order('created_at', {ascending: false})
      .filter('user_id', 'eq', account.value.id)
      .range((currentPage.value - 1) * PAGE_SIZE, (currentPage.value * PAGE_SIZE) - 1)

  if (error) {
    throw error
  }

  // TODO
  data[1].pending_moderation = true

  definitions.value = data;
}

async function fetchCount() {
    let {count: data, error} = await supabase
        .from("definition")
        .select(`*`, {count: 'exact', head: true})
        .filter('user_id', 'eq', account.value.id)

    if (error) {
        throw error
    }

    count.value = data;
}

const currentPage = ref(1)
const onPageChange = async (page) => {
  currentPage.value = page;
  await fetchDefinitions()
}

const MAX_DEFINITION_LENGTH = 55
function getShortDefinitionContent (definition) {
  const { content } = definition

  if (content.length <= MAX_DEFINITION_LENGTH) {
    return content
  }

  const slicedDef = content.slice(0, MAX_DEFINITION_LENGTH)
  const slicedWordEnd = content.slice(MAX_DEFINITION_LENGTH, content.length).split(' ')[0]
  return `${slicedDef}${slicedWordEnd}...`
}

</script>

<style scoped>

</style>
