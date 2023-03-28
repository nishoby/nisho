import { createRouter, createWebHistory } from 'vue-router';
import Terms from './Terms.vue';
import Term from './Term.vue';
import About from './About.vue';
import Team from './Team.vue';
import Donation from './Donation.vue';
import Contacts from './Contacts.vue';
import Rules from './Rules.vue';
import Bugs from './Bugs.vue';
import Add from './Add.vue';
import Edit from './Edit.vue';
import FAQ from './FAQ.vue';
import Login from './Login.vue';
import DefaultLayout from './DefaultLayout.vue';
import SimplifiedLayout from './SimplifiedLayout.vue';
import ComplainAboutDefinition from './ComplainAboutDefinition.vue';
import UserWords from './UserWords.vue';
import NotFoundPage from './NotFoundPage.vue';
import { getUser } from './user.js';
import { ElMessage } from 'element-plus';

const onlyAuthorized = () => {
    const user = getUser();
    if (user === null) {
        ElMessage.warning('Каб працягнуць аперацыю, вам трэба залагініцца');

        return {
            name: 'login',
        };
    }
    return true;
};

const main = [
    {
        path: '/',
        exclude: true,
        component: DefaultLayout,
        children: [
            {
                name: 'terms',
                path: '',
                component: Terms,
            },
        ],
    },
    {
        path: '/slova/:id',
        component: DefaultLayout,
        children: [
            {
                name: 'term',
                path: '',
                component: Term,
            },
        ],
    },
    {
        path: '/apisanne',
        component: DefaultLayout,
        children: [
            {
                name: 'about',
                path: '',
                component: About,
            },
        ],
    },
    {
        path: '/kamanda',
        component: DefaultLayout,
        children: [
            {
                name: 'team',
                path: '',
                component: Team,
            },
        ],
    },
    {
        path: '/zadanacic',
        component: DefaultLayout,
        children: [
            {
                name: 'donation',
                path: '',
                component: Donation,
            },
        ],
    },
    {
        path: '/kantakty',
        component: DefaultLayout,
        children: [
            {
                name: 'contacts',
                path: '',
                component: Contacts,
            },
        ],
    },
    {
        path: '/pravily',
        component: DefaultLayout,
        children: [
            {
                name: 'rules',
                path: '',
                component: Rules,
            },
        ],
    },
    {
        path: '/bugs',
        component: DefaultLayout,
        children: [
            {
                name: 'bugs',
                path: '',
                component: Bugs,
            },
        ],
    },
    {
        path: '/dadac-slova',
        component: SimplifiedLayout,
        children: [
            {
                name: 'add',
                path: '',
                component: Add,
                beforeEnter: [onlyAuthorized],
            },
        ],
    },
    {
        path: '/redahavac',
        component: SimplifiedLayout,
        children: [
            {
                name: 'edit',
                path: '',
                component: Edit,
            },
        ],
    },
    {
        path: '/paskardzicca',
        component: SimplifiedLayout,
        children: [
            {
                name: 'complain',
                path: '',
                component: ComplainAboutDefinition,
            },
        ],
    },
    {
        path: '/mae-slovy',
        component: DefaultLayout,
        children: [
            {
                name: 'current-user-words',
                path: '',
                component: UserWords,
            },
        ],
    },
    {
        path: '/autar/:id',
        component: DefaultLayout,
        children: [
            {
                name: 'user-words',
                path: '',
                component: UserWords,
            },
        ],
    },
    {
        path: '/faq',
        component: DefaultLayout,
        children: [
            {
                name: 'faq',
                path: '',
                component: FAQ,
            },
        ],
    },
    {
        path: '/lagin',
        component: SimplifiedLayout,
        children: [
            {
                name: 'login',
                path: '',
                component: Login,
            },
        ],
    },
    {
        path: '/:pathMatch(.*)',
        component: SimplifiedLayout,
        children: [
            {
                name: 'not-found',
                path: '',
                component: NotFoundPage,
            },
        ],
    },
];
const routes = [...main];
const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior: () => ({ top: 0, behavior: 'smooth' }),
});
router.beforeEach((to) => {
    document.title = to.meta && to.meta.title ? `${to.meta.title} - Нішо` : 'Нішо';
});

export default router;
