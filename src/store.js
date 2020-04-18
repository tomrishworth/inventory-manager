import Vue from 'vue';
import Vuex from 'vuex';
import { signInWithGoogle } from '@/db';
import { db } from '@/db';

Vue.use(Vuex);

const namespaced = true;

export default new Vuex.Store({
  namespaced,
  state: {
    currentUser: null,
    loadingInventoryItem: {},
    liquids: [
      {
        id: 'rapeSeedOil',
        name: 'Rape Seed Oil',
        density: 0.92,
        temp: 20,
      },
      {
        id: 'oliveOil',
        name: 'Olive Oil',
        density: 0.9137,
        temp: 20,
      },
    ],
    units: [
      { value: 'kg', text: 'Kilograms' },
      { value: 'g', text: 'Grams' },
      {
        value: 'litres',
        text: 'Litres',
      },
      {
        value: 'ml',
        text: 'Millilitres',
      },
    ],
  },
  mutations: {
    setCurrentUser(state, payload) {
      state.currentUser = payload;
    },
    inventoryItemLoadingStatus(state, payload) {
      Vue.set(state.loadingInventoryItem, payload.id, payload.loading);
    },
  },
  actions: {
    signIn() {
      signInWithGoogle()
        .then(() => {
          this.$router.replace('inventory');
        })
        .catch((err) => {
          this.feedback = err.message;
        });
    },
    signUp() {
      signInWithGoogle()
        .then((cred) => {
          db.collection('users')
            .doc(cred.user.uid)
            .set({
              name: cred.user.displayName,
              userId: cred.user.uid,
            });
        })
        .then(() => {
          this.$router.replace('inventory');
        });
    },
    setCurrentUser({ commit }, payload) {
      commit('setCurrentUser', payload);
    },
    inventoryItemLoadingStatus({ commit }, payload) {
      commit('inventoryItemLoadingStatus', payload);
    },
  },
});
