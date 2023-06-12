<template>
    <div class="registration bcg-reg">
        <h1 class="title title-white">Змена пароля</h1>
        <el-form class="login_form" label-position="top" ref="form" :rules="rules" @submit.prevent="submit">
            <button type="reset" class="cross" @click="router.back()"></button>
            <el-form-item label="Пароль" prop="password">
                <el-input
                    class="password_input"
                    type="password"
                    name="password"
                    id="password_input"
                    v-model="newPasswordData.password"
                />
            </el-form-item>
            <el-form-item label="Паўторна пароль" prop="password">
                <el-input
                    class="password_input"
                    type="password"
                    name="password_repeat"
                    id="password_repeat_input"
                    v-model="newPasswordData.password_repeat"
                />
            </el-form-item>

            <input class="registration-submit-btn" type="submit" value="Захаваць" :disabled="loading" />
            <div class="horiz-line"><p>Ці</p></div>
        </el-form>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { reactive, ref } from 'vue';
import { signInWithGoogle, signUp } from './auth.js';
import { ElMessage } from 'element-plus';

const router = useRouter();
const account = ref();
const loading = ref(false);
const newPasswordData = reactive({
    password: '',
    password_repeat: '',
});

const rules = reactive({
    password: [
        {
            required: true,
            message: 'Пароль павінна быць не меньш 3 сымбалеў',
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

const submit = async () => {
    if (!form.value) {
        return;
    }
    loading.value = true;
    try {
        // const data = await signUp(newPasswordData.email, newPasswordData.password, newPasswordData.login);
        console.log(data);
    } catch (e) {
        ElMessage.error('Праізашла памылка ў логіцы працы праграммы, не турбуйцеся, вы ўсе зрабілі правільна');
        throw e;
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped></style>
