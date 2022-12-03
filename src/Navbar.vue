<template>
    <Teleport to="header">
        <router-link :to="{name: 'terms'}" class="header-logo-btn">
            <img class="header-logo-img" src="/assets/img/logo.svg" alt="">
        </router-link>
        <div class="header-form-container container">
            <form class="header-form" action="">
                <button class="form-search-btn">
                    <img class="form-search-btn-img" src="/assets/img/search.svg" alt="">
                </button>

                <input type="text" class="search-input">

                <button class="form-random-btn">
                    <img class="form-random-btn-img" src="/assets/img/random.svg" alt="">
                </button>
            </form>
        </div>
        <div class="header-btns">
            <a class="add-btn" href="/html/add-word.html">
                <img class="add-btn-img" src="/assets/img/add.svg" alt="">
            </a>

            <button class="person-btn">
                <img class="person-btn-img" src="/assets/img/person.svg" alt="">
            </button>
        </div>
    </Teleport>
</template>

<script setup>
import {ref}                 from "vue";
import {getUser}             from "./user.js";
import {supabase}            from "./supabase.js";
import {Plus, Refresh, User} from '@element-plus/icons-vue'
import {useRouter}           from 'vue-router'
import {ElMessage}           from "element-plus";

const account = ref(getUser())
const search  = ref('')

supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
        account.value = session.user;
    }
})
const router           = useRouter();
const goToAdding       = () => {
    if (!account.value) {
        ElMessage.warning('Каб дадаць слова, вам трэба залагініцца');
        return
    }
    router.push({'name': 'add'})
}
const querySearchAsync = async (queryString, cb) => {
    if (!queryString) {
        cb([]);
        return
    }
    let {data} = await supabase
        .from("term")
        .select(`*, definition(*)`)
        .order('created_at', {ascending: false, foreignTable: 'definition'})
        .limit(1, {foreignTable: 'definition'})
        .filter('name', 'like', `%${queryString}%`);
    cb(data)
}

const handleSelect = (item) => {
    router.push({name: 'term', params: {id: item.id}})
}

async function signInWithGoogle() {
    const options       = import.meta.env.VITE_REDIRECT_URL
        ? {redirectTo: import.meta.env.VITE_REDIRECT_URL}
        : {}
    const {user, error} = await supabase.auth.signIn(
        {provider: 'google'},
        options
    )
    if (error) {
        console.error(error);
        return
    }
    account.value = user;
}

async function signOut() {
    const {error} = await supabase.auth.signOut()
    if (error) {
        console.error(error);
        return;
    }
    account.value = null;
}
</script>

<style scoped>
@media (min-width: 820px) {
    .mrgn-auto {
        margin-left: auto;
        margin-right: auto
    }
}
</style>
