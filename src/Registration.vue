<template>
    <div class="registration bcg-reg">
        <h1 class="title title-white">
            <button class="back-btn" type="button" aria-label="Назад" @click="router.back()">
                <img src="/assets/img/back.svg" alt="" /></button
            >Рэгістрацыя
        </h1>
        <!-- Пасля рэгістрацыі — не знікаючае паведамленне, а экран замест формы.
             Раней тут быў чырвоны ўсплываючы радок на тры секунды, і адразу за
             ім старонка пераскоквала на спіс слоў: чалавек не паспяваў яго
             прачытаць, а потым не разумеў, чаму не пускае ўваход. Гэта не
             дробязь — без пацверджання пошты акаўнт наогул не працуе. -->
        <div class="login_form registration-sent" v-if="sent">
            <button type="reset" class="cross" @click="router.push({ name: 'terms' })"></button>

            <p class="registration-sent_main">
                Мы адправілі ліст з пацвярджэннем на {{ sent }}. Правер пошту і перайдзі па спасылцы ў лісце.
            </p>
            <p class="registration-sent_hint">
                Не прыйшоў? Паглядзі ў папцы «Спам» ці
                <button class="registration-resend" type="button" :disabled="Boolean(wait)" @click="resend">
                    адпраў яшчэ раз<template v-if="wait"> — праз {{ wait }} с</template>
                </button>
            </p>

            <div class="account">
                <router-link :to="{ name: 'login' }" class="registration-link">Уваход</router-link>
            </div>
        </div>

        <el-form v-else class="login_form" label-position="top" ref="form" :rules="rules" @submit.prevent="submit">
            <button type="reset" class="cross" @click="router.back()"></button>
            <el-form-item label="Email" prop="email">
                <el-input
                    class="email_input"
                    name="email"
                    placeholder="Email"
                    id="email_input"
                    v-model="signUpData.email"
                />
            </el-form-item>
            <el-form-item label="Лагін" prop="login">
                <el-input name="login" placeholder="Лагін" id="login_input" v-model="signUpData.login" />
            </el-form-item>
            <el-form-item label="Пароль" prop="password">
                <PasswordInput
                    class="password_input"
                    name="password"
                    id="password_input"
                    v-model="signUpData.password"
                />
            </el-form-item>
            <el-form-item label="Паўторна пароль" prop="password">
                <PasswordInput
                    class="password_input"
                    name="password_repeat"
                    id="password_repeat_input"
                    v-model="signUpData.password_repeat"
                />
            </el-form-item>

            <input class="registration-submit-btn" type="submit" value="Зарэгістравацца" :disabled="loading" />
            <div class="horiz-line"><p>Ці</p></div>

            <div class="gmail-registration">
                <img class="gmail-img" style="width: 2rem" src="/assets/img/gmail.svg" alt="" />
                <button class="gmail-registration-btn" type="button" @click="signInWithGoogle">Логін праз Gmail</button>
            </div>

            <div class="account">
                <p>Ужо ёсць аккаунт?</p>
                <router-link :to="{ name: 'login' }" class="registration-link"> Уваход</router-link>
            </div>
        </el-form>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { onUnmounted, reactive, ref } from 'vue';
import PasswordInput from './PasswordInput.vue';
import { signInWithGoogle, signUp } from './auth.js';
import { ElMessage } from 'element-plus';
import { commonError } from './error.js';

const router = useRouter();
const loading = ref(false);
// пошта, на якую пайшоў ліст; пакуль пустая — паказваем форму
const sent = ref('');
const signUpData = reactive({
    login: '',
    email: '',
    password: '',
    password_repeat: '',
});

const rules = reactive({
    term_name: [
        {
            required: true,
            message: 'Лог павінна быць не меньш 3 сымбалеў',
            trigger: 'blur',
        },
        {
            min: 3,
            message: 'Логін павінен быць не меньш 3 сымбалеў',
            trigger: 'blur',
        },
        {
            max: 25,
            message: 'Логін павінна быць не меньш 25 сымбалеў',
            trigger: 'blur',
        },
    ],
});
const form = ref();

// ── Даслаць ліст яшчэ раз ──────────────────────────────────────────────────
// Лісты губляюцца, трапляюць у спам і проста не даходзяць — без гэтай кнопкі
// адзіны выхад быў бы рэгістравацца нанова тым жа адрасам.
//
// У нашай версіі бібліятэкі `auth.resend()` яшчэ няма. Затое паўторны signUp
// тым жа адрасам робіць роўна тое, што трэба: непацверджанаму акаўнту Supabase
// шле новы ліст, а новага акаўнта не заводзіць. Пароль і лагін пры гэтым усё
// яшчэ ляжаць у форме — старонка нікуды не пераходзіла.
const wait = ref(0);
let ticker = null;

function startWait(seconds) {
    wait.value = seconds;
    clearInterval(ticker);

    ticker = setInterval(() => {
        wait.value -= 1;

        if (wait.value <= 0) {
            clearInterval(ticker);
            ticker = null;
        }
    }, 1000);
}

onUnmounted(() => clearInterval(ticker));

const resend = async () => {
    if (wait.value) {
        return;
    }

    try {
        await signUp(signUpData.email, signUpData.password, signUpData.login);
        ElMessage.success('Даслалі ліст яшчэ раз');
        // Столькі ж чакае і сам Supabase паміж лістамі. Кнопка, якая нічога не
        // робіць, горшая за кнопку, якая сумленна кажа, колькі засталося.
        startWait(60);
    } catch (e) {
        const said = String(e?.message || '').toLowerCase();

        if (said.includes('rate limit') || said.includes('only request this after') || said.includes('too many')) {
            ElMessage.info('Крыху зачакай — лісты нельга слаць адзін за адным');
            startWait(60);
            return;
        }

        ElMessage.error(commonError);
        throw e;
    }
};

const submit = async () => {
    if (!form.value) {
        return;
    }
    loading.value = true;
    try {
        await signUp(signUpData.email, signUpData.password, signUpData.login);
        // Нікуды не пераходзім: чалавеку зараз няма чаго рабіць на сайце, пакуль
        // ён не адкрые пошту. Адрас паказваем той, які ён напісаў, — каб адразу
        // было відаць памылку ў ім, а не праз дзесяць хвілін чакання ліста.
        sent.value = signUpData.email.trim();
    } catch (e) {
        ElMessage.error(commonError);
        throw e;
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped></style>
