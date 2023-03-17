import {createRouter, createWebHistory} from 'vue-router'
import Terms                            from './Terms.vue';
import Term                             from './Term.vue';
import About                            from './About.vue';
import Team                             from './Team.vue';
import Donation                         from './Donation.vue';
import Contacts                         from './Contacts.vue';
import Rules                            from './Rules.vue';
import Bugs                             from './Bugs.vue';
import Add                              from './Add.vue';
import DefaultLayout                    from './DefaultLayout.vue';
import SimplifiedLayout                 from './SimplifiedLayout.vue';
import ComplainAboutDefinition          from './ComplainAboutDefinition.vue';

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
        path     : '/kamanda',
        component: DefaultLayout,
        children : [
            {
                name     : 'team',
                path     : '',
                component: Team,
            }
        ],
    },
    {
        path     : '/zadanacic',
        component: DefaultLayout,
        children : [
            {
                name     : 'donation',
                path     : '',
                component: Donation,
            }
        ],
    },
    {
        path     : '/kantakty',
        component: DefaultLayout,
        children : [
            {
                name     : 'contacts',
                path     : '',
                component: Contacts,
            }
        ],
    },
    {
        path     : '/pravily',
        component: DefaultLayout,
        children : [
            {
                name     : 'rules',
                path     : '',
                component: Rules,
            }
        ],
    },
    {
        path     : '/bugs',
        component: DefaultLayout,
        children : [
            {
                name     : 'bugs',
                path     : '',
                component: Bugs,
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
    {
        path     : '/paskardzicca',
        component: SimplifiedLayout,
        children : [
            {
                name     : 'complain',
                path     : '',
                component: ComplainAboutDefinition,
            }
        ],

    },
]
const routes = [...main]
const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior: () => ({ top: 0, behavior: 'smooth' }),
})
router.beforeEach((to) => {
    document.title = to.meta && to.meta.title ? `${to.meta.title} - Нішо` : 'Нішо'
})

export default router

