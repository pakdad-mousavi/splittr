import { supabase } from '@/utils/supabase';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      component: () => import('../views/login/Login.vue'),
      children: [
        { path: '', component: () => import('../views/login/Welcome.vue') },
        { path: 'otp', component: () => import('../views/login/Otp.vue') },
      ],
      meta: {
        requiresAuth: false,
      },
    },
    {
      path: '/',
      component: () => import('../views/dashboard/Home.vue'),
      meta: {
        requiresAuth: true,
      },
    },
  ],
});

router.beforeEach(async (to) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isAuthenticated = !!session;

  // routes requiring auth
  if (to.meta.requiresAuth && !isAuthenticated) {
    return router.push('/login');
  }

  // prevent authenticated users from seeing auth page
  if (to.path.includes('/login') && isAuthenticated) {
    return router.push('/');
  }
});

export default router;
