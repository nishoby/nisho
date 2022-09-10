<template>
    <div class="scene">
        <router-link :to="{name: 'terms'}">
            <el-button>Вярнуцца</el-button>
        </router-link>
        <h3 class="pdng-t-15px">Дадаць слова</h3>
        <el-form :model="form" label-width="120px" label-position="top" class="pdng-t-30px">
            <el-form-item label="Слова">
                <el-input v-model="form.term"/>
            </el-form-item>
            <el-form-item label="Вызначэнне">
                <el-input v-model="form.definition"
                          :type="'textarea'"
                          :rows="7"
                          placeholder="Вызначэнне"/>
            </el-form-item>
            <el-form-item label="Прыклад">
                <el-input v-model="form.example"
                          :type="'textarea'"
                          :rows="7"
                          placeholder="Прыклад"/>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="() => {}">Дадаць</el-button>
                <el-button>Cancel</el-button>
            </el-form-item>
        </el-form>
    </div>

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
