import { createRouter, createWebHistory } from 'vue-router';
import store from './store.js';
import * as components from '../components'; // Import all components

const routes = [
  { path: '/', component: components.Home },

  // Authentication Routes
  { path: '/login', component: components.Login },
  { path: '/adminlogin', component: components.AdminLogin },
  { path: '/register', component: components.Register },
  // { path: '/logout', redirect: '/login' },

  // Admin Routes
  { path: '/home_admin/:user_id', component: components.HomeAdmin, meta: { requiresAuth: true, role: 'Admin' } },
  { path: '/search_admin/:user_id', component: components.SearchAdmin, meta: { requiresAuth: true, role: 'Admin' } },
  { path: '/summary_admin/:user_id', component: components.SummaryAdmin, meta: { requiresAuth: true, role: 'Admin' } },

  // Professional Routes
  { path: '/home_professional/:user_id', component: components.HomeProfessional, meta: { requiresAuth: true, role: 'Professional' } },
  { path: '/search_professional/:user_id', component: components.SearchProfessional, meta: { requiresAuth: true, role: 'Professional' } },
  { path: '/summary_professional/:user_id', component: components.SummaryProfessional, meta: { requiresAuth: true, role: 'Professional' } },

  // Customer Routes
  { path: '/home_customer/:user_id', component: components.HomeCustomer, meta: { requiresAuth: true, role: 'Customer' } },
  { path: '/search_customer/:user_id', component: components.SearchCustomer, meta: { requiresAuth: true, role: 'Customer' } },
  { path: '/summary_customer/:user_id', component: components.SummaryCustomer, meta: { requiresAuth: true, role: 'Customer' } },

  // //BACKEND 
  // // Admin: View & Manage Service Requests  
  // { path: '/view_request/:id', component: components.ViewRequest, meta: { requiresAuth: true, role: 'Admin' } },  
  // { path: '/delete_request/:request_id', component: components.DeleteRequest, meta: { requiresAuth: true, role: 'Admin' } },  

  // // Professional: Manage Service Requests  
  // { path: '/service_request_action/:user_id/:request_id/:action', component: components.ServiceRequestAction, meta: { requiresAuth: true, role: 'Professional' } },  

  // { path: '/view_professional/:id', component: components.ViewProfessional, meta: { requiresAuth: true, role: 'Admin' } },  
  // { path: '/view_customer/:id', component: components.ViewCustomer, meta: { requiresAuth: true, role: 'Admin' } },  

  // { path: '/add_service', component: components.AddService, meta: { requiresAuth: true, role: 'Admin' } },  
  // { path: '/update_service/:service_id', component: components.UpdateService, meta: { requiresAuth: true, role: 'Admin' } },  
  
  // { path: '/book_service/:user_id', component: components.BookService, meta: { requiresAuth: true, role: 'Customer' } },  
  // { path: '/close_request/:user_id/:request_id', component: components.CloseRequest, meta: { requiresAuth: true, role: 'Customer' } },  

  // { path: '/export_csv/:professional_id', component: components.ExportCSV, meta: { requiresAuth: true, role: 'Admin' } },  

  // Catch-all route for 404
  // { path: '/:pathMatch(.*)*', redirect: '/' },
];

// Create Router
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation Guards
// router.beforeEach((to, from, next) => {
//   // const isLoggedIn = store.getters.isLoggedIn
//   const isAuth = store.getters.isAuth
//   const userRole = store.getters.userRole

//   if (to.meta.requiresAuth && !isAuth) {
//     next('/login');
//   } else if (to.meta.requiresAuth && to.meta.role !== userRole) {
//     next('/') // Redirect to home or unauthorized page
//   } else if (isAuth && (to.path === '/login' || to.path === '/register' || to.path === '/adminlogin')) {
//     next(`/home_${userRole.toLowerCase()}/${store.getters.userId}`)
//   } else {
//     next()
//   }
// })
router.beforeEach((to, from, next) => {
  const isAuth = store.getters.isAuth || !!localStorage.getItem('authToken'); // Check Vuex and localStorage
  const userRole = store.getters.userRole || localStorage.getItem('role');
  const userId = store.getters.userId || localStorage.getItem('userId');

  if (to.meta.requiresAuth && !isAuth) {
    next('/login');
  } else if (to.meta.requiresAuth && to.meta.role !== userRole) {
    next('/'); // Redirect to home or unauthorized page
  } else if (isAuth && ['/login', '/register', '/adminlogin'].includes(to.path)) {
    next(`/home_${userRole.toLowerCase()}/${userId}`);
  } else {
    next();
  }
});

export default router;
