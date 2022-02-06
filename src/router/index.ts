import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";
import LoginScreen from "@/components/genericcomponents/usermanagement/LoginScreen.vue";
import MainDashboardSolidData from "@/components/modules/editor/MainDashboardSolidData.vue";




const routes: Array<RouteRecordRaw> = [

  {
    path: "/",
    name: "Login",
    component: LoginScreen,
  },
  {
    path: "/editor",
    name: "Editor",
    component: MainDashboardSolidData,
  },
  // {
  //   path: "/doodle",
  //   name: "Doodle",
  //   component: doodle,
  // },
  // {
  //   path: "/forms",
  //   name: "Forms",
  //   component: forms,
  // },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
