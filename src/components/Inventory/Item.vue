<template>
  <div class="bg-white border p-2">
    <b-form @submit.prevent="handleEdit" class="row align-items-center">
      <!-- <b-form-group class="mb-0 mr-2" label="Name" label-sr-only label-for="name">
        <b-form-input v-model="item.name" id="name"></b-form-input>
      </b-form-group>-->
      <div class="col-3">
        <button class="btn btn-link" @click="showEditModal = true">{{ item.name}}</button>
      </div>

      <div class="col-4 d-flex align-items-center">
        <!-- <b-form-group class="mb-0" label="Amount" label-sr-only label-for="amount">
          <b-form-input
            @change="handleEdit"
            type="number"
            step="0.01"
            v-model="item.value"
            id="amount"
          ></b-form-input>
        </b-form-group>-->
        <div>{{ item.value }}</div>
        <div class="ml-1">{{ item.unit }}</div>
        <!-- <span v-if="lineItemStatus" class="ml-1 loading-spinner">
          <b-spinner small></b-spinner>
          <span class="sr-only">Saving...</span>
        </span>-->
        <!-- <div class="ml-2 loading-btn">
          <b-btn type="submit" size="sm" variant="outline-primary">
            <span v-if="lineItemStatus" class="loading-spinner">
              <b-spinner small></b-spinner>
              <span class="sr-only">Updating...</span>
            </span>
            <span :class="{'btn-loading-text': lineItemStatus}">Update</span>
          </b-btn>
        </div>-->
      </div>
      <!-- <b-form-group class="mb-0 mr-2" label-sr-only label="Type">
        <b-form-select v-model="item.unit" :options="options"></b-form-select>
      </b-form-group>-->
      <div class="col-3 d-flex ml-auto">
        <b-dropdown variant="link" right class="ml-auto dropdown-ellipsis" no-caret>
          <template slot="button-content">
            <font-awesome-icon :icon="['far', 'ellipsis-v']"></font-awesome-icon>
          </template>
          <b-dropdown-item @click="showEditModal = true">Edit</b-dropdown-item>
          <b-dropdown-item @click="handleRemove">Delete</b-dropdown-item>
        </b-dropdown>
      </div>

      <!-- <div>
        <div class="loading-btn">
          <b-btn type="submit" variant="outline-primary">
            <span v-if="lineItemStatus" class="loading-spinner">
              <b-spinner small></b-spinner>
              <span class="sr-only">Updating...</span>
            </span>
            <span :class="{'btn-loading-text': lineItemStatus}">Update</span>
          </b-btn>
        </div>
      </div>-->
    </b-form>

    <b-modal
      v-model="showEditModal"
      id="editInventory"
      title="Edit Inventory Item"
      @ok="handleEdit"
    >
      <b-form class>
        <b-form-group class label="Name" label-for="name">
          <b-form-input v-model="item.name" id="name"></b-form-input>
        </b-form-group>
        <div class="d-flex">
          <b-form-group class="mr-2" label="Amount" label-for="amount">
            <b-form-input type="number" step="0.01" v-model="item.value" id="amount"></b-form-input>
          </b-form-group>
          <b-form-group class label="Type">
            <b-form-select v-model="item.unit" :options="options"></b-form-select>
          </b-form-group>
        </div>
      </b-form>
      <template v-slot:modal-footer="{ ok, cancel, hide }">
        <div class="d-flex justify-content-between w-100">
          <div>
            <b-btn variant="outline-danger" @click="handleRemove">Delete</b-btn>
          </div>
          <div>
            <b-btn variant="link" @click="cancel()">Cancel</b-btn>
            <b-btn variant="primary" @click="ok()">Save</b-btn>
          </div>
        </div>
      </template>
    </b-modal>
  </div>
</template>


<script>
import { db } from "@/db";
export default {
  props: ["item"],
  data() {
    return {
      showEditModal: false,
      name: null,
      value: null,
      unit: null
    };
  },
  methods: {
    removeItem() {
      this.$store.dispatch("inventoryItemLoadingStatus", {
        id: this.item.id,
        loading: true
      });
      const name = this.item.name;
      db.collection("users")
        .doc(this.$store.state.currentUser.uid)
        .collection("inventory")
        .doc(this.item.id)
        .delete()
        .then(() => {
          this.$store.dispatch("inventoryItemLoadingStatus", {
            id: this.item.id,
            loading: false
          });
          this.$bvToast.toast(`${name} deleted`);
        });
    },
    handleRemove() {
      const name = this.item.name;
      this.$bvModal
        .msgBoxConfirm(`Are you sure you want to delete ${name}?`, {
          title: "Please Confirm",
          size: "sm",
          okVariant: "danger",
          okTitle: "Delete",
          cancelTitle: "Cancel"
        })
        .then(value => {
          if (value === true) {
            this.removeItem();
          }
        })
        .catch(err => {
          // An error occurred
        });
    },
    handleEdit() {
      this.$store.dispatch("inventoryItemLoadingStatus", {
        id: this.item.id,
        loading: true
      });
      const name = this.item.name;
      db.collection("users")
        .doc(this.$store.state.currentUser.uid)
        .collection("inventory")
        .doc(this.item.id)
        .set(this.item)
        .then(() => {
          this.$store.dispatch("inventoryItemLoadingStatus", {
            id: this.item.id,
            loading: false
          });
          // this.$bvToast.toast(`${name} updated`);
        });
    }
  },
  watch: {},
  computed: {
    lineItemStatus() {
      return this.$store.state.loadingInventoryItem[this.item.id];
    },
    options() {
      return this.$store.state.units;
    }
  }
};
</script>
