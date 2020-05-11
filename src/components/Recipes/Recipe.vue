<template>
  <div class="container pt-5" v-if="recipe">
    <router-link to="/recipes">
      <font-awesome-icon class="mr-2" :icon="['far', 'arrow-left']"></font-awesome-icon>Recipes
    </router-link>
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
          @click="handleDelete"
          class="mr-2"
          variant="outline-secondary"
          size="sm"
        >Delete Recipe</b-btn>
        <b-btn
          @click="showMakeRecipeModal = true"
          class="mr-2"
          size="sm"
          variant="primary"
        >Make Recipe</b-btn>
        <!-- <b-btn @click="scale" size="sm" variant="outline-secondary">Scale Recipe</b-btn> -->
      </div>
    </div>
    <div class="row">
      <div class="col-sm-8">
        <b-table
          v-if="inventory"
          class="bg-white"
          :items="recipe.items"
          :fields="fields"
          :tbody-tr-class="rowClass"
        >
          <template v-slot:cell(ref)="data">
            <span v-if="data">{{ getItemById(data.item.ref).name }}</span>
          </template>
          <template v-slot:cell(value)="data">
            {{ data.item.value }}
            {{ data.item.unit }}
          </template>
          <template v-slot:cell(amountInInventory)="data">
            {{ getItemById(data.item.ref).value | rounded }}
            {{ getItemById(data.item.ref).unit }}
          </template>
          <template v-slot:cell(itemCost)="data">
            <span>{{ itemCost(data.item) | currency }}</span>
          </template>
        </b-table>
      </div>
      <div class="col-sm-4">
        <div class="box p-5 mb-3">
          <div class="mb-2">
            <div class="d-flex">
              <h3 class="text-base line-height-normal mb-0 font-weight-bold">Batch size:</h3>
              <div class="ml-auto">{{ recipe.batchSize }} {{ recipe.batchLabel}}</div>
            </div>
          </div>
          <div class="mb-2">
            <div class="d-flex">
              <h3 class="text-base line-height-normal mb-0 font-weight-bold">Cost per batch:</h3>
              <div class="ml-auto">{{ totalCost | currency }}</div>
            </div>
          </div>
          <div class="mb-2">
            <div class="d-flex">
              <h3 class="text-base line-height-normal mb-0 font-weight-bold">Cost per unit:</h3>
              <div class="ml-auto">{{ costPerUnit | currency}}</div>
            </div>
          </div>
          <div class="mb-2">
            <div class="d-flex">
              <h3 class="text-base line-height-normal mb-0 font-weight-bold">Retail Price:</h3>
              <div class="ml-auto">{{ recipe.retailPrice | currency}}</div>
            </div>
          </div>
          <div class="mb-2">
            <div class="d-flex">
              <h3 class="text-base line-height-normal mb-0 font-weight-bold">Profit per unit:</h3>
              <div class="ml-auto">{{ recipe.retailPrice - costPerUnit | currency}}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <create-edit-Recipe-Modal :currentRecipe="recipe"></create-edit-Recipe-Modal>

    <b-modal
      @ok="handleRemove"
      ok-title="Confirm"
      v-model="showMakeRecipeModal"
      id="makeRecipeModal"
      title="Make Recipe"
    >
      <div v-if="!removingInventory">
        <p>Batch Size: {{ recipe.batchSize }} {{ recipe.batchLabel}}</p>
        <p>This will remove the following quantities from your inventory</p>
        <div>
          <div class="d-flex mb-1" v-for="item in recipe.items" :key="item.id">
            <div>{{ getItemById(item.ref).name }}</div>
            <div class="ml-auto font-weight-bold">{{ item.value }} {{ item.unit }}</div>
          </div>
        </div>
      </div>
      <div class="removing text-center" v-else>
        <div class="spinner mb-8">
          <div class="cube1"></div>
          <div class="cube2"></div>
        </div>
        <div class="removing-text font-weight-bold">Removing Inventory</div>
      </div>
    </b-modal>

    <!-- <b-modal
      size="lg"
      @ok="saveEdit"
      ok-title="Save Changes"
      title="Edit Recipe"
      id="editRecipeModal"
      v-model="showEditRecipeModal"
    >
      <div class>
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
    </b-modal>-->
  </div>
</template>

<script>
import { db } from "@/db";
import createEditRecipeModal from "@/components/Recipes/CreateEditRecipeModal.vue";
import { mapActions } from "vuex";

export default {
  name: "recipe",
  props: ["id"],
  components: {
    createEditRecipeModal
  },
  data() {
    return {
      refInventory: null,
      showMakeRecipeModal: false,
      showEditRecipeModal: false,
      currentRecipe: null,
      removingInventory: false,
      // currentRecipe: {
      //   name: null,
      //   size: null,
      //   items: []
      // },
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
    ...mapActions(["deleteRecipe", "logCreation"]),
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
      const newItem = this.getItemById(item.ref);
      let itemCost = newItem.cost / newItem.costAmount;
      return itemCost * item.value;
    },
    handleRemove(bvModalEvt) {
      bvModalEvt.preventDefault();
      this.removingInventory = true;
      setTimeout(() => {
        this.removeInventory();
        this.handleLog();
        this.finishRemoving();
      }, 2000);
    },
    handleLog() {
      console.log("Log");
      this.logCreation(this.recipe);
    },
    removeInventory() {
      console.log("Removing...");
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
    finishRemoving() {
      console.log("Finsih");
      this.removingInventory = false;
      this.showMakeRecipeModal = false;
      this.$bvToast.toast("Inventory quantities updated");
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
      // this.currentRecipe.name = this.recipe.name;
      // this.currentRecipe.size = this.recipe.size;
      // this.currentRecipe.items = this.recipe.items;
      // this.showEditRecipeModal = true;
      this.$bvModal.show("create-edit-recipe-modal");
    },
    // Needs refactoring
    handleDelete() {
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
            this.deleteRecipe(this.recipe.id);
          }
        })
        .catch(err => {
          console.error(err);
        });
    }
  },
  computed: {
    recipe() {
      return this.$store.getters.getRecipeById(this.id);
    },
    inventory() {
      return this.$store.getters.inventory;
    },
    totalCost() {
      let cost = 0;
      this.recipe.items.forEach(item => {
        cost += this.itemCost(item);
      });
      return cost;
    },
    costPerUnit() {
      return this.totalCost / this.recipe.batchSize;
    }
  },
  beforeMount() {
    //   let id = this.$route.params.id;

    //   let recipeRef = db
    //     .collection("users")
    //     .doc(this.$store.state.currentUser.uid)
    //     .collection("recipes")
    //     .doc(id);
    //   recipeRef.get().then(snapshot => {
    //     this.recipe = snapshot.data();
    //   });

    this.refInventory = db
      .collection("users")
      .doc(this.$store.state.currentUser.uid)
      .collection("inventory");

    //   db.collection("users")
    //     .doc(this.$store.state.currentUser.uid)
    //     .collection("inventory")
    //     .onSnapshot(snapshot => {
    //       const inventory = [];
    //       snapshot.forEach(doc => {
    //         const item = doc.data();
    //         item.id = doc.id;
    //         inventory.push(item);
    //       });
    //       this.inventory = inventory;
    //     });
  }
};
</script>
