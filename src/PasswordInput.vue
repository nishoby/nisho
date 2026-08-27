<template>
    <el-input
        :type="visible ? 'text' : 'password'"
        :model-value="modelValue"
        :name="name"
        :id="id"
        :placeholder="placeholder"
        @update:model-value="(value) => emit('update:modelValue', value)"
    >
        <template #suffix>
            <!-- Кнопка, а не проста значок: націскаць будуць пальцам, і трапіць
                 у сам малюнак 20×20 на тэлефоне амаль немагчыма. Падушка вакол
                 значка робіць мішэнь удвая большай, застаючыся нябачнай. -->
            <button class="password-eye" type="button" :title="action" :aria-label="action" @click="visible = !visible">
                <IconEyeOff v-if="visible" class="password-eye_icon" />
                <IconEye v-else class="password-eye_icon" />
            </button>
        </template>
    </el-input>
</template>

<script setup>
import { computed, ref } from 'vue';
import IconEye from './icons/IconEye.vue';
import IconEyeOff from './icons/IconEyeOff.vue';

defineProps({
    modelValue: { type: String, default: '' },
    name: { type: String, default: '' },
    id: { type: String, default: '' },
    placeholder: { type: String, default: '' },
});

const emit = defineEmits(['update:modelValue']);

const visible = ref(false);

// Значок паказвае дзеянне, а не стан. Пароль схаваны — вока адкрытае
// («паказаць»); пароль відаць — вока перакрэсленае («схаваць»). Калі б значок
// паказваў стан, ён быў бы люстэркам таго, што і так відаць у полі: там або
// кропкі, або літары. А вось што адбудзецца пры націску — не відаць ніяк.
const action = computed(() => (visible.value ? 'Схаваць пароль' : 'Паказаць пароль'));
</script>

<style scoped></style>
