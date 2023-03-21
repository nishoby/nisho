<template>
    <div class="page-content-spinner">
        <Spinner size="lg" :color="spinnerColor" />
    </div>
</template>
<script setup>
import Spinner from './Spinner.vue';
import { computed } from 'vue';

const props = defineProps({
    pageTheme: {
        validator: (value) => ['purple', 'green'].includes(value),
        default: 'purple',
    },
});

const SPINNER_COLOR_FOR_THEME = {
    'purple': 'light',
    'green': 'dark',
};
const spinnerColor = computed(() => SPINNER_COLOR_FOR_THEME[props.pageTheme]);
</script>
<style scoped>
.page-content-spinner {
    display: flex;
    justify-content: center;
    padding: 8rem 0;
}
</style>
