import { createRouter, createWebHistory } from "vue-router";

import Home from "@/views/Home.vue";
import Notes from "@/views/Notes.vue";
import Tasks from "@/views/Tasks.vue";
import Team from "@/views/Team.vue";
import Settings from "@/views/Settings.vue";
import Register from "@/views/auth/Register.vue";
import Login from "@/views/auth/Login.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import AuthLayout from "@/layouts/AuthLayout.vue";
import ViewNote from "@/views/ViewNote.vue";

const routes = [
  {
    path: "/",
    redirect: "/dashboard",
  },
  {
    path: "/dashboard",
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
      { path: "", component: Home },
      { 
        path: "notes", 
        component: Notes,
        children: [
          { path: ":id", component: ViewNote },
        ]
      },
      { path: "tasks", component: Tasks },
      { path: "collaborators", component: Team },
      { path: "settings", component: Settings },
    ],
  },
  {
    path: "/auth",
    component: AuthLayout,
    meta: { requiresGuest: true },
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

// Auth Guard
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('accessToken');
  const isAuthenticated = !!token;

  // Check if route requires authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      next({
        path: '/auth/login',
        query: { redirect: to.fullPath }
      });
      return;
    }
  }

  // Check if route is for guests only (login/register)
  if (to.matched.some(record => record.meta.requiresGuest)) {
    if (isAuthenticated) {
      // Redirect to notes if already logged in
      next('/dashboard/notes');
      return;
    }
  }

  next();
});

export default router;

