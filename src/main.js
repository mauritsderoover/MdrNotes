import { createApp } from 'vue';
import PrimeVue from "primevue/config";
import App from './App.vue';
//import VueRouter from 'vue-router';
import VCCM from "vue-custom-context-menu"

import "primevue/resources/themes/saga-blue/theme.css";       //theme
import "primevue/resources/primevue.min.css";                 //core css
import "primeflex/primeflex.css"
import "primeicons/primeicons.css";                           //icons

const app = createApp(App);

//const router = VueRouter.createRouter()

app.use(VCCM);
app.use(PrimeVue);
//app.use(router);
app.mount('#app');

