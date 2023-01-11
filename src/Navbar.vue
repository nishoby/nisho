<template>
    <router-link :to="{name: 'terms'}" class="header-logo-btn">
        <a href="#" >
            <img class="header-logo-img" src="/assets/img/logo.svg" alt="">
        </a>
    </router-link>
    <div class="header-form-container container">
        <form class="header-form" action="">
            <button class="form-search-btn">
                <img class="form-search-btn-img" src="/assets/img/search.svg" alt="">
            </button>
            <el-autocomplete
                v-model="search"
                :fetch-suggestions="querySearchAsync"
                size="large"
                :fit-input-width="false"
                @select="handleSelect"
                style="width: 100%;padding-right: 5px"
                placeholder="Пачніце ўвадзіць слова">
                <template #default="{ item }">
                    <span><b>{{ item.name }}</b></span>
                    <span style="max-width: 250px;padding-left: 5px">
                            {{ item.definition[0].content }}
                        </span>
                </template>
            </el-autocomplete>
            <button class="form-random-btn" type="button">
                <img class="form-random-btn-img" src="/assets/img/random.svg" alt="">
            </button>
        </form>
    </div>
    <div class="header-btns">
        <router-link :to="{name: 'add'}" custom v-slot="{ href, navigate }">
            <a class="add-btn"
               v-if="!account"
               @click="ElMessage.warning('Каб дадаць слова, вам трэба залагініцца')"
               href="#">
                <img class="add-btn-img" src="/assets/img/add.svg" alt="">
            </a>
            <a
                class="add-btn"
                v-else
                :href="href"
                @click="navigate">
                <img class="add-btn-img" src="/assets/img/add.svg" alt="">
            </a>
        </router-link>
        <el-popover placement="bottom" :width="270" trigger="click">
            <template #reference>
                <button class="person-btn">
                    <img class="person-btn-img" src="/assets/img/person.svg" alt="">
                </button>
            </template>
            <div v-if="account">
                <span class="txt-color-2 pdng-r-15px">{{ account.email }}</span>
                <el-button @click="signOut" type="success">Выхад</el-button>
            </div>
            <div v-else>
                <el-button @click="signInWithGoogle" type="success">Логін з Google</el-button>
            </div>
        </el-popover>
    </div>
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
        : {redirectTo: window.location}
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
