<template>
    <router-link :to="{ name: 'terms' }" class="header-logo-btn">
        <router-link :to="{ name: 'terms' }">
            <img class="header-logo-img" src="/assets/img/logo.svg" alt="" />
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
                style="width: 100%"
                popper-class="search-autocomplete"
                placeholder="Пачніце ўвадзіць слова"
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
        </router-link>
        <el-popover placement="bottom" :width="account ? 270 : 60" trigger="click">
            <template #reference>
                <button class="person-btn">
                    <img class="person-btn-img" src="/assets/img/person.svg" alt="" />
                </button>
            </template>
            <div v-if="account">
                <el-row style="padding-bottom: 10px"> Email: {{ account.email }} </el-row>
                <el-row style="padding-bottom: 10px">
                    Ваша імя:
                    <el-input v-model="accountName">
                        <template #append>
                            <el-button :icon="Search" />
                        </template>
                    </el-input>
                </el-row>
                <el-row style="padding-bottom: 10px">
                    <router-link style="text-decoration: underline" :to="{ name: 'current-user-words' }">
                        Мае словы
                    </router-link>
                </el-row>
                <el-button @click="signOut" type="success">Выхад</el-button>
            </div>
            <div v-else>
                <router-link to="login" style="text-decoration: underline"> Логін </router-link>
                <router-link to="login" style="padding-left: 15px; text-decoration: underline">
                    Рэгістрацыя
                </router-link>
            </div>
        </el-popover>
        <el-dropdown>
            <button class="hamburger-btn">
                <IconHamburger />
            </button>
            <template #dropdown>
                <el-dropdown-menu class="hamburger-dropdown">
                    <el-dropdown-item>
                        <router-link :to="{ name: 'about' }">Апісанне</router-link>
                    </el-dropdown-item>
                    <el-dropdown-item>
                        <router-link :to="{ name: 'team' }">Каманда</router-link>
                    </el-dropdown-item>
                    <el-dropdown-item>
                        <router-link :to="{ name: 'donation' }">Заданаціць</router-link>
                    </el-dropdown-item>
                    <el-dropdown-item>
                        <router-link :to="{ name: 'contacts' }">Кантакты</router-link>
                    </el-dropdown-item>
                    <el-dropdown-item>
                        <router-link :to="{ name: 'rules' }">Правілы</router-link>
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { getUser } from './auth.js';
import { supabase } from './supabase.js';
import IconHamburger from './icons/IconHamburger.vue';
import { Search } from '@element-plus/icons-vue';

const account = ref(getUser());
const accountName = ref(account.value ? account.value.email : null);
const search = ref('');

supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
        account.value = session.user;
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
    router.push({ name: 'term', params: { id: item.id } });
};

async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error(error);
        return;
    }
    account.value = null;
}
</script>

<style scoped></style>
