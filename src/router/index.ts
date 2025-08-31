// eslint-disable
import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router';
import paths from './paths';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

const router = createRouter({
  history: createWebHashHistory('/'),
  linkActiveClass: 'active',
  routes: paths as unknown as RouteRecordRaw[],
});

router.beforeEach((to, from, next) => {
  NProgress.start();
  next();
});

router.afterEach(() => {
  NProgress.done();
  try {
    const el = document.querySelector('.loading');
    if (el && el instanceof HTMLElement) { (el as HTMLElement).style.display = 'none'; }
  } catch (e) {}
});

export default router;
