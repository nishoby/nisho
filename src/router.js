import {createRouter, createWebHistory} from 'vue-router'
import Terms                             from './Terms.vue';

const main   = [
    {
        path     : '/',
        name     : 'terms',
        exclude  : true,
        component: Terms,
    },
]
const routes = [...main]
const router = createRouter({
    history: createWebHistory(),
    routes
})
router.beforeEach((to) => {
    document.title = to.meta && to.meta.title ? `${to.meta.title} - Нішо` : 'Нішо'
})

export default router

