<template>
  <div id="app" :class="{ 'has-sidebar': currentUser }">
    <div v-if="loading" class="loading-spinner">
      <b-spinner label="Loading..."></b-spinner>
    </div>
    <div v-else>
      <div v-if="currentUser">
        <app-sidebar></app-sidebar>
        <router-view />
      </div>
      <div class="d-flex flex-column align-center my-8" v-else>
        <div class="text-center">
          <img
            width="140"
            class="logo mb-6"
            src="https://res.cloudinary.com/earthbar/image/upload/v1635627150/earthbar-logo-500x500_jrbpio.svg"
          />
        </div>
        <sign-in class="mx-auto" style="width:300px;"></sign-in>
      </div>
    </div>
  </div>
</template>

<script>
import AppSidebar from '@/components/AppSidebar.vue';
import SignIn from '@/components/auth/SignIn.vue';
import { auth } from '@/db.js';
import { db } from '@/db';

export default {
  data() {
    return {
      loading: false,
    };
  },
  components: {
    AppSidebar,
    SignIn,
  },
  computed: {
    currentUser() {
      return this.$store.state.currentUser;
    },
  },
  created() {
    this.loading = true;
    auth.onAuthStateChanged((user) => {
      // this.refRecipe = db
      //   .collection("users")
      //   .doc(user.uid)
      //   .collection("recipes");

      // this.refInventory = db
      //   .collection("users")
      //   .doc(user.uid)
      //   .collection("inventory");

      if (user) {
        this.$store.dispatch('setCurrentUser', user);
        this.$store.dispatch('getInventory', user);
        this.$store.dispatch('getRecipes', user);
        this.loading = false;
      } else {
        this.$store.dispatch('setCurrentUser', null);
        this.loading = false;
      }
    });
  },
};
</script>

<style lang="scss">
@import './assets/scss/style.scss';

.loading-spinner {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
