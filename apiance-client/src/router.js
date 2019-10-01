import Vue from 'vue'
import Router from 'vue-router'

import AuthRequired from '@/utils/AuthRequired'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      component: () => import(/* webpackChunkName: "app-start" */ './views/app'),
      redirect: '/app/home',
      beforeEnter: AuthRequired,
      children: [
        {
          path: '/app/apis/:id',
          props: true,
          name: 'apis',
          component: () => import(/* webpackChunkName: "Home" */ './views/app/Apis.vue')
        },
        {
          path: '/app/home',
          name: 'home',
          component: () => import(/* webpackChunkName: "About" */ './views/app/Home.vue')
        },
        {
          path: '/app/about',
          name: 'about',
          component: () => import(/* webpackChunkName: "About" */ './views/app/About.vue')
        }
      ]
    }, {
      path: '/admin',
      name: 'admin',
      component: () => import(/* webpackChunkName: "Home" */ './views/Admin.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import(/* webpackChunkName: "Login" */ './views/Login.vue')
    },
    { path: '/error', component: () => import(/* webpackChunkName: "error" */ './views/Error.vue') },
    { path: '*', component: () => import(/* webpackChunkName: "error" */ './views/Error.vue') }
  ]
})
