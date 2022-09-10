<template>
    <div class="header-wrp fixedhrd bg-color-main">
        <div class="header size-70 mrgn-auto mil-size-100 bg-color-main">
            <div class="flex-row flex-algn-itms-c mil-notdisplay">
                <a href="/" class="section pdng-l-20px pdng-r-20px">
                    <img src="/img/logo.svg" alt="logo">
                </a>
                <div class="header-links flex-grow-all pdng-l-20px pdng-r-20px mil-notdisplay">
                    <router-link :to="{'name': 'about'}">Аб праекце</router-link>
                </div>
                <div class="pdng-r-30px mil-notdisplay">
                    <div v-if="account && account.email">
                        <span>{{ account.email }}</span>
                        <el-button @click="signOut">Выход</el-button>
                    </div>
                    <div v-else>
                        <el-button @click="signInWithGoogle">Sign in with Google</el-button>
                    </div>
                </div>
            </div>
            <div class="pdng-t-20px pdng-l-20px pdng-r-30px mil-notdisplay flex-row">
                <el-autocomplete
                    v-model="search"
                    :fetch-suggestions="querySearchAsync"
                    size="large"
                    :fit-input-width="true"
                    @select="handleSelect"
                    class="mrgn-r-15px size-100"
                    placeholder="Пачніце ўвадзіць слова">
                    <template #default="{ item }">
                        <span><b>{{ item.term }}</b></span>
                        <span class="pdng-l-5px">{{ item.definition[0].content }}</span>
                    </template>
                </el-autocomplete>
                <el-button :icon="Plus" circle size="large"></el-button>
                <el-button :icon="Refresh" circle size="large"></el-button>
                <el-button :icon="Refresh" circle size="large"></el-button>
            </div>
            <!-- mobile nav -->
            <div class="section flex-grow-all pdng-l-20px pdng-r-30px notdisplay mil-show">
                <input id="brgrbtn" class="notdisplay mil-show" type="checkbox">
                <label for="brgrbtn" class="notdisplay burger-button mil-show">
                    <div class="burger-button-line"></div>
                    <div class="burger-button-line"></div>
                    <div class="burger-button-line"></div>
                </label>
                <div class="brgr-nav notdisplay mil-show">
                    <div class="header-links pdng-l-20px pdng-r-20px">
                        <!--                        <div class="pdng-t-30px" v-for="route of routes">-->
                        <!--                            <router-link :to="route.to" :active-class="'active'">-->
                        <!--                                {{ route.name }}-->
                        <!--                            </router-link>-->
                        <!--                        </div>-->
                        <div class="pdng-t-30px">
                            <router-link :to="{'name': 'about'}">Аб праекце</router-link>
                        </div>
                        <div v-if="account && account.email">
                            <span>{{ account.email }}</span>
                            <el-button @click="signOut" type="success">Выхад</el-button>
                        </div>
                        <div v-else>
                            <el-button @click="signInWithGoogle" type="success">Логін з Google</el-button>
                        </div>
                    </div>

                </div>

                <div class="pdng-t-20px pdng-r-30px flex-row">
                    <el-input v-model="search"
                              size="large"
                              class="mrgn-r-15px"
                              placeholder="Пачніце ўвадзіць слова"></el-input>
                    <el-button :icon="Plus" circle size="large"></el-button>
                    <el-button :icon="Refresh" circle size="large"></el-button>
                    <el-button :icon="Refresh" circle size="large"></el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {ref}           from "vue";
import {getUser}       from "./user.js";
import {supabase}      from "./supabase.js";
import {Plus, Refresh} from '@element-plus/icons-vue'
import {useRouter}     from 'vue-router'

const account = ref(getUser())
const search  = ref('')
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
        account.value = session.user;
    }
})
const router           = useRouter();
const querySearchAsync = async (queryString, cb) => {
    let {data} = await supabase
        .from("term")
        .select(`*, definition(*)`)
        .order('created_at', {ascending: false, foreignTable: 'definition'})
        .limit(1, {foreignTable: 'definition'})
        .filter('term', 'like', `%${queryString}%`);
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
