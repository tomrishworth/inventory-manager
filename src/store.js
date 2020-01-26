import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    currentUser: null,
    loadingInventoryItem: {},
    liquids: [
      {
        id: 'rapeSeedOil',
        name: 'Rape Seed Oil',
        density: 0.92,
        temp: 20
      },
      {
        id: 'oliveOil',
        name: 'Olive Oil',
        density: 0.9137,
        temp: 20
      }
    ],
    units: [
      { value: 'kg', text: 'Kilograms' },
      {
        value: 'litres',
        text: 'Litres'
      }
    ]
  },
  mutations: {
    setCurrentUser(state, payload) {
      state.currentUser = payload;
    },
    inventoryItemLoadingStatus(state, payload) {
      Vue.set(state.loadingInventoryItem, payload.id, payload.loading);
    }
  },
  actions: {
    setCurrentUser({ commit }, payload) {
      commit('setCurrentUser', payload);
    },
    inventoryItemLoadingStatus({ commit }, payload) {
      commit('inventoryItemLoadingStatus', payload);
    }
  }
});
