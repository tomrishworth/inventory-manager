import Vue from 'vue';
import App from './App.vue';
import router from './router';
import VueRouter from 'vue-router';
import store from './store';
import './registerServiceWorker';

Vue.use(VueRouter);

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import {
  faEllipsisV as farEllipsisV,
  faPlus as farPlus,
  faPen as farPen,
  faTrashAlt as farTrashAlt,
  faArrowLeft as farArrowLeft,
} from '@fortawesome/pro-regular-svg-icons';

library.add(farEllipsisV, farPlus, farPen, farTrashAlt, farArrowLeft);

Vue.component('font-awesome-icon', FontAwesomeIcon);

// import { firestorePlugin } from 'vuefire';
import BootstrapVue from 'bootstrap-vue';
import { formatMoney } from 'accounting';
import VueUnits from 'vue-units';
import vSelect from 'vue-select';
// import round from 'lodash';
import _ from 'lodash';

Vue.component('v-select', vSelect);
Vue.use(VueUnits);

// Vue.use(firestorePlugin);
Vue.use(BootstrapVue, {
  BToast: {
    autoHideDelay: 5000,
    solid: true,
    variant: 'primary',
    toaster: 'b-toaster-bottom-center',
    toastClass: 'snack',
  },
});

Vue.filter('currency', function(value) {
  return formatMoney(value);
});

Vue.filter('rounded', function(value) {
  return _.round(value, 2);
});

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');

export const vm = new Vue();
