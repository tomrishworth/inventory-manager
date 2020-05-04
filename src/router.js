import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'inventory',
      component: () => import('./views/Inventory'),
    },
    {
      path: '/recipes',
      name: 'recipes',
      component: () => import('./views/Recipes.vue'),
    },
    {
      path: '/recipes/:id',
      name: 'recipe',
      props: true,
      component: () => import('./components/Recipes/Recipe.vue'),
    },
    {
      path: '/sign-up',
      name: 'signUp',
      component: () => import('./components/auth/SignUp.vue'),
    },
    {
      path: '/sign-in',
      name: 'signIn',
      component: () => import('./components/auth/SignIn.vue'),
    },
  ],
});
