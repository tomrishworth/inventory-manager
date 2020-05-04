import Vue from 'vue';
import Vuex from 'vuex';
import { signInWithGoogle } from '@/db';
import { db } from '@/db';
import * as firebase from 'firebase/app';

Vue.use(Vuex);

const namespaced = true;

export default new Vuex.Store({
  namespaced,
  state: {
    currentUser: null,
    loadingInventoryItem: {},
    inventory: [],
    recipes: [],
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
    setInventory(state, payload) {
      state.inventory = payload;
    },
    setRecipes(state, payload) {
      state.recipes = payload;
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
    getInventory({ commit }, user) {
      db.collection('users')
        .doc(user.uid)
        .collection('inventory')
        .onSnapshot((snapshot) => {
          const inventory = [];
          snapshot.forEach((doc) => {
            const item = doc.data();
            item.id = doc.id;
            inventory.push(item);
          });
          commit('setInventory', inventory);
        });
    },
    createInventoryItem({ commit, getters }, payload) {
      db.collection('users')
        .doc(getters.getCurrentUserId.uid)
        .collection('inventory')
        .add({
          name: payload.name,
          value: payload.value,
          unit: payload.unit,
          cost: payload.cost,
          costAmount: payload.costAmount,
          costUnit: payload.costUnit,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        });
      // Need to update store
    },
    editInventoryItem({ commit, getter }, payload) {
      console.log(payload);
    },
    createRecipe({ commit, getters }, payload) {
      console.log('Create receipe action fired');

      const refRecipe = db
        .collection('users')
        .doc(getters.getCurrentUserId.uid)
        .collection('recipes');

      const newRecipeRef = refRecipe.doc();

      console.log(newRecipeRef);

      const recipe = {
        name: payload.name,
        retailPrice: payload.retailPrice,
        batchSize: payload.batchSize,
        batchLabel: payload.batchLabel,
        items: payload.items,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      };

      refRecipe.doc(newRecipeRef.id).set(recipe);

      // Need to update store
    },
    editRecipe({ commit, getters }, payload) {
      console.log(payload);
      db.collection('users')
        .doc(getters.getCurrentUserId.uid)
        .collection('recipes')
        .doc(payload.id)
        .set(payload)
        .then(() => {
          // this.$bvToast.toast(`${payload.name} updated`);
        });

      // Need to update store
    },
    getRecipes({ commit }, user) {
      db.collection('users')
        .doc(user.uid)
        .collection('recipes')
        .onSnapshot((snapshot) => {
          const recipes = [];
          snapshot.forEach((doc) => {
            const item = doc.data();
            item.id = doc.id;
            recipes.push(item);
          });
          commit('setRecipes', recipes);
        });
    },
  },
  getters: {
    inventory(state) {
      return state.inventory;
    },
    getRecipeById(state) {
      return (recipeId) => {
        return state.recipes.find((recipe) => {
          return recipe.id === recipeId;
        });
      };
    },
    getCurrentUserId(state) {
      return state.currentUser;
    },
  },
});
