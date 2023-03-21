<template>
    <div class="spinner" :class="`spinner--size-${size} spinner--color-${color}`">
        <div class="spinner__content"></div>
    </div>
</template>
<script setup>
defineProps({
    size: {
        validator: (value) => ['sm', 'lg'].includes(value),
        default: 'sm',
    },
    color: {
        validator: (value) => ['light', 'dark'].includes(value),
        default: 'dark',
    },
});
</script>
<style scoped>
.spinner {
    display: inline-block;
}

.spinner,
.spinner--size-sm {
    --spinner-size: 1rem;
    --spinner-thickness: 2px;
}

.spinner--size-lg {
    --spinner-size: 4rem;
    --spinner-thickness: 4px;
}

.spinner,
.spinner--color-dark {
    --spinner-color: rgba(0, 0, 0, 0.5);
}

.spinner--color-light {
    --spinner-color: rgba(255, 255, 255);
}

.spinner__content {
    width: calc(var(--spinner-size) - var(--spinner-thickness));
    height: calc(var(--spinner-size) - var(--spinner-thickness));
    border-top: var(--spinner-thickness) solid var(--spinner-color);
    border-right: var(--spinner-thickness) solid transparent;
    border-radius: 50%;
    animation: rotation 0.8s linear infinite;
}

@keyframes rotation {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}
</style>
