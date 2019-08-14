<template>
  <div class="d-flex align-items-end">
    <b-form @submit.prevent="handleEdit" class="d-flex align-items-end mr-2">
      <b-form-group class="mb-0 mr-2" label="Name" label-sr-only label-for="name">
        <b-form-input v-model="item.name" id="name"></b-form-input>
      </b-form-group>
      <b-form-group class="mb-0 mr-2" label="Amount" label-sr-only label-for="amount">
        <b-form-input type="number" step="0.01" v-model="item.value" id="amount"></b-form-input>
      </b-form-group>
      <b-form-group class="mb-0 mr-2" label-sr-only label="Type">
        <b-form-select v-model="item.unit" :options="options"></b-form-select>
      </b-form-group>
      <div>
        <b-btn type="submit" variant="outline-primary">Update</b-btn>
      </div>
    </b-form>
    <div>
      <b-btn @click="handleRemove" variant="outline-primary">Delete</b-btn>
    </div>
  </div>
</template>


<script>
import { db } from "@/db";
export default {
  props: ["item"],
  data() {
    return {
      name: null,
      value: null,
      unit: null
    };
  },
  methods: {
    handleRemove() {
      console.log(this.item.id);
      db.collection("users")
        .doc(this.$store.state.currentUser.uid)
        .collection("inventory")
        .doc(this.item.id)
        .delete();
      // db.collection("items")
      //   .doc(this.item.id)
      //   .delete();
    },
    handleEdit() {
      db.collection("items")
        .doc(this.item.id)
        .set(this.item)
        .then(() => {
          console.log("Item updated!");
        });
    }
  },
  computed: {
    options() {
      return this.$store.state.units;
    }
  }
};
</script>
