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
        {
          path: 'onboarding',
          component: () => import('../views/login/Onboarding.vue'),
          meta: {
            isOnboarding: true,
          },
        },
      ],
      meta: {
        requiresAuth: false,
      },
    },
    {
      path: '/',
      component: () => import('../views/dashboard/Dashboard.vue'),
      children: [
        { path: '', component: () => import('../views/dashboard/Home.vue') },
        { path: 'groups', component: () => import('../views/dashboard/Groups.vue') },
        { path: 'expenses', component: () => import('../views/dashboard/Expenses.vue') },
        { path: 'profile', component: () => import('../views/dashboard/Profile.vue') },
      ],
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('../views/NotFound.vue'),
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

  // Ensure user is onboarded
  const username = session?.user?.user_metadata.name as string | undefined;
  if (!to.path.includes('/login') && !to.meta.isOnboarding && !username) {
    return router.push('/login/onboarding');
  }

  // prevent authenticated users from seeing auth page
  if (to.path.includes('/login') && !to.meta.isOnboarding && isAuthenticated) {
    return router.push('/');
  }
});

export default router;
