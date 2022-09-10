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
            <div v-if="account && account.email">
                <span>{{ account.email }}</span>
                <el-button @click="signOut">Выход</el-button>
            </div>
            <div v-else>
                <el-button @click="signInWithGoogle">Sign in with Google</el-button>
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
                <div v-if="account && account.email">
                    <span>{{ account.email }}</span>
                    <el-button @click="signOut">Выход</el-button>
                </div>
                <div v-else>
                    <el-button @click="signInWithGoogle">Sign in with Google</el-button>
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
</template>

<script setup>
import {ref}      from "vue";
import {getUser}  from "./user.js";
import {supabase} from "./supabase.js";

const account = ref(getUser())
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
        account.value = session.user;
    }
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

<style scoped>

</style>
