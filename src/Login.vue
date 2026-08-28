<template>
    <div class="login bcg-purple">
        <h1 class="title title-white">
            <button class="back-btn" type="button" aria-label="Назад" @click="router.back()">
                <img src="/assets/img/back.svg" alt="" /></button
            >Уваход
        </h1>
        <el-form
            class="login_form"
            ref="form"
            :model="signInData"
            :rules="rules"
            @submit.prevent="submit"
            label-position="top"
        >
            <button type="reset" class="cross" @click="router.back()"></button>
            <el-form-item label="Лагін" prop="email">
                <el-input
                    class="email_input"
                    name="email"
                    placeholder="Email"
                    id="email_input"
                    v-model="signInData.email"
                />
            </el-form-item>
            <el-form-item label="Пароль" prop="password">
                <PasswordInput
                    class="password_input"
                    name="password"
                    id="password_input"
                    v-model="signInData.password"
                />
            </el-form-item>

            <router-link class="change-password" :to="{ name: 'restore-password' }"> Не памятаю пароль </router-link>

            <input class="login-submit-btn" type="submit" value="Уваход" :disabled="loading" />

            <div class="divider">
                <div class="divider-line"></div>
                <p>Ці</p>
                <div class="divider-line"></div>
            </div>
            <div class="gmail-registration">
                <img class="gmail-img" style="width: 1.5rem" src="/assets/img/gmail.svg" alt="" />
                <button class="gmail-registration-btn" type="button" @click="signInWithGoogle">Логін праз Gmail</button>
            </div>
            <div class="account">
                <p>Патрэбны аккаунт?</p>
                <router-link :to="{ name: 'registration' }" class="registration-link"> Рэгістрацыя</router-link>
            </div>
        </el-form>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { reactive, ref } from 'vue';
import PasswordInput from './PasswordInput.vue';
import { signInWithGoogle, signIn } from './auth.js';
import { ElMessage } from 'element-plus';
import { commonError } from './error.js';

const router = useRouter();

const loading = ref(false);
const form = ref();

const rules = reactive({
    email: [
        {
            required: true,
            message: 'Логін павінен быць',
            trigger: 'blur',
        },
    ],
    password: [
        {
            required: true,
            message: 'Пароль павінен быць',
            trigger: 'blur',
        },
    ],
});
const signInData = reactive({
    email: '',
    password: '',
});

// Чаму не пусціла.
//
// Раней тут быў адзін агульны тэкст на ўсё, апроч няправільнага пароля, —
// «не турбуйцеся, вы ўсё зрабілі правільна». А прычыны бываюць якраз такія,
// дзе зрабіць трэба: пацвердзіць пошту, пачакаць пасля некалькіх спробаў.
// Чалавек чытаў, што ўсё добра, і націскаў «Уваход» яшчэ раз.
//
// Supabase піша прычыны па-англійску і не абяцае іх нязменнасці, таму
// пазнаём па кавалку радка, а не па поўным супадзенні.
function loginError(error) {
    const said = String(error?.message || '').toLowerCase();

    if (said.includes('invalid login credentials')) {
        return 'Няправільная пошта ці пароль';
    }

    if (said.includes('not confirmed')) {
        return 'Пошта яшчэ не пацверджаная — зазірні ў ліст ад Нішо і націсні спасылку ў ім';
    }

    // «занадта часта» прыходзіць у некалькіх выглядах: і як rate limit, і як
    // «you can only request this after N seconds»
    if (said.includes('rate limit') || said.includes('only request this after') || said.includes('too many')) {
        return 'Занадта шмат спробаў запар. Крыху пачакай і паспрабуй зноў';
    }

    return commonError;
}

const submit = async () => {
    if (!form.value) {
        return;
    }
    await form.value.validate(async (valid) => {
        if (!valid) return;
        loading.value = true;
        try {
            await signIn(signInData.email, signInData.password);
            ElMessage.success('Паспяховая аўтарызацыя');
            await router.push({ name: 'terms' });
        } catch (e) {
            ElMessage.error(loginError(e));
            throw e;
        } finally {
            loading.value = false;
        }
    });
};
</script>

<style scoped></style>
