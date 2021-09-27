import { createApp } from "vue";
import PrimeVue from "primevue/config";
import App from "./App.vue";

import "primevue/resources/themes/saga-blue/theme.css"; // theme
import "primevue/resources/primevue.min.css"; // core css
import "primeflex/primeflex.css";
import "primeicons/primeicons.css"; // icons
import "quill/dist/quill.snow.css";
// import "https://cdn.quilljs.com/1.3.6/quill.snow.css";

const app = createApp(App);

app.use(PrimeVue);

app.mount("#app");
