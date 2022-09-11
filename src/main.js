import {createApp}      from 'vue'
import './assets/main.css'
import App              from './App.vue'
import router           from "./router";
import * as Sentry      from "@sentry/vue";
import {BrowserTracing} from "@sentry/tracing";

const app = createApp(App)

if (import.meta.env.MODE !== 'development') {
    Sentry.init({
        app,
        dsn         : import.meta.env.VITE_SENTRY_DSN,
        integrations: [
            new BrowserTracing({
                routingInstrumentation: Sentry.vueRouterInstrumentation(router),
                tracingOrigins        : ["localhost", "nisho.netlify.app", /^\//],
            }),
        ],
        tracesSampleRate: 1.0,
    });
}


app.use(router)
app.mount('#app')
