import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";
import LoginScreen from "@/components/genericcomponents/usermanagement/LoginScreen.vue";
import MainDashboardSolidData from "@/components/modules/editor/MainDashboardSolidData.vue";
import Callback from "@/components/genericcomponents/callback/Callback.vue";
import { getDefaultSession, login } from "@inrupt/solid-client-authn-browser";
import NotFound from "@/components/genericcomponents/notfound/NotFound.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/:catchAll(.*)",
    component: NotFound,
    name: "NotFound",
  },
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
  {
    path: "/callback",
    name: "Callback",
    component: Callback,
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

router.beforeEach((to, from, next) => {
  if (
    !getDefaultSession().info.isLoggedIn &&
    to.path !== "/callback" &&
    to.path !== "/login" &&
    to.name !== "NotFound"
  ) {
    login({
      oidcIssuer: "https://solidcommunity.net/",
      redirectUrl: "http://localhost:8080/callback",
    });
  } else {
    next();
  }
});

export default router;
