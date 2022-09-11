<template>
    <div class="sidebar-container mil-notdisplay bg-color-1 pdng-15px">
        <div>
            <el-button :icon="Plus" round size="large" type="danger" @click="goToAdding">Дадаць</el-button>
            <div class="pdng-t-20px">
                Твая мова - твае правілы
            </div>
        </div>
    </div>
    <div class="adv-container mil-notdisplay bg-color-1 pdng-15px">
        <div>
            Тут магла быць ваша рэклама
        </div>
    </div>
</template>
<script setup>
import {Plus}      from '@element-plus/icons-vue'
import {useRouter} from "vue-router";
import {ref}       from "vue";
import {getUser}   from "./user.js";
import {ElMessage} from "element-plus";

const router  = useRouter();
const account = ref(getUser())

const goToAdding = () => {
    if (account.value) {
        router.push({'name': 'add'})
        return;
    }
    ElMessage.warning('Каб дадаць слова, вам трэба залагініцца');
}
</script>
