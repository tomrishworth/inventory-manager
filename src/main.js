import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './registerServiceWorker';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import {
  faEllipsisV as farEllipsisV,
  faPlus as farPlus,
  faPen as farPen,
  faTrashAlt as farTrashAlt
} from '@fortawesome/pro-regular-svg-icons';

library.add(farEllipsisV, farPlus, farPen, farTrashAlt);

Vue.component('font-awesome-icon', FontAwesomeIcon);

import { firestorePlugin } from 'vuefire';
import BootstrapVue from 'bootstrap-vue';
import { formatMoney } from 'accounting';

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

Vue.filter('currency', function(value) {
  return formatMoney(value);
});

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
