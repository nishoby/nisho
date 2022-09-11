<template>
    <div class="header-wrp fixedhrd bg-color-main">
        <div class="header size-70 mrgn-auto mil-size-100 bg-color-main">
            <div class="flex-row flex-algn-itms-c mil-notdisplay">
                <router-link :to="{name: 'terms'}" class="section pdng-l-20px pdng-r-20px">
                    <img src="/img/logo.svg" height="40" alt="logo">
                </router-link>
                <div class="header-links flex-grow-all pdng-l-20px pdng-r-20px mil-notdisplay">
                    <router-link :to="{'name': 'about'}">Аб праекце</router-link>
                </div>
                <div class="pdng-r-30px mil-notdisplay">
                    <div v-if="account && account.email">
                        <span class="pdng-r-10px">{{ account.email }}</span>
                        <el-button @click="signOut">Выход</el-button>
                    </div>
                    <div v-else>
                        <el-button @click="signInWithGoogle">Логін з Google</el-button>
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
                        <span><b>{{ item.name }}</b></span>
                        <span class="pdng-l-5px">{{ item.definition[0].content }}</span>
                    </template>
                </el-autocomplete>
                <el-button :icon="Plus" circle size="large" @click="goToAdding"></el-button>
                <!--                <el-button :icon="Refresh" circle size="large" class="mrgn-l-5px"></el-button>-->
                <el-popover placement="bottom" :width="270" trigger="click">
                    <template #reference>
                        <el-button :icon="User" circle size="large"></el-button>
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
            <!-- mobile nav -->
            <div class="section flex-grow-all pdng-l-20px pdng-r-30px notdisplay mil-show">
                <router-link :to="{name: 'terms'}" class="section pdng-l-20px pdng-r-20px">
                    <img src="/img/logo.svg" height="30" alt="logo">
                </router-link>
                <input id="brgrbtn" class="notdisplay mil-show" type="checkbox">
                <label for="brgrbtn" class="notdisplay burger-button mil-show">
                    <div class="burger-button-line"></div>
                    <div class="burger-button-line"></div>
                    <div class="burger-button-line"></div>
                </label>
                <div class="brgr-nav notdisplay mil-show">
                    <div class="header-links pdng-l-20px pdng-r-20px">
                        <div class="pdng-t-30px">
                            <router-link :to="{'name': 'about'}">Аб праекце</router-link>
                        </div>
                    </div>
                </div>
                <div class="pdng-r-30px flex-row">
                    <el-autocomplete
                        v-model="search"
                        :fetch-suggestions="querySearchAsync"
                        size="large"
                        :fit-input-width="false"
                        @select="handleSelect"
                        class="mrgn-r-15px size-100"
                        placeholder="Пачніце ўвадзіць слова">
                        <template #default="{ item }">
                            <span><b>{{ item.name }}</b></span>
                            <span class="pdng-l-5px" style="max-width: 250px">{{ item.definition[0].content }}</span>
                        </template>
                    </el-autocomplete>
                    <el-button :icon="Plus"
                               circle
                               role="link"
                               size="large"
                               @click="goToAdding"></el-button>
                    <!--                    <el-button :icon="Refresh" circle size="large"></el-button>-->
                    <el-popover placement="bottom" :width="270" trigger="click">
                        <template #reference>
                            <el-button :icon="User" circle size="large"></el-button>
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
            </div>
        </div>
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
