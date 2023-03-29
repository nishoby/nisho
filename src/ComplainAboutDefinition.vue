<template>
    <div class="complaint-wrapper">
        <h1 class="title title-white">Паcкардзіцца мадэратару</h1>
        <el-form
            :model="complaint"
            ref="form"
            :rules="rules"
            @submit.prevent="submit"
            label-position="top"
            hide-required-asterisk
            class="complaint_form"
        >
            <button type="reset" class="cross" @click="router.back()"></button>
            <div class="complaint-block">
                <p class="complaint-subtitle">Мы выдаляем такія тлумачэнні...</p>
                <div class="complaint-desc">
                    <ol>
                        <li>Унутраныя жарты без кантэксту</li>
                        <li>Тэрміны якія не з’яўляюцца рэальнымі</li>
                        <li>Сапраўдныя імёны і іншыя асабістыя дадзенныя</li>
                        <li>Выказванні нянавісці, здзекі, дыскрымінацыя, падбухторванне да гвалту</li>
                        <li>
                            Тэксты, што парушаюць іншыя нашыя
                            <router-link :to="{ name: 'rules' }" target="_blank">гайдлайны</router-link>
                        </li>
                    </ol>
                </div>
            </div>

            <div class="complaint-block" v-if="definition">
                <p class="complaint-subtitle">Вы выбралі:</p>
                <div class="complaint-desc">
                    <router-link
                        class="card-title"
                        :to="{
                            name: 'term',
                            params: { id: definition.term.id },
                        }"
                    >
                        {{ definition.term.name }}
                    </router-link>
                    <div class="card-description">
                        {{ definition.content }}
                    </div>
                    <div class="card-example">
                        {{ definition.example }}
                    </div>
                </div>
            </div>

            <el-form-item label="Чаму трэба выдаліць тлумачэнне:" prop="reason">
                <el-radio-group v-model="complaint.reason">
                    <el-radio label="unclear-term"> унутраны жарт без кантэксту ці не рэальны тэрмін </el-radio>
                    <el-radio label="personal-data"> імя ці іншыя асабістыя дадзеныя </el-radio>
                    <el-radio label="hostile-language"> мова варожасці </el-radio>
                    <el-radio label="other"> іншае </el-radio>
                </el-radio-group>
            </el-form-item>

            <el-form-item prop="comment">
                <el-input v-model="complaint.comment" type="textarea" :rows="3" />
            </el-form-item>

            <input class="submit-btn" type="submit" value="Паскардзіцца" :disabled="loading" />
        </el-form>
    </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { supabase } from './supabase.js';
import { ElMessage } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';
import { getUser } from './auth.js';

const router = useRouter();
const route = useRoute();
const definition_id = route.query.id;

onMounted(async () => {
    await fetchDefinition();
});

const definition = ref(null);

async function fetchDefinition() {
    const { data, error } = await supabase
        .from('definition')
        .select(`*, term(*)`)
        .filter('id', 'eq', definition_id)
        .single();

    if (error) {
        throw error;
    }
    definition.value = data;
}

const loading = ref(false);

const complaint = reactive({
    reason: '',
    comment: '',
});
const rules = reactive({
    reason: [{ required: true, message: 'Абавязкова', trigger: 'blur' }],
    comment: [{ min: 10, message: 'мінімум 10 сымбалей', trigger: 'blur' }],
});
const form = ref();
const account = ref(getUser());
const submit = async () => {
    if (!form.value) {
        return;
    }
    if (!account.value) {
        ElMessage.warning('Каб паcкардзіцца на слова, вам трэба залагініцца');
        return;
    }

    await form.value.validate(async (valid) => {
        if (!valid) return;

        loading.value = true;
        try {
            let { error } = await supabase.rpc('add_complaint', {
                definition_id,
                reason: complaint.reason,
                comment: complaint.comment,
            });
            loading.value = false;
            if (error) {
                throw error;
            }
            ElMessage.success('Паспяхова даданая скарга');
            await router.back();
        } catch (error) {
            ElMessage.error('Адбылася памылка');
            throw error;
        } finally {
            loading.value = false;
        }
    });
};
</script>

<style scoped></style>
