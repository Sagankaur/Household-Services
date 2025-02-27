import { createRouter, createWebHistory } from 'vue-router';
import store from './store.js';
import * as components from '../components'; // Import all components

const routes = [
  { path: '/', component: components.Home },

  // Authentication Routes
  { path: '/login', component: components.Login },
  { path: '/adminlogin', component: components.AdminLogin },
  { path: '/register', component: components.Register },
  { path: '/logout', redirect: '/login' },

  // Admin Routes
  { path: '/home_admin/:user_id', component: components.HomeAdmin, meta: { requiresAuth: true, role: 'Admin' } },
  { path: '/search_admin', component: components.SearchAdmin, meta: { requiresAuth: true, role: 'Admin' } },
  { path: '/summary_admin/:user_id', component: components.SummaryAdmin, meta: { requiresAuth: true, role: 'Admin' } },

  // Professional Routes
  { path: '/home_professional/:user_id', component: components.HomeProfessional, meta: { requiresAuth: true, role: 'Professional' } },
  { path: '/search_professional/:user_id', component: components.SearchProfessional, meta: { requiresAuth: true, role: 'Professional' } },
  { path: '/summary_professional/:user_id', component: components.SummaryProfessional, meta: { requiresAuth: true, role: 'Professional' } },

  // Customer Routes
  { path: '/home_customer/:user_id', component: components.HomeCustomer, meta: { requiresAuth: true, role: 'Customer' } },
  { path: '/search_customer', component: components.SearchCustomer, meta: { requiresAuth: true, role: 'Customer' } },
  { path: '/summary_customer/:user_id', component: components.SummaryCustomer, meta: { requiresAuth: true, role: 'Customer' } },

  // Catch-all route for 404
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

// Create Router
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation Guards
router.beforeEach((to, from, next) => {
  // const isLoggedIn = store.getters.isLoggedIn
  const isAuth = store.getters.isAuth
  const userRole = store.getters.userRole

  if (to.meta.requiresAuth && !isAuth) {
    next('/login');
  } else if (to.meta.requiresAuth && to.meta.role !== userRole) {
    next('/') // Redirect to home or unauthorized page
  } else if (isAuth && (to.path === '/login' || to.path === '/register' || to.path === '/adminlogin')) {
    next(`/home_${userRole.toLowerCase()}/${store.getters.userId}`)
  } else {
    next()
  }
})
export default router;
