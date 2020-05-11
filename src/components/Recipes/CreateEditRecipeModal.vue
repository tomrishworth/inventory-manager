<template>
  <b-modal
    id="create-edit-recipe-modal"
    size="lg"
    v-model="showModal"
    :title="editing ? 'Edit Recipe' : 'Add Recipe'"
    @ok="handleOk"
    lazy
  >
    <div class="d-flex">
      <b-form-group class="mr-2" label="Recipe name" label-for="name">
        <b-form-input v-model="newRecipe.name" id="name"></b-form-input>
      </b-form-group>
      <b-form-group label="Retail Price" prepend="$" label-for="retailPrice">
        <b-input-group prepend="$">
          <b-form-input
            type="number"
            placeholder="0.00"
            v-model="newRecipe.retailPrice"
            id="retailPrice"
          ></b-form-input>
        </b-input-group>
      </b-form-group>
    </div>

    <b-form-group label="Batch Size">
      <div class="d-flex">
        <b-form-group
          label="Batch Size"
          label-sr-only
          label-for="batchSize"
          description="e.g 50"
          class="mr-2"
        >
          <b-form-input
            type="number"
            placeholder="Size"
            v-model="newRecipe.batchSize"
            id="batchSize"
          ></b-form-input>
        </b-form-group>
        <b-form-group
          label="Batch Label"
          label-sr-only
          label-for="batchLabel"
          description="e.g litres"
        >
          <b-form-input v-model="newRecipe.batchLabel" placeholder="Label" id="batchLabel"></b-form-input>
        </b-form-group>
      </div>
    </b-form-group>

    <hr />
    <h3 class="h4">Ingredients</h3>
    <div class="row" v-if="newRecipe.items.length">
      <div class="col-4"></div>
      <div class="col-3">Quantity</div>
      <div class="col-3">Type</div>
    </div>
    <div v-if="newRecipe.items.length">
      <div class="row mb-1" v-for="(item, index) in newRecipe.items" :key="item.id">
        <div class="col-4">{{ getItemById(item.ref).name }}</div>
        <b-form-group class="col-3 mb-0" label="Amount" label-sr-only label-for="amount">
          <b-form-input
            placeholder="Amount"
            type="number"
            step="0.01"
            v-model="item.value"
            id="amount"
          ></b-form-input>
        </b-form-group>
        <div class="col-3">{{ item.unit }}</div>
        <div class="col-2">
          <b-btn @click="removeItem(index)" variant="outline-secondary">x</b-btn>
        </div>
      </div>
    </div>
    <b-dropdown v-if="availableInventory" text="Add item">
      <b-dropdown-item
        @click="handleAdd(item.id)"
        v-for="item in availableInventory"
        :key="item.id"
      >{{ item.name }}</b-dropdown-item>
    </b-dropdown>
    <div class="mt-3">
      <small class="text-muted">Only items in your inventory can be added</small>
    </div>
  </b-modal>
</template>

<script>
import * as firebase from "firebase/app";
import { mapActions } from "vuex";
import { uniqueId } from "lodash";

export default {
  data() {
    return {
      showModal: false,
      editing: false,
      newRecipe: {
        id: null,
        name: null,
        retailPrice: null,
        batchSize: null,
        batchLabel: null,
        items: []
      }
    };
  },
  props: ["currentRecipe"],
  methods: {
    ...mapActions(["createRecipe", "editRecipe"]),
    handleOk() {
      const recipe = {
        id: this.newRecipe.id,
        name: this.newRecipe.name,
        retailPrice: this.newRecipe.retailPrice,
        batchSize: this.newRecipe.batchSize,
        batchLabel: this.newRecipe.batchLabel,
        items: this.newRecipe.items,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      };

      if (this.currentRecipe) {
        this.editRecipe(recipe);
      } else {
        this.createRecipe(recipe);
      }
    },
    handleAdd(id) {
      const unit = this.getItemById(id).unit;
      const receipeItem = {
        ref: id,
        value: 0,
        unit: unit,
        id: uniqueId()
      };
      this.newRecipe.items.push(receipeItem);
    },
    removeItem(index) {
      this.newRecipe.items.splice(index, 1);
    },
    // removeEditItem(index) {
    //   this.editRecipe.items.splice(index, 1);
    // },
    // handleEditAdd(value) {
    //   console.log(value);
    //   const unit = this.getItemById(value.id).unit;
    //   const receipeItem = {
    //     ref: value.id,
    //     value: 0,
    //     unit: unit,
    //     id: uniqueId()
    //   };
    //   this.editRecipe.items.push(receipeItem);
    // },
    getItemById(id) {
      if (this.inventory) {
        return this.inventory.find(item => {
          if (item.id === id) {
            return item.id === id;
          } else {
            return null;
          }
        });
      } else {
        return {};
      }
    }
  },
  computed: {
    availableInventory() {
      const inventory = this.$store.state.inventory;

      const availableInventory = [];

      // I'm sure there is a better way todo this
      inventory.forEach(item => {
        let match = false;
        this.newRecipe.items.forEach(newRecipeitem => {
          if (item.id === newRecipeitem.ref) {
            match = true;
          } else {
            console.log("False");
          }
        });
        if (match === false) {
          availableInventory.push(item);
        }
      });

      return availableInventory.sort((a, b) => a.name.localeCompare(b.name));
    },
    inventory() {
      return this.$store.state.inventory;
    }
  },
  beforeMount() {
    if (this.currentRecipe) {
      this.editing = true;

      this.newRecipe.id = this.currentRecipe.id;
      this.newRecipe.name = this.currentRecipe.name;
      this.newRecipe.retailPrice = this.currentRecipe.retailPrice;
      this.newRecipe.batchSize = this.currentRecipe.batchSize;
      this.newRecipe.batchLabel = this.currentRecipe.batchLabel;
      this.newRecipe.items = this.currentRecipe.items;
      this.newRecipe.updated = firebase.firestore.FieldValue.serverTimestamp();
    }
  }
};
</script>