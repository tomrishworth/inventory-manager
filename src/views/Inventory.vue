<template>
  <div class="home container">
    <h1>Inventory</h1>
    <div class="mb-4">
      <Item class="mb-2" v-for="item in indexedInventory" :key="item.id" :item="item"></Item>
    </div>
    <h2 class="h5">Add another</h2>
    <b-card bg-variant="light">
      <b-form class="d-flex align-items-end" @submit.prevent="addItem">
        <b-form-group class="mb-0 mr-2" label="Name" label-for="name">
          <b-form-input v-model="name" id="name"></b-form-input>
        </b-form-group>
        <b-form-group class="mb-0 mr-2" label="Amount" label-for="amount">
          <b-form-input type="number" step="0.01" v-model="value" id="amount"></b-form-input>
        </b-form-group>
        <b-form-group class="mb-0 mr-2" label="Type">
          <b-form-select v-model="unit" :options="options"></b-form-select>
        </b-form-group>
        <div>
          <b-btn type="submit" variant="primary">Add</b-btn>
        </div>
      </b-form>
    </b-card>
  </div>
</template>

<script>
import { db } from "@/db";
import { auth } from "@/db";
import * as firebase from "firebase/app";
import Item from "@/components/Inventory/Item";
import User from "@/components/User";
// import Qty from "js-quantities";
// import { unit } from 'mathjs';
// import math from "mathjs";

const users = db.collection("users");

export default {
  name: "home",
  components: {
    Item,
    User
  },
  data() {
    return {
      userID: null,
      user: null,
      users: [],
      inventory: [],
      name: null,
      value: null,
      unit: null,
      loading: false
    };
  },
  methods: {
    addItem() {
      db.collection("users")
        .doc(this.$store.state.currentUser.uid)
        .collection("inventory")
        .add({
          name: this.name,
          value: this.value,
          unit: this.unit,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
          this.clearForm();
        });
    },
    clearForm() {
      (this.name = null), (this.value = null), (this.unit = null);
    }
  },
  computed: {
    options() {
      return this.$store.state.units;
    },
    currentUser() {
      if (this.$store.state.currentUser) {
        return this.$store.state.currentUser.uid;
      } else {
        return null;
      }
    },
    indexedInventory() {
      return this.inventory.reduce((indexedItems, item) => {
        indexedItems[item.id] = item;
        return indexedItems;
      }, {});
    }
  },
  created() {
    auth.onAuthStateChanged(user => {
      if (user) {
        db.collection("users")
          .doc(user.uid)
          .collection("inventory")
          .onSnapshot(snapshot => {
            const inventory = [];
            snapshot.forEach(doc => {
              const item = doc.data();
              item.id = doc.id;
              inventory.push(item);
            });
            this.inventory = inventory;
          });
      }
    });
  }
};
</script>
