<template>
  <div id="app" :class="{'has-sidebar': currentUser }">
    <div v-if="currentUser">
      <app-sidebar></app-sidebar>
      <router-view />
    </div>
    <div class="d-flex flex-column align-center my-8" v-else>
      <img class="logo mb-6" src="./assets/images/logo.svg" />
      <sign-in class="mx-auto" style="width:300px;"></sign-in>
    </div>
  </div>
</template>

<script>
import AppSidebar from "@/components/AppSidebar.vue";
import SignIn from "@/components/auth/SignIn.vue";
import { auth } from "@/db.js";

export default {
  components: {
    AppSidebar,
    SignIn
  },
  computed: {
    currentUser() {
      return this.$store.state.currentUser;
    }
  },
  created() {
    auth.onAuthStateChanged(user => {
      if (user) {
        this.$store.dispatch("setCurrentUser", user);
      } else {
        this.$store.dispatch("setCurrentUser", null);
      }
    });
  }
};
</script>

<style lang="scss">
@import "./assets/scss/style.scss";
</style>