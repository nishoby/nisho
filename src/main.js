// Першым радком наўмысна: гэты файл чытае хвост адраса, які Supabase прыбірае
// адразу пасля таго, як разбярэ. Падключэнне ніжэй за кліент базы — і чытаць
// ужо няма чаго.
import './welcome.js';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import * as Sentry from '@sentry/vue';
import { BrowserTracing } from '@sentry/tracing';

const app = createApp(App);

if (import.meta.env.MODE !== 'development' && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
        app,
        dsn: import.meta.env.VITE_SENTRY_DSN,
        integrations: [
            new BrowserTracing({
                routingInstrumentation: Sentry.vueRouterInstrumentation(router),
                tracingOrigins: ['localhost', 'nisho.netlify.app', /^\//],
            }),
        ],
        tracesSampleRate: 1.0,
    });
}

app.use(router);
app.mount('#app');
