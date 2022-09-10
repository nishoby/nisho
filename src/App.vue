<script setup>
import {getUser}  from "./user.js";
import {ref}      from "vue";
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

<template>
    <div class="header-wrp fixedhrd">
        <div class="header flex-row flex-algn-itms-c">
            <a href="#" class="section pdng-l-20px pdng-r-20px">
                <img src="/img/woman.png" width="200" height="150">
            </a>
            <div class="header-links flex-grow-all pdng-l-20px pdng-r-20px mil-notdisplay">
                <a href="">Аб праекце</a>
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
                        <div class="pdng-t-30px">
                            <a href="#">Выборы</a>
                        </div>
                        <div class="pdng-t-30px">
                            <a href="#">Нарушения</a>
                        </div>
                        <div class="pdng-t-30px">
                            <a href="#">Комиссии</a>
                        </div>
                        <div class="pdng-t-30px">
                            <a href="#">Организации</a>
                        </div>
                        <div class="pdng-t-30px">
                            <a class="active" href="#">Новости</a>
                        </div>
                        <div class="pdng-t-30px">
                            <a href="#">О проекте</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="header-subnav border-color2">
            <div class="section pdng-30px pdng-t-15px pdng-b-15px mil-pdng-20px mil-pdng-t-10px mil-pdng-b-10px flex-grow-all">
                <div class="inline-block">
                    <div class="txt-size-12px txt-color-3-1 mrgn-b-5px">
                        Поиск
                    </div>
                    <div class="section pdng-r-30px">
                        <div class="search-input-wrp">
                            <input class="search-input" type="search" placeholder="Поиск">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="scene mrgn-t-170px mil-mrgn-t-120px">
        <div v-if="account && account.email">
            <span>{{ account.email }}</span>
            <button @click="signOut">Выход</button>
        </div>
        <div v-else>
            <button @click="signInWithGoogle">Sign in with Google</button>
        </div>
    </div>
</template>

<style scoped>

</style>
