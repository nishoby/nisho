<template>
    <el-form :model="form" label-width="120px" label-position="top">
        <el-form-item label="Слова">
            <el-input v-model="form.term"/>
        </el-form-item>
        <el-form-item label="Вызначэнне">
            <el-input v-model="form.definition" placeholder="please select your zone"/>
        </el-form-item>
        <el-form-item label="Прыклад">
            <el-input v-model="form.example" placeholder="please select your zone"/>
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="() => {}">Дадаць</el-button>
            <el-button>Cancel</el-button>
        </el-form-item>
    </el-form>
</template>

<script setup>
import {reactive} from 'vue'

const form = reactive({
    term      : '',
    definition: '',
    example   : '',
})
</script>

<style scoped>

</style>
