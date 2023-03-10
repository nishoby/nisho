import {createRouter, createWebHistory} from 'vue-router'
import Terms                            from './Terms.vue';
import Term                             from './Term.vue';
import About                            from './About.vue';
import Add                              from './Add.vue';
import DefaultLayout                    from './DefaultLayout.vue';
import SimplifiedLayout                 from './SimplifiedLayout.vue';

const main   = [
    {
        path     : '/',
        exclude  : true,
        component: DefaultLayout,
        children : [
            {
                name     : 'terms',
                path     : '',
                component: Terms,
            }
        ],
    },
    {
        path     : '/term/:id',
        component: DefaultLayout,
        children : [
            {
                name     : 'term',
                path     : '',
                component: Term,
            }
        ],
    },
    {
        path     : '/apisannie',
        component: DefaultLayout,
        children : [
            {
                name     : 'about',
                path     : '',
                component: About,
            }
        ],
    },
    {
        path     : '/add',
        component: SimplifiedLayout,
        children : [
            {
                name     : 'add',
                path     : '',
                component: Add,
            }
        ],

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

