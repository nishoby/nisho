<template>
    <div class="complaint-wrapper">
        <h1 class="title title-white">
            <button class="back-btn" type="button" aria-label="Назад" @click="router.back()">
                <img src="/assets/img/back.svg" alt="" /></button
            >Паcкардзіцца мадэратару
        </h1>
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
                <p class="complaint-subtitle">Мы выдаляем такія словы:</p>
                <div class="complaint-desc">
                    <ol>
                        <li>Унутраныя жарты без кантэксту</li>
                        <li>Тэрміны якія не з’яўляюцца рэальнымі</li>
                        <li>Сапраўдныя імёны і іншыя асабістыя дадзенныя</li>
                        <li>Выказванні нянавісці, здзекі, дыскрымінацыя, падбухторванне да гвалту</li>
                        <li>
                            Тэксты, што парушаюць іншыя нашыя
                            <router-link :to="{ name: 'rules' }" target="_blank">правілы</router-link>
                        </li>
                    </ol>
                </div>
            </div>

            <div class="complaint-block complaint-chosen" v-if="definition">
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

            <el-form-item prop="reason">
                <template #label>
                    Што не так са словам
                    <span class="label-hint">(яго тлумачэннем ці тэгам):</span>
                </template>
                <el-radio-group v-model="complaint.reason" class="reason-choose">
                    <el-radio label="unclear-term"> унутраны жарт без кантэксту ці не рэальны тэрмін;</el-radio>
                    <el-radio label="personal-data"> імя ці іншыя асабістыя дадзеныя;</el-radio>
                    <el-radio label="hostile-language"> мова варожасці;</el-radio>
                    <!-- асобны шлях: не выдаліць, а паправіць. Такіх зваротаў найбольш,
                         і раней яны ішлі пад «іншае» разам са скаргамі на змест -->
                    <el-radio label="fix-mistake"> проста памылка ў тэксце — трэба выправіць;</el-radio>
                    <el-radio label="other"> іншае </el-radio>
                </el-radio-group>
            </el-form-item>

            <el-form-item prop="comment">
                <!-- расцягваецца пад тэкст замест таго, каб трымаць пастаянную вышыню
                     на чатыры радкі, якая пуставала ў большасці скаргаў -->
                <el-input
                    v-model="complaint.comment"
                    type="textarea"
                    :autosize="{ minRows: 2 }"
                    placeholder="Патлумач сваю скаргу"
                />
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
import { commonError } from './error.js';

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
// Даўжыні на каментар няма наўмысна. Раней стаяла «мінімум 10 сымбалей», і
// гэта было правіла ні пра што: удакладненне бывае ў два словы і зусім
// слушнае — назваць само слова, паказаць на тэг, напісаць «імя». Чалавек,
// які бачыць чырвоны радок пад полем, не дапісвае думку, а прыдумляе словы
// дзеля лічбы — і мадэратар чытае гэтыя прыдуманыя словы.
const rules = reactive({
    reason: [{ required: true, message: 'Абавязкова', trigger: 'blur' }],
});
const form = ref();
const submit = async () => {
    if (!form.value) {
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
            ElMessage.error(commonError);
            throw error;
        } finally {
            loading.value = false;
        }
    });
};
</script>

<style scoped>
@media screen and (max-width: 992px) {
    .title {
        margin-left: 1.3rem;
    }
}
</style>

<style>
.el-radio__input.is-checked + .el-radio__label {
    --el-color-primary: #b3a5ff;
}
.el-radio__input.is-checked .el-radio__inner {
    --el-color-primary: #b3a5ff;
}
@media screen and (max-width: 992px) {
    .el-form-item__label {
        font-size: 1.6rem;
    }
    .el-radio {
        padding-bottom: 13px;
    }
    .el-radio__label {
        font-size: 1rem;
        line-height: 1rem;
        white-space: initial;
    }
}
</style>
