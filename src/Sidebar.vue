<template>
    <div class="sidebar-container mil-notdisplay bg-color-1 pdng-15px">
        <div>
            <router-link :to="{name: 'add'}">
                <el-button :icon="Plus" round size="large" type="danger">Дадаць</el-button>
            </router-link>
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
import {Plus} from '@element-plus/icons-vue'
</script>
