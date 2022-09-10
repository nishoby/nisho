import {createRouter, createWebHistory} from 'vue-router'
import Terms                            from './Terms.vue';
import Term                             from './Term.vue';
import About                            from './About.vue';
import Add                              from './Add.vue';

const main   = [
    {
        path     : '/',
        name     : 'terms',
        exclude  : true,
        component: Terms,
    },
    {
        path     : '/term/:id',
        name     : 'term',
        component: Term,
    },
    {
        path     : '/about',
        name     : 'about',
        component: About,
    },
    {
        path     : '/add',
        name     : 'add',
        component: Add,
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

