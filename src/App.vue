<script setup>
import {getUser}        from "./user.js";
import {onMounted, ref} from "vue";
import {supabase}       from "./supabase.js";

const account = ref(getUser())
const terms   = ref([]);
const search  = ref()

supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
        account.value = session.user;
    }
})

const fetchTerms = async () => {
    let {data, error} = await supabase
        .from("term")
        .select(`*, definition(*)`)
        .order('created_at', {ascending: false, foreignTable: 'definition'})
        .limit(1, {foreignTable: 'definition'})
    if (error) {
        throw error
    }
    terms.value = data;
}

onMounted(() => {
    fetchTerms()
})

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

<template>
    <div class="header-wrp fixedhrd">
        <div class="header flex-row flex-algn-itms-c">
            <a href="/" class="section pdng-l-20px pdng-r-20px">
                <img src="/img/woman.png" width="200" height="150">
            </a>
            <div class="header-links flex-grow-all pdng-l-20px pdng-r-20px mil-notdisplay">
                <!--                <router-link :to="route.to" v-for="route of routes" :active-class="'active'">-->
                <!--                    {{ route.name }}-->
                <!--                </router-link>-->
                <a href="#">Аб праекце</a>
            </div>
            <div class="section pdng-l-20px pdng-r-30px mil-notdisplay" v-if="false">
                <div class="search-input-wrp">
                </div>
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
                        <div class="pdng-t-30px" v-for="route of routes">
                            <!--                            <router-link :to="route.to" :active-class="'active'">-->
                            <!--                                {{ route.name }}-->
                            <!--                            </router-link>-->
                        </div>
                        <div class="pdng-t-30px">
                            <a href="https://t.me/zubr_info_bot">Связаться с нами</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <slot>
            <div class="header-subnav border-color2">
                <div class="pdng-5px">
                    <el-input class="size-50" v-model="search"></el-input>
                </div>
            </div>
        </slot>
    </div>
    <div class="scene mrgn-t-170px mil-mrgn-t-170px">
        <div v-if="account && account.email">
            <span>{{ account.email }}</span>
            <el-button @click="signOut">Выход</el-button>
        </div>
        <div v-else>
            <el-button @click="signInWithGoogle">Sign in with Google</el-button>
        </div>
    </div>
    <div class="scene pdng-t-0">
        <template v-if="terms">
            <div class="committee-list size-50 mil-size-100 mil-flex-column">
                <a class="committee-unit mil-flex-column"
                   v-for="item of terms">
                    <div
                        class="section size-100 pdng-r-20px pdng-l-30px pdng-t-20px pdng-b-20px mil-size-100 mil-pdng-15px">
                        <h2 class="txt-color-1 txt-size-28pxpx txt-medium mil-txt-size-16px">
                            {{ item.term }}
                        </h2>
                        <div class="txt-color-2 txt-size-18px pdng-t-15px">
                            {{ item.definition[0].content }}
                        </div>
                    </div>
                </a>
            </div>
        </template>
    </div>
</template>

<style scoped>

</style>
