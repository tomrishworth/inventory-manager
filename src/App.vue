<template>
  <div id="app">
    <app-header></app-header>
    <router-view />
  </div>
</template>

<script>
import AppHeader from "@/components/AppHeader.vue";
import { auth } from "@/db.js";

export default {
  components: {
    AppHeader
  },
  created() {
    auth.onAuthStateChanged(user => {
      if (user) {
        console.log("setCurrentUser");
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