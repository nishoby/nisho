<template>
    <navbar></navbar>
    <div class="scene pdng-t-0">
        <template v-if="terms">
            <div class="committee-list size-50 mil-size-100 mil-flex-column">
                <div class="committee-unit mil-flex-column"
                     v-for="item of terms">
                    <div
                        class="section size-100 pdng-r-20px pdng-l-30px pdng-t-20px pdng-b-20px mil-size-100 mil-pdng-15px">
                        <h2 class="txt-color-1 txt-size-28pxpx txt-medium mil-txt-size-16px">
                            {{ item.term }}
                        </h2>
                        <div class="txt-color-2 txt-size-18px pdng-t-15px">
                            {{ item.definition[0].content }}
                        </div>
                        <div class="pdng-t-20px">
                            <el-button-group>
                                <el-button type="success" :icon="Top">0</el-button>
                                <el-button type="danger" :icon="Bottom">0</el-button>
                            </el-button-group>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<script setup>
import {onMounted, ref} from "vue";
import {supabase}       from "./supabase.js";
import {Top, Bottom}    from '@element-plus/icons-vue'
import Navbar           from "./Navbar.vue";

const terms   = ref([]);
const search  = ref()

const fetchTerms = async () => {
    let {data, error} = await supabase
        .from("term")
        .select(`*, definition(*)`)
        .order('created_at', {ascending: false, foreignTable: 'definition'})
        .limit(1, {foreignTable: 'definition'})
    if (error) {
        throw error
    }
    terms.value = data;
}

onMounted(() => {
    fetchTerms()
})

</script>

<style scoped>

</style>
