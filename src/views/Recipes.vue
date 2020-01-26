<template>
  <div class="container">
    <div class="d-flex my-4">
      <h1 class="page-title mb-0">Recipes</h1>
      <div class="ml-4">
        <b-btn size="sm" variant="primary" v-b-modal.addRecipe>
          <font-awesome-icon class="mr-2" :icon="['far', 'plus']"></font-awesome-icon>Add recipe
        </b-btn>
      </div>
    </div>
    <div v-if="recipes" class="mb-4">
      <div v-for="recipe in recipes" :key="recipe.id">
        <router-link :to="{ name: 'recipe', params: { id: recipe.id } }">{{ recipe.name }}</router-link>
      </div>
    </div>

    <b-modal
      @ok="handleOk"
      @show="createRecipe"
      @cancel="handleCancel"
      id="addRecipe"
      title="Add a recipe"
      size="lg"
    >
      <div class="bg-light p-4">
        <b-form-group label="Name" label-sr-only label-for="name">
          <b-form-input placeholder="Recipe name" v-model="newRecipe.name" id="name"></b-form-input>
        </b-form-group>
        <b-form-group label="Batch Size" label-sr-only label-for="size">
          <b-form-input placeholder="Batch Size" v-model="newRecipe.size" id="size"></b-form-input>
        </b-form-group>

        <div class="row" v-if="newRecipe.items.length">
          <div class="col-4"></div>
          <div class="col-3">Quantity</div>
          <div class="col-3">Type</div>
        </div>
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
        <b-dropdown text="Add item">
          <b-dropdown-item @click="handleAdd(item.id)" v-for="item in inventory" :key="item.id">
            {{
            item.name
            }}
          </b-dropdown-item>
        </b-dropdown>
        <div class="mt-3">
          <small class="text-muted">Only items in your inventory can be added</small>
        </div>
      </div>
    </b-modal>

    <b-modal
      @ok="saveEdit"
      @cancel="handleCancel"
      size="lg"
      v-if="editRecipe"
      id="editRecipe"
      v-model="showEditModal"
      :title="`Edit recipe - ${editRecipe.name}`"
    >
      <div class="bg-light p-4">
        <b-form-group label="Name" label-sr-only label-for="name">
          <b-form-input placeholder="Recipe name" v-model="editRecipe.name" id="name"></b-form-input>
        </b-form-group>
        <div class="row" v-if="editRecipe.items.length">
          <div class="col-4"></div>
          <div class="col-4">Quantity</div>
          <div class="col-4">Type</div>
        </div>
        <div class="row mb-1" v-for="(item, index) in editRecipe.items" :key="item.id">
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
          <b-form-group class="col-3 mb-0" label-sr-only label="Type">
            <b-form-select v-model="item.unit" :options="options"></b-form-select>
          </b-form-group>
          <div class="col-2">
            <b-btn @click="removeEditItem(index)" variant="outline-secondary">x</b-btn>
          </div>
        </div>
        <b-dropdown text="Add item">
          <b-dropdown-item @click="handleEditAdd(item.id)" v-for="item in inventory" :key="item.id">
            {{
            item.name
            }}
          </b-dropdown-item>
        </b-dropdown>
        <div class="mt-3">
          <small class="text-muted">Only items in your inventory can be added</small>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
import { db } from "@/db";
import { auth } from "@/db";
import * as firebase from "firebase/app";
import { uniqueId } from "lodash";

export default {
  name: "recipes",
  data() {
    return {
      refRecipe: null,
      refInventory: null,
      inventory: [],
      newRecipe: {
        id: null,
        name: null,
        size: null,
        items: []
      },
      editRecipe: null,
      makeRecipe: null,
      recipes: [],
      showEditModal: false,
      showCreateModal: false
    };
  },
  methods: {
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
    handleEditAdd(id) {
      const unit = this.getItemById(id).unit;
      const receipeItem = {
        ref: id,
        value: 0,
        unit: unit,
        id: uniqueId()
      };
      this.editRecipe.items.push(receipeItem);
    },
    removeItem(index) {
      this.newRecipe.items.splice(index, 1);
    },
    removeEditItem(index) {
      this.editRecipe.items.splice(index, 1);
    },
    handleDelete(id) {
      this.$bvModal
        .msgBoxConfirm("Are you sure you want to delete this recipe?", {
          title: "Please Confirm",
          size: "sm",
          okVariant: "danger",
          okTitle: "Delete",
          cancelTitle: "Cancel",
          footerClass: "p-2",
          centered: true
        })
        .then(value => {
          if (value === true) {
            this.refRecipe
              .doc(id)
              .delete()
              .then(function() {
                console.log("Document successfully deleted!");
              });
          }
        })
        .catch(err => {
          console.error(err);
        });
    },
    startMakerecipe(recipe) {
      this.makeRecipe = recipe;
      this.showCreateModal = true;
    },
    removeInventory() {
      this.makeRecipe.items.forEach(item => {
        const oldValue = this.inventory.find(test => {
          return test.id === item.ref;
        });

        let newValue = Number(oldValue.value) - Number(item.value);

        this.refInventory.doc(item.ref).update({
          value: newValue
        });
      });
    },
    startEditingRecipe(recipe) {
      this.editRecipe = recipe;
      this.showEditModal = true;
    },
    saveEdit() {
      this.refRecipe.doc(this.editRecipe.id).update({
        name: this.editRecipe.name,
        items: this.editRecipe.items
      });
      console.log("Saved");
    },
    handleCancel() {},
    createRecipe() {
      const newRecipeRef = this.refRecipe.doc();
      this.newRecipe.id = newRecipeRef.id;
    },
    getItemById(id) {
      return this.inventory.find(item => {
        if (item.id === id) {
          return item.id === id;
        } else {
          return null;
        }
      });
    },
    handleOk() {
      const recipe = {
        name: this.newRecipe.name,
        size: this.newRecipe.size,
        items: this.newRecipe.items,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      };
      this.refRecipe.doc(this.newRecipe.id).set(recipe);
    },
    enoughInventory(recipeQuantity, inventoryQuantity) {
      if (recipeQuantity <= inventoryQuantity) {
        return true;
      } else {
        return false;
      }
    }
  },
  computed: {
    options() {
      return this.$store.state.units;
    }
  },
  created() {
    auth.onAuthStateChanged(user => {
      this.refRecipe = db
        .collection("users")
        .doc(user.uid)
        .collection("recipes");

      this.refInventory = db
        .collection("users")
        .doc(user.uid)
        .collection("inventory");

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

        db.collection("users")
          .doc(user.uid)
          .collection("recipes")
          .onSnapshot(snapshot => {
            const recipes = [];
            snapshot.forEach(doc => {
              const item = doc.data();
              item.id = doc.id;
              recipes.push(item);
            });
            this.recipes = recipes;
          });
      }
    });
  }
};
</script>
