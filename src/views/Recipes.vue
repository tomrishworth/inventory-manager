<template>
  <div class="container">
    <h1>Recipes</h1>
    <b-card-group v-if="recipes" class="mb-4" deck>
      <b-card style="max-width: 300px" no-body v-for="recipe in recipes" :key="recipe.id">
        <b-card-header class="d-flex">
          <div>{{ recipe.name }}</div>
          <b-dropdown variant="link" right class="ml-auto dropdown-ellipsis" no-caret>
            <template slot="button-content">
              <font-awesome-icon :icon="['far', 'ellipsis-v']"></font-awesome-icon>
            </template>
            <b-dropdown-item @click="startEditingRecipe(recipe)">Edit</b-dropdown-item>
            <b-dropdown-item @click="handleDelete(recipe.id)">Delete</b-dropdown-item>
          </b-dropdown>
        </b-card-header>
        <b-list-group v-if="recipe.items" class="flex-grow-1" flush>
          <b-list-group-item v-for="item in recipe.items" :key="item.id">
            <div class="d-flex justify-content-between">
              <div>{{ getItemById(item.ref).name}}</div>
              <div
                class="font-weight-bold"
                :class="enoughInventory(item.value, getItemById(item.ref).value) ? 'text-success' : 'text-danger'"
              >{{ item.value }} {{ item.unit }}</div>
            </div>
            <div class="d-flex text-muted text-sm">
              <div>Amount in inventory</div>
              <div class="ml-auto">{{ getItemById(item.ref).value}} {{ getItemById(item.ref).unit}}</div>
            </div>
          </b-list-group-item>
        </b-list-group>
        <b-btn variant="link" @click="startMakerecipe(recipe)">Make Recipe</b-btn>
      </b-card>
    </b-card-group>
    <b-btn v-b-modal.addRecipe>Add a recipe</b-btn>
    <b-modal
      @ok="removeInventory"
      v-model="showCreateModal"
      size="sm"
      id="makeRecipeModal"
      title="Make Recipe"
    >
      <p>This will remove the following quantities from your inventory</p>
      <div v-if="makeRecipe">
        <div class="d-flex" v-for="item in makeRecipe.items" :key="item.id">
          <div>{{ getItemById(item.ref).name}}</div>
          <div class="ml-auto">{{item.value}} {{item.unit}}</div>
        </div>
      </div>
    </b-modal>
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
        <div class="row" v-if="newRecipe.items.length">
          <div class="col-4"></div>
          <div class="col-3">Quantity</div>
          <div class="col-3">Type</div>
        </div>
        <div class="row mb-1" v-for="(item, index) in newRecipe.items" :key="item.id">
          <div class="col-4">{{ getItemById(item.ref).name}}</div>
          <b-form-group class="col-3 mb-0" label="Amount" label-sr-only label-for="amount">
            <b-form-input
              placeholder="Amount"
              type="number"
              step="0.01"
              v-model="item.value"
              id="amount"
            ></b-form-input>
          </b-form-group>
          <div class="col-3">{{item.unit}}</div>
          <!-- <b-form-group class="col-3 mb-0" label-sr-only label="Type">
            <b-form-select v-model="item.unit" :options="options"></b-form-select>
          </b-form-group>-->
          <div class="col-2">
            <b-btn @click="removeItem(index)" variant="outline-secondary">x</b-btn>
          </div>
        </div>
        <b-dropdown text="Add item">
          <b-dropdown-item
            @click="handleAdd(item.id)"
            v-for="item in inventory"
            :key="item.id"
          >{{ item.name }}</b-dropdown-item>
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
          <div class="col-4">{{ getItemById(item.ref).name}}</div>
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
          <b-dropdown-item
            @click="handleEditAdd(item.id)"
            v-for="item in inventory"
            :key="item.id"
          >{{ item.name }}</b-dropdown-item>
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
import * as firebase from "firebase/app";
// import Qty from "js-quantities";
import { units } from "mathjs";
import { uniqueId } from "lodash";

export default {
  name: "Recipes",
  data() {
    return {
      inventory: [],
      newRecipe: {
        id: null,
        name: null,
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
            db.collection("recipes")
              .doc(id)
              .delete()
              .then(function() {
                console.log("Document successfully deleted!");
              });
          }
        })
        .catch(err => {
          // An error occurred
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

        db.collection("inventory")
          .doc(item.ref)
          .update({
            value: newValue
          });
      });
    },
    startEditingRecipe(recipe) {
      this.editRecipe = recipe;
      this.showEditModal = true;
    },
    saveEdit() {
      db.collection("recipes")
        .doc(this.editRecipe.id)
        .update({
          name: this.editRecipe.name,
          items: this.editRecipe.items
        });
      console.log("Saved");
    },
    handleCancel() {},
    createRecipe() {
      const newRecipeRef = db.collection("recipes").doc();
      this.newRecipe.id = newRecipeRef.id;
    },
    getItemById(id) {
      return this.inventory.find(item => {
        return item.id === id;
      });
    },
    handleOk() {
      const recipe = {
        name: this.newRecipe.name,
        items: this.newRecipe.items,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      };
      db.collection("recipes")
        .doc(this.newRecipe.id)
        .set(recipe);
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
  firestore: {
    inventory: db.collection("inventory").orderBy("timestamp"),
    recipes: db.collection("recipes")
  }
};
</script>
