<template>
    <router-link :to="{ name: 'terms' }" class="header-logo-btn">
        <router-link :to="{ name: 'terms' }">
            <img class="header-logo-img" src="/assets/img/logo.svg" alt="" />
            <!-- на вузкім экране ад лагатыпа застаецца адна літара — месца пад пошук -->
            <img class="header-logo-img--compact" src="/assets/img/logo-n.svg" alt="" />
        </router-link>
    </router-link>
    <div class="header-form-container container">
        <form class="header-form" action="">
            <button class="form-search-btn">
                <img class="form-search-btn-img" src="/assets/img/search.svg" alt="" />
            </button>
            <el-autocomplete
                v-model="search"
                :fetch-suggestions="querySearchAsync"
                size="large"
                :fit-input-width="false"
                @select="handleSelect"
                select-when-unmatched
                style="width: 100%"
                popper-class="search-autocomplete"
                placeholder="Увядзіце слова"
                clearable
            >
                <template #default="{ item }">
                    <span>
                        <b>{{ item.name }}</b>
                    </span>
                    <span style="padding-left: 5px">
                        {{ item.definition[0].content }}
                    </span>
                </template>
            </el-autocomplete>
            <button class="form-random-btn" type="button" v-if="false">
                <img class="form-random-btn-img" src="/assets/img/random.svg" alt="" />
            </button>
        </form>
    </div>
    <div class="header-btns">
        <router-link class="add-btn" :to="{ name: 'add' }">
            <img class="add-btn-img" src="/assets/img/add.svg" alt="" />
            <!-- Подпіс вылазіць з-пад плюса пры навядзенні. Стаіць унутры той
                 самай спасылкі, таму націскаецца нароўні з самім значком, а не
                 толькі паказвае. Заадно ў спасылкі з'явілася назва: да гэтага
                 яна была з аднаго малюнка без подпісу. -->
            <span class="add-btn_label">Дадаць слова</span>
        </router-link>
        <!-- Пад чалавечкам — кароткі спіс дзвярэй, а не форма і не двайнік
             бургера. Спярша «Профіль» — гэта пра самога чалавека (імя, пошта,
             бан, выхад), потым ягоныя месцы: «Мае словы», а ў мадэратара і
             «Мадэрацыя». -->
        <el-dropdown>
            <button class="person-btn">
                <img class="person-btn-img" src="/assets/img/person.svg" alt="" />
            </button>
            <template #dropdown>
                <el-dropdown-menu class="hamburger-dropdown">
                    <template v-if="account">
                        <!-- адзін радок пра бан — факт, а не пункт меню; поўнае
                             тлумачэнне ў профілі і на дадаванні слова -->
                        <el-dropdown-item class="person-menu_ban" disabled v-if="myBanRow">
                            Ты ў бане да {{ formatLongDate(myBanRow.until) }}
                        </el-dropdown-item>
                        <el-dropdown-item>
                            <router-link :to="{ name: 'profile' }">Профіль</router-link>
                        </el-dropdown-item>
                        <el-dropdown-item>
                            <router-link :to="{ name: 'current-user-words' }">Мае словы</router-link>
                        </el-dropdown-item>
                        <!-- бачная толькі мадэратарам — астатнія пра яе не ведаюць -->
                        <el-dropdown-item v-if="moderator">
                            <router-link :to="{ name: 'moderation' }">Мадэрацыя</router-link>
                        </el-dropdown-item>
                        <!-- Выхад — кнопка, а не радок спісу: гэта дзеянне, а не
                             пераход, і блытацца з суседнімі спасылкамі яно не
                             павінна -->
                        <el-dropdown-item class="person-menu_exit-item">
                            <button class="person-menu_exit" type="button" @click="signOut">Выхад</button>
                        </el-dropdown-item>
                    </template>
                    <template v-else>
                        <el-dropdown-item>
                            <router-link :to="{ name: 'login' }">Логін</router-link>
                        </el-dropdown-item>
                        <el-dropdown-item>
                            <router-link :to="{ name: 'registration' }">Рэгістрацыя</router-link>
                        </el-dropdown-item>
                    </template>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
        <el-dropdown>
            <button class="hamburger-btn">
                <IconHamburger />
            </button>
            <template #dropdown>
                <el-dropdown-menu class="hamburger-dropdown">
                    <el-dropdown-item>
                        <router-link :to="{ name: 'about' }">Пра праект</router-link>
                    </el-dropdown-item>
                    <el-dropdown-item>
                        <router-link :to="{ name: 'team' }">Каманда</router-link>
                    </el-dropdown-item>
                    <el-dropdown-item>
                        <router-link :to="{ name: 'donation' }">Падтрымаць</router-link>
                    </el-dropdown-item>
                    <el-dropdown-item>
                        <router-link :to="{ name: 'rules' }">Правілы</router-link>
                    </el-dropdown-item>
                    <el-dropdown-item>
                        <router-link :to="{ name: 'all-tags' }">Усе тэгі</router-link>
                    </el-dropdown-item>
                    <el-dropdown-item>
                        <router-link :to="{ name: 'bugs' }">Багі</router-link>
                    </el-dropdown-item>
                    <el-dropdown-item>
                        <router-link :to="{ name: 'faq' }">FAQ</router-link>
                    </el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getUser } from './auth.js';
import { isModerator, forgetModerator } from './moderator.js';
import { myBan, forgetMyBan } from './bans.js';
import { formatLongDate } from './date.js';
import { supabase } from './supabase.js';
import IconHamburger from './icons/IconHamburger.vue';

const route = useRoute();
const account = ref();
const moderator = ref(false);
// свой бан — дзеля аднаго радка ў меню; null значыць, што ўсё добра
const myBanRow = ref(null);
const search = ref(route.query.poshuk?.trim() || '');

supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN') {
        account.value = session.user;
        // увайшоў іншы чалавек — старыя адказы пра правы і бан нічога не вартыя
        forgetModerator();
        forgetMyBan();
        moderator.value = await isModerator();
        myBanRow.value = await myBan();
    }

    // выхад робіцца на старонцы профілю — шапка проста даведваецца пра яго
    if (event === 'SIGNED_OUT') {
        account.value = null;
        moderator.value = false;
        myBanRow.value = null;
    }
});
const router = useRouter();
const querySearchAsync = async (queryString, cb) => {
    if (!queryString) {
        cb([]);
        return;
    }
    let { data } = await supabase
        .from('term')
        .select(`*, definition(*)`)
        .order('created_at', { ascending: false, foreignTable: 'definition' })
        .limit(1, { foreignTable: 'definition' })
        .filter('name', 'ilike', `%${queryString}%`);
    cb(data);
};

const handleSelect = (item) => {
    if (item.id) {
        router.push({ name: 'term', params: { id: item.id } });
    } else if (item.value) {
        router.push({ name: 'terms', query: { poshuk: item.value } });
    }
};

onMounted(async () => {
    account.value = await getUser();
    moderator.value = await isModerator();
    myBanRow.value = account.value ? await myBan() : null;
});

async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error(error);
        return;
    }

    account.value = null;
    moderator.value = false;
    myBanRow.value = null;
    forgetModerator();
    forgetMyBan();
    await router.push({ name: 'terms' });
}
</script>

<style scoped></style>
