<script setup>
import {getUser}        from "./user.js";
import {onMounted, ref} from "vue";
import {supabase}       from "./supabase.js";

const account = ref(getUser())
const terms = ref([]);

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
    <div class="scene pdng-0">
        <div v-if="account && account.email">
            <span>{{ account.email }}</span>
            <button @click="signOut">Выход</button>
        </div>
        <div v-else>
            <button @click="signInWithGoogle">Sign in with Google</button>
        </div>
    </div>
    <div class="scene mil-mrgn-t-170px">
        <template v-if="terms">
            <div class="committee-list mil-flex-column">
                <a class="committee-unit mil-flex-column"
                   v-for="item of terms">
                    <div
                        class="section size-45 pdng-r-20px pdng-l-30px pdng-t-20px pdng-b-20px mil-size-100 mil-pdng-15px">
                        <h2 class="txt-color-1 txt-size-20px txt-medium mil-txt-size-16px">
                            {{ item.term }}
                        </h2>
                        <div class="txt-color-2 txt-size-14px">
                            {{ item.definition[0].content }}
                        </div>
                    </div>
                    <div
                        class="section flex-row flex-algn-slf-strch flex-algn-itms-c size-30 pdng-r-20px pdng-l-20px pdng-t-20px pdng-b-20px border-l-1px border-color2 mil-border-0 mil-size-100 mil-pdng-15px mil-pdng-t-0 mil-border-b-1px mil-border-color1">
                        <div class="size-100">
                            <div class="txt-color-1 txt-size-20px txt-medium mil-txt-size-16px">
                            </div>
                            <div class="txt-color-2 txt-size-14px">
                            </div>
                        </div>
                    </div>
                    <div
                        class="section size-25 flex-grow-all txt-algn-r pdng-r-30px pdng-l-20px pdng-t-20px pdng-b-20px mil-pdng-15px">
                        <div class="inline-flex flex-algn-itms-c">
                            <div class="section">
                                <div class="flex-row flex-algn-itms-c">
                                    <div class="section pdng-l-15px">
                                        <div class="txt-color-2 txt-size-20px txt-bold mil-txt-size-16px">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </a>
            </div>
        </template>
    </div>
</template>

<style scoped>

</style>
