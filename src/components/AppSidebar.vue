<template>
  <!-- <b-navbar class="bg-white border-bottom mb-4" toggleable="lg" type="light" variant="light">
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
  </b-navbar>-->
  <div class="app-sidebar d-flex flex-column h-100">
    <div class="text-center mt-4 mb-6">
      <router-link class="bg-transparent" to="/">
        <img class="logo" src="../assets/images/logo.svg" />
      </router-link>
    </div>
    <b-nav vertical>
      <b-nav-item to="/"> <img src="../assets/images/warehouse-cart-icon.svg" /> Inventory </b-nav-item>
      <b-nav-item to="/recipes"> <img src="../assets/images/task-list-icon.svg" /> Recipes </b-nav-item>
      <b-nav-item to="/settings"> <img src="../assets/images/cog-icon.svg" /> Settings </b-nav-item>
    </b-nav>
    <div class="mt-auto">
      <b-dropdown variant="link" v-if="currentUser" right>
        <template slot="button-content">
          <b-avatar :src="currentUser.photoURL" variant="light"></b-avatar>
          <!-- <img width="50" class="img-thumbnail rounded-circle ml-2" :src="currentUser.photoURL" /> -->
          {{ currentUser.displayName }}
        </template>
        <b-dropdown-item href="#">Profile</b-dropdown-item>
        <b-dropdown-item @click="logout">Logout</b-dropdown-item>
      </b-dropdown>
      <div class="text-center mb-2" v-else>
        <router-link class="btn btn-outline-primary" to="/sign-in">Sign In</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { auth } from '@/db';

export default {
  methods: {
    logout() {
      auth.signOut().then(() => {
        this.$router.replace('signIn');
      });
    },
  },
  computed: {
    currentUser() {
      return this.$store.state.currentUser;
    },
  },
};
</script>

<style lang="scss" scoped>
.app-sidebar {
  width: 240px;
  left: 0;
  right: 0;
  top: 0;
  position: fixed;
  background-color: #fff;
  border-right: 1px solid $border-color;
  .nav-item {
    margin-left: $spacer-5;
    margin-right: $spacer-5;
    margin-bottom: $spacer-3;
    img {
      margin-right: $spacer-3;
    }
  }
  .nav-link {
    color: $body-color;
    border-radius: $border-radius-sm;
  }
  .router-link-exact-active {
    background-color: $light;
  }
}
</style>
