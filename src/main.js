import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './registerServiceWorker';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import { faEllipsisV as farEllipsisV } from '@fortawesome/pro-regular-svg-icons';

library.add(farEllipsisV);

Vue.component('font-awesome-icon', FontAwesomeIcon);

import { firestorePlugin } from 'vuefire';
import BootstrapVue from 'bootstrap-vue';

Vue.use(firestorePlugin);
Vue.use(BootstrapVue, {
  BToast: {
    autoHideDelay: 3000,
    solid: true,
    variant: 'dark',
    toaster: 'b-toaster-bottom-center',
    toastClass: 'snack'
  }
});

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
