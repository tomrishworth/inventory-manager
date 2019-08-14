<template>
  <b-navbar class="bg-white border-bottom mb-4" toggleable="lg" type="light" variant="light">
    <b-navbar-brand href="#">Inventory Manager</b-navbar-brand>

    <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

    <b-collapse id="nav-collapse" is-nav>
      <b-navbar-nav v-if="currentUser">
        <b-nav-item to="/">Inventory</b-nav-item>
        <b-nav-item to="/recipes">Recipes</b-nav-item>
      </b-navbar-nav>

      <b-navbar-nav class="ml-auto">
        <b-nav-item v-if="!currentUser" :to="{name: 'signUp'}">Sign Up</b-nav-item>
        <b-nav-item v-if="!currentUser" :to="{name: 'signIn'}">Sign In</b-nav-item>
        <b-nav-item-dropdown v-if="currentUser" right>
          <template slot="button-content">
            <img width="50" class="img-thumbnail rounded-circle ml-2" :src="currentUser.photoURL" />
            {{ currentUser.displayName }}
          </template>
          <b-dropdown-item href="#">Profile</b-dropdown-item>
          <b-dropdown-item @click="logout">Logout</b-dropdown-item>
        </b-nav-item-dropdown>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>

<script>
import { auth } from "@/db";

export default {
  methods: {
    logout() {
      auth.signOut().then(() => {
        this.$router.replace("signIn");
      });
    }
  },
  computed: {
    currentUser() {
      return this.$store.state.currentUser;
    }
  }
};
</script>