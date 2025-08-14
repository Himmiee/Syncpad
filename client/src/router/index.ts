import { createRouter, createWebHistory } from "vue-router";

import Home from "@/views/Home.vue";
import Register from "@/views/auth/Register.vue";
import Login from "@/views/auth/Login.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import AuthLayout from "@/layouts/AuthLayout.vue";

const routes = [
  {
    path: "/",
    component: DefaultLayout,
    children: [{ path: "", component: Home }],
  },
  {
    path: "/auth",
    component: AuthLayout,
    children: [
      { path: "login", component: Login },
      { path: "register", component: Register },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
