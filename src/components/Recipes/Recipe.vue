<template>
  <div class="container" v-if="recipe">
    <div class="d-flex my-4">
      <h1 class="page-title mb-0">{{ recipe.name }}</h1>
      <div class="ml-4">
        <b-btn
          @click="startEditingRecipe"
          class="mr-2"
          variant="outline-secondary"
          size="sm"
        >Edit Recipe</b-btn>
        <b-btn
          @click="showMakeRecipeModal = !showMakeRecipeModal"
          size="sm"
          variant="primary"
        >Make Recipe</b-btn>
      </div>
    </div>
    <div class="mb-3">Batch size: {{recipe.size}} - Cost: {{totalCost | currency }}</div>
    <b-table
      v-if="inventory"
      class="bg-white"
      :items="recipe.items"
      :fields="fields"
      :tbody-tr-class="rowClass"
    >
      <template
        v-slot:cell(ref)="data"
        :class="enoughInventory(data.item.value, getItemById(data.item.ref).value) ? 'text-success' : 'text-danger'"
      >{{ getItemById(data.item.ref).name }}</template>
      <template v-slot:cell(value)="data">
        {{ data.item.value }}
        {{ data.item.unit }}
      </template>
      <template v-slot:cell(amountInInventory)="data">
        {{ getItemById(data.item.ref).value }}
        {{ getItemById(data.item.ref).unit }}
      </template>
      <template v-slot:cell(itemCost)="data">
        <span v-if="inventory">{{ itemCost(data.item) | currency }}</span>
      </template>
    </b-table>

    <b-modal
      @ok="removeInventory"
      ok-title="Confirm"
      v-model="showMakeRecipeModal"
      id="makeRecipeModal"
      title="Make Recipe"
    >
      <p>This will remove the following quantities from your inventory</p>
      <div>
        <div class="d-flex mb-1" v-for="item in recipe.items" :key="item.id">
          <div>{{ getItemById(item.ref).name }}</div>
          <div class="ml-auto font-weight-bold">{{ item.value }} {{ item.unit }}</div>
        </div>
      </div>
    </b-modal>

    <b-modal title="Edit Recipe" id="editRecipeModal" v-model="showEditRecipeModal">
      <div class="bg-light p-4">
        <b-form-group label="Name" label-sr-only label-for="name">
          <b-form-input placeholder="Recipe name" v-model="currentRecipe.name" id="name"></b-form-input>
        </b-form-group>
        <b-form-group label="Batch Size" label-sr-only label-for="size">
          <b-form-input placeholder="Batch Size" v-model="currentRecipe.size" id="size"></b-form-input>
        </b-form-group>

        <div class="row" v-if="currentRecipe.items.length">
          <div class="col-4"></div>
          <div class="col-3">Quantity</div>
          <div class="col-3">Type</div>
        </div>
        <div class="row mb-1" v-for="(item, index) in currentRecipe.items" :key="item.id">
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
  </div>
</template>

<script>
import { db } from "@/db";

export default {
  name: "recipe",
  data() {
    return {
      recipe: null,
      refInventory: null,
      inventory: [],
      showMakeRecipeModal: false,
      showEditRecipeModal: false,
      currentRecipe: null,
      fields: [
        {
          key: "ref",
          label: "Item"
        },
        {
          key: "value",
          label: "Recipe Amount"
        },
        {
          key: "amountInInventory",
          label: "Amount In Inventory"
        },
        {
          key: "itemCost",
          label: "Item Cost",
          tdClass: "text-right",
          thClass: "text-right"
        }
      ]
    };
  },
  methods: {
    getItemById(id) {
      return this.inventory.find(item => {
        if (item.id === id) {
          return item.id === id;
        } else {
          return null;
        }
      });
    },
    itemCost(item) {
      if (item) {
        const newItem = this.getItemById(item.ref);
        console.log(newItem);
        let itemCost = newItem.cost / newItem.costAmount;
        return itemCost * item.value;
      } else {
        return null;
      }
    },
    removeInventory() {
      this.recipe.items.forEach(item => {
        const oldValue = this.inventory.find(test => {
          return test.id === item.ref;
        });

        let newValue = Number(oldValue.value) - Number(item.value);

        this.refInventory.doc(item.ref).update({
          value: newValue
        });
      });
    },
    enoughInventory(recipeQuantity, inventoryQuantity) {
      if (recipeQuantity <= inventoryQuantity) {
        return true;
      } else {
        return false;
      }
    },
    rowClass(item) {
      if (!this.enoughInventory(item.value, this.getItemById(item.ref).value)) {
        return "table-danger";
      }
    },
    startEditingRecipe() {
      this.startEditingRecipe = true;
      this.currentRecipe = this.recipe;
    }
  },
  computed: {
    totalCost() {
      let cost = 0;
      this.recipe.items.forEach(item => {
        cost += this.itemCost(item);
      });
      return cost;
    }
  },
  beforeMount() {
    let id = this.$route.params.id;

    let recipeRef = db
      .collection("users")
      .doc(this.$store.state.currentUser.uid)
      .collection("recipes")
      .doc(id);
    recipeRef.get().then(snapshot => {
      this.recipe = snapshot.data();
    });

    this.refInventory = db
      .collection("users")
      .doc(this.$store.state.currentUser.uid)
      .collection("inventory");

    db.collection("users")
      .doc(this.$store.state.currentUser.uid)
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
};
</script>
