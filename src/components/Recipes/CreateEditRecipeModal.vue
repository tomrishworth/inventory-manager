<template>
  <b-modal
    id="create-edit-recipe-modal"
    size="lg"
    v-model="showModal"
    :title="editing ? 'Edit Recipe' : 'Add Recipe'"
    :ok-title="editing ? 'Save changes' : 'Create Recipe'"
    @ok="handleOk"
    lazy
  >
    <!-- <b-tabs pills>
      <b-tab title="Details">Details</b-tab>
      <b-tab title="Ingredients">Ingredients</b-tab>
    </b-tabs>-->
    <!-- <h3 class="h4">Details</h3> -->
    <b-form-group class="mr-2" label="Recipe name" label-for="name">
      <b-form-input v-model="newRecipe.name" id="name"></b-form-input>
    </b-form-group>
    <div class="form-row">
      <b-form-group class="col-sm-8" label="Batch Size">
        <div class="form-row">
          <b-form-group label="Batch Size" label-sr-only label-for="batchSize" description="e.g 50" class="col-sm-6">
            <b-form-input
              type="number"
              placeholder="Size"
              v-model.number="newRecipe.batchSize"
              id="batchSize"
            ></b-form-input>
          </b-form-group>
          <b-form-group
            class="col-sm-6"
            label="Batch Label"
            label-sr-only
            label-for="batchLabel"
            description="e.g litres"
          >
            <b-form-input v-model="newRecipe.batchLabel" placeholder="Label" id="batchLabel"></b-form-input>
          </b-form-group>
        </div>
      </b-form-group>
      <b-form-group class="col-sm-4" label="Retail Price" prepend="$" label-for="retailPrice">
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

    <hr />
    <div class="d-flex align-items-baseline">
      <h3 class="h4 mr-2">Other Costs</h3>
      <p class="text-sm text-muted">E.g printing, packaging</p>
    </div>
    <div v-if="newRecipe.otherCosts" class="d-flex mb-1">
      <div style="width:200px" class="text-sm text-muted">Name</div>
      <div class="text-sm text-muted">Cost per item</div>
    </div>
    <div class="d-flex" :key="index" v-for="(cost, index) in newRecipe.otherCosts">
      <b-form-group class="mb-2 mr-2">
        <b-form-input v-model="cost.name"></b-form-input>
      </b-form-group>
      <b-form-group class="mb-2 mr-2">
        <b-input-group prepend="$">
          <b-form-input type="number" placeholder="0.00" v-model.number="cost.costPerItem"></b-form-input>
        </b-input-group>
      </b-form-group>
      <div>
        <b-btn @click="removeCost(index)" class="btn-icon">
          <font-awesome-icon :icon="['far', 'trash-alt']"></font-awesome-icon>
        </b-btn>
      </div>
    </div>
    <div>
      <button @click="handleAddCost" class="btn btn-outline-primary btn-sm">+ Add cost</button>
    </div>

    <hr />
    <h3 class="h4">Ingredients</h3>
    <div class="row mb-1" v-if="newRecipe.items.length">
      <div class="col-4"></div>
      <div class="text-sm text-muted col-3">Quantity</div>
      <div class="text-sm text-muted col-3">Type</div>
    </div>
    <div v-if="newRecipe.items.length">
      <div class="row align-items-baseline mb-1" v-for="(item, index) in newRecipe.items" :key="item.id">
        <div class="font-weight-bold col-4">{{ getItemById(item.ref).name }}</div>
        <b-form-group class="col-3 mb-0" label="Amount" label-sr-only label-for="amount">
          <b-form-input placeholder="Amount" type="number" step="0.01" v-model="item.value" id="amount"></b-form-input>
        </b-form-group>
        <div class="col-3">{{ item.unit }}</div>
        <div class="col-2">
          <b-btn @click="removeItem(index)" class="btn-icon">
            <font-awesome-icon :icon="['far', 'trash-alt']"></font-awesome-icon>
          </b-btn>
        </div>
      </div>
    </div>
    <b-dropdown size="sm" variant="outline-primary" v-if="availableInventory" text="Add item">
      <b-dropdown-item @click="handleAdd(item.id)" v-for="item in availableInventory" :key="item.id">{{
        item.name
      }}</b-dropdown-item>
    </b-dropdown>
    <div class="mt-3">
      <small class="text-muted">Only items in your inventory can be added</small>
    </div>
  </b-modal>
</template>

<script>
import * as firebase from 'firebase/app';
import { mapActions } from 'vuex';
import { uniqueId } from 'lodash';

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
        items: [],
        otherCosts: [],
      },
    };
  },
  props: ['currentRecipe'],
  methods: {
    ...mapActions(['createRecipe', 'editRecipe']),
    handleOk() {
      const recipe = {
        id: this.newRecipe.id,
        name: this.newRecipe.name,
        retailPrice: this.newRecipe.retailPrice,
        batchSize: this.newRecipe.batchSize,
        batchLabel: this.newRecipe.batchLabel,
        items: this.newRecipe.items,
        otherCosts: this.newRecipe.otherCosts,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
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
        id: uniqueId(),
      };
      this.newRecipe.items.push(receipeItem);
    },
    handleAddCost() {
      const costItem = {
        id: uniqueId(),
        name: null,
        costPerItem: null,
      };
      console.log(costItem);
      this.newRecipe.otherCosts.push(costItem);
    },
    removeCost(index) {
      this.newRecipe.otherCosts.splice(index, 1);
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
        return this.inventory.find((item) => {
          if (item.id === id) {
            return item.id === id;
          } else {
            return null;
          }
        });
      } else {
        return {};
      }
    },
  },
  computed: {
    availableInventory() {
      const inventory = this.$store.state.inventory;

      const availableInventory = [];

      // I'm sure there is a better way todo this
      inventory.forEach((item) => {
        let match = false;
        this.newRecipe.items.forEach((newRecipeitem) => {
          if (item.id === newRecipeitem.ref) {
            match = true;
          } else {
            console.log('False');
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
    },
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
      this.newRecipe.otherCosts = this.currentRecipe.otherCosts;
      this.newRecipe.updated = firebase.firestore.FieldValue.serverTimestamp();
    }
  },
};
</script>
