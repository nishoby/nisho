<template>
    <h1 class="title">
        <router-link class="back-btn" :to="{name: 'terms'}">
            <img src="/public/assets/img/back-black.svg" alt="">
        </router-link>
        Дадаць слова
    </h1>
    <form class="add-word_form" action="" @submit.prevent="submit">
        <button class="cross" @click="router.back()"></button>
        <p class="note">
            Усе тлумачэнні ў Нішо напісаныя звычайнымі людзьмі.
            Ты таксама можаш дадаць у слоўнік свае.
            <br>
            Зазірні ў
            <router-link :to="{name: 'rules'}">гайдлайны</router-link>
            перад тым як даваць новаe слова ці яго тлумачэнне.
        </p>
        <label class="add-word_label" for="word">Слова:</label>
        <input required
               class="add-word_input" type="text" name="word" id="word"
               v-model="new_term.term_name">
        <label class="add-word_label" for="definition">Тлумачэнне:</label>
        <textarea required
                  class="add-word_textarea" name="definition" rows="6" id="definition"
                  v-model="new_term.definition"></textarea>
        <label class="add-word_label" for="example">Прыклад:</label>
        <textarea required
                  class="add-word_textarea" type="text" rows="6" name="example" id="example"
                  v-model="new_term.example"></textarea>
        <label class="add-word_label" for="tags">Тэгі:</label>
        <input class="add-word_input" type="text" name="tags" id="tags">
        <input class="submit-btn" type="submit" value="Гатова" :disabled="loading">
    </form>
</template>

<script setup>
import {reactive, ref} from 'vue'
import {supabase}      from "./supabase.js";
import {ElMessage}     from "element-plus";
import {useRouter}     from 'vue-router'
import {getUser}       from "./user.js";

const router = useRouter();

const loading = ref(false)

const new_term = reactive({
    term_name : '',
    definition: '',
    example   : '',
})
const form     = ref()
const account  = ref(getUser());
const submit   = async () => {
    if (!account.value) {
        ElMessage.warning('Каб дадаць слова, вам трэба залагініцца')
        return;
    }
    if (new_term.term_name.length < 4) {
        ElMessage.warning('Слова павінна быць не меньш 3 сымбалеў')
        return;
    }
    if (new_term.definition.length < 10) {
        ElMessage.warning('Павінна быць змястоўнае тлумачэнне')
        return;
    }
    if (new_term.example.length < 10) {
        ElMessage.warning('Павінен быць змястоўный прыклад')
        return;
    }
    loading.value = true

    try {
        let {data, error} = await supabase.rpc(
            'add_term',
            {
                definition: new_term.definition,
                example   : new_term.example,
                term_name : new_term.term_name.trim()
            }
        )
        loading.value = false
        if (error) {
            throw error
        }
        ElMessage.success('Паспяхова даданы тэрмін');
        await router.push({name: 'term', params: {id: data}})
    } catch (error) {
        ElMessage.error('Адбылася памылка')
        throw error;
    }
}

</script>

<style scoped>

</style>
