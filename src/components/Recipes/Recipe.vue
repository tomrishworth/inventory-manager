<template>
  <div class="container pt-5" v-if="recipe">
    <router-link to="/recipes">
      <font-awesome-icon class="mr-2" :icon="['far', 'arrow-left']"></font-awesome-icon>Recipes
    </router-link>
    <div class="d-flex my-4">
      <h1 class="page-title mb-0">{{ recipe.name }}</h1>
      <div class="ml-4">
        <b-btn @click="startEditingRecipe" class="mr-2" variant="outline-primary" size="sm">
          <font-awesome-icon :icon="['far', 'pen']"></font-awesome-icon>
        </b-btn>
        <b-btn @click="handleDelete" class="mr-2" variant="outline-primary" size="sm">
          <font-awesome-icon :icon="['far', 'trash-alt']"></font-awesome-icon>
        </b-btn>
        <b-btn @click="showScaleRecipeModal = true" class="mr-2" size="sm" variant="outline-primary">Scale</b-btn>
        <!-- <b-btn @click="startScaleRecipe" class="mr-2" size="sm" variant="outline-primary">Scale</b-btn> -->
        <b-btn @click="showMakeRecipeModal = true" class="mr-2" size="sm" variant="primary">Make</b-btn>
        <!-- <b-btn @click="scale" size="sm" variant="outline-secondary">Scale Recipe</b-btn> -->
      </div>
    </div>
    <div class="row">
      <div class="col-sm-8">
        <b-table v-if="inventory" class="bg-white" :items="recipe.items" :fields="fields" :tbody-tr-class="rowClass">
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
        <div class="box recipe-info p-5 mb-3">
          <div class="mb-2">
            <div class="d-flex">
              <h3 class="label">Batch size</h3>
              <div class="value">{{ recipe.batchSize }} {{ recipe.batchLabel }}</div>
            </div>
          </div>
          <div class="mb-2">
            <div class="d-flex">
              <h3 class="label">Cost per batch:</h3>
              <div class="value">{{ totalCost | currency }}</div>
            </div>
          </div>
          <div class="mb-2">
            <div class="d-flex">
              <h3 class="label">Ingredients cost per unit:</h3>
              <div class="value">{{ costPerUnit | currency }}</div>
            </div>
          </div>

          <div v-if="recipe.otherCosts">
            <hr />
            <h3 class="text-base font-weight-bold">Other Costs (per unit)</h3>
            <div class="mb-2" v-for="cost in recipe.otherCosts" :key="cost.id">
              <div class="d-flex">
                <h3 class="label">{{ cost.name }}:</h3>
                <div class="value">{{ cost.costPerItem | currency }}</div>
              </div>
            </div>
            <div class="mb-2">
              <div class="d-flex">
                <h3 class="label">Total Other Costs (per unit):</h3>
                <div class="value">{{ totalOtherCosts | currency }}</div>
              </div>
            </div>
          </div>

          <hr />
          <div class="mb-2">
            <div class="d-flex">
              <h3 class="label">Total Cost per unit:</h3>
              <div class="value">{{ totalCostPerUnit | currency }}</div>
            </div>
          </div>
          <div class="mb-2">
            <div class="d-flex">
              <h3 class="label">Retail Price:</h3>
              <div class="value">{{ recipe.retailPrice | currency }}</div>
            </div>
          </div>
          <div class="mb-2">
            <div class="d-flex">
              <h3 class="label">Profit per unit:</h3>
              <div class="value">{{ (recipe.retailPrice - totalCostPerUnit) | currency }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <create-edit-Recipe-Modal :currentRecipe="recipe"></create-edit-Recipe-Modal>

    <!-- <scale-recipe-modal :currentRecipe="recipe"></scale-recipe-modal> -->

    <b-modal
      id="scale-recipe-modal"
      size="lg"
      v-model="showScaleRecipeModal"
      @shown="startScaleRecipe"
      title="Scale Recipe"
      lazy
    >
      <div class="d-flex mb-2 align-items-center">
        <p class="mb-0">Scale factor</p>
        <!-- <b-btn
          class="mx-1"
          :class="[(newBatchSizeMultiplier = 0.25) ? 'btn-primary' : 'btn-secondary']"
          @click="scaleRecipe(0.25)"
          >Quarter</b-btn
        > -->
        <b-btn class="mx-1" :class="{ 'btn-primary': (newBatchSizeMultiplier = 0.5) }" @click="scaleRecipe(0.5)"
          >Half</b-btn
        >
        <b-btn class="mx-1" :class="{ 'btn-primary': (newBatchSizeMultiplier = 2) }" @click="scaleRecipe(2)">2x</b-btn>
        <b-btn class="mx-1" :class="{ 'btn-primary': (newBatchSizeMultiplier = 3) }" @click="scaleRecipe(3)">3x</b-btn>
        <b-btn class="mx-1" :class="{ 'btn-primary': (newBatchSizeMultiplier = 4) }" @click="scaleRecipe(4)">4x</b-btn>
      </div>

      <table v-if="newBatchSizeMultiplier" class="table">
        <thead>
          <th>Ingredient</th>
          <th>Current Batch Size: {{ recipe.batchSize }}</th>
          <th>New Batch Size: {{ recipe.batchSize * newBatchSizeMultiplier }}</th>
        </thead>
        <tbody>
          <tr v-for="item in newBatchSizeItems" :key="item.id">
            <td>{{ getItemById(item.ref).name }}</td>
            <td>{{ item.value }}{{ item.unit }}</td>
            <td>{{ newValue(item.value) }}{{ item.unit }}</td>
          </tr>
        </tbody>
      </table>

      <!-- <b-table
        v-if="inventory"
        class="bg-white"
        :items="newBatchSizeItems"
        :fields="scaleReciepeFields"
        :tbody-tr-class="rowClass"
      >
        <template v-slot:cell(ref)="data">
          <span v-if="data">{{ getItemById(data.item.ref).name }}</span>
        </template>
        <template v-slot:cell(value)="data">
          {{ data.item.value }}
          {{ data.item.unit }}
        </template>
        <template v-slot:cell(newValue)="data">
          {{ data }}
          {{ data.item.newValue }}
          {{ data.item.unit }}
        </template>
        <template v-slot:cell(amountInInventory)="data">
          {{ getItemById(data.item.ref).value | rounded }}
          {{ getItemById(data.item.ref).unit }}
        </template>
        <template v-slot:cell(itemCost)="data">
          <span>{{ itemCost(data.item) | currency }}</span>
        </template>
      </b-table> -->
    </b-modal>

    <b-modal
      @ok="handleRemove"
      ok-title="Confirm"
      v-model="showMakeRecipeModal"
      id="makeRecipeModal"
      title="Make Recipe"
    >
      <div v-if="!removingInventory">
        <p>Batch Size: {{ recipe.batchSize }} {{ recipe.batchLabel }}</p>
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
  </div>
</template>

<script>
import { db } from '@/db';
import createEditRecipeModal from '@/components/Recipes/CreateEditRecipeModal.vue';
import { mapActions } from 'vuex';

export default {
  name: 'recipe',
  props: ['id'],
  components: {
    createEditRecipeModal,
  },
  data() {
    return {
      refInventory: null,
      showMakeRecipeModal: false,
      showEditRecipeModal: false,
      showScaleRecipeModal: false,
      currentRecipe: null,
      removingInventory: false,
      newBatchSizeMultiplier: null,
      newBatchSizeItems: {},
      // currentRecipe: {
      //   name: null,
      //   size: null,
      //   items: []
      // },
      scaleReciepeFields: [
        {
          key: 'ref',
          label: 'Item',
        },
        {
          key: 'value',
          label: 'Recipe Amount',
        },
        {
          key: 'newValue',
          label: 'New Value',
        },
        {
          key: 'amountInInventory',
          label: 'Amount In Inventory',
        },
        {
          key: 'itemCost',
          label: 'Item Cost',
          tdClass: 'text-right',
          thClass: 'text-right',
        },
      ],
      fields: [
        {
          key: 'ref',
          label: 'Item',
        },
        {
          key: 'value',
          label: 'Recipe Amount',
        },
        {
          key: 'amountInInventory',
          label: 'Amount In Inventory',
        },
        {
          key: 'itemCost',
          label: 'Item Cost',
          tdClass: 'text-right',
          thClass: 'text-right',
        },
      ],
    };
  },
  methods: {
    ...mapActions(['deleteRecipe', 'logCreation']),
    getItemById(id) {
      return this.inventory.find((item) => {
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
      console.log('Log');
      this.logCreation(this.recipe);
    },
    removeInventory() {
      console.log('Removing...');
      this.recipe.items.forEach((item) => {
        const oldValue = this.inventory.find((test) => {
          return test.id === item.ref;
        });

        let newValue = Number(oldValue.value) - Number(item.value);

        this.refInventory.doc(item.ref).update({
          value: newValue,
        });
      });
    },
    finishRemoving() {
      console.log('Finsih');
      this.removingInventory = false;
      this.showMakeRecipeModal = false;
      this.$bvToast.toast('Inventory quantities updated');
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
        return 'table-danger';
      }
    },
    startScaleRecipe() {
      // this.$bvModal.show("scale-recipe-modal");
      console.log('Change batch size');
      // Make a copy of the current reciepe
      this.newBatchSizeItems = JSON.parse(JSON.stringify(this.recipe.items));
    },
    scaleRecipe(factor) {
      console.log(factor);
      this.newBatchSizeMultiplier = factor;
      // Loop through items in newBatchSizeItems object and change the value by the factor
      this.newBatchSizeItems.forEach((item) => {
        let value = parseInt(item.value);
        console.log(value * factor);
        // Update quantity
        item.newValue = value * factor;
      });
    },
    newValue(oldValue) {
      return parseInt(oldValue) * this.newBatchSizeMultiplier;
    },
    startEditingRecipe() {
      this.startEditingRecipe = true;
      this.currentRecipe = this.recipe;
      // this.currentRecipe.name = this.recipe.name;
      // this.currentRecipe.size = this.recipe.size;
      // this.currentRecipe.items = this.recipe.items;
      // this.showEditRecipeModal = true;
      this.$bvModal.show('create-edit-recipe-modal');
    },
    // Needs refactoring
    handleDelete() {
      this.$bvModal
        .msgBoxConfirm('Are you sure you want to delete this recipe?', {
          title: 'Please Confirm',
          size: 'sm',
          okVariant: 'danger',
          okTitle: 'Delete',
          cancelTitle: 'Cancel',
          footerClass: 'p-2',
          centered: true,
        })
        .then((value) => {
          if (value === true) {
            this.deleteRecipe(this.recipe.id);
          }
        })
        .catch((err) => {
          console.error(err);
        });
    },
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
      this.recipe.items.forEach((item) => {
        cost += this.itemCost(item);
      });
      return cost;
    },
    totalOtherCosts() {
      if (this.recipe.otherCosts) {
        let cost = 0;
        this.recipe.otherCosts.forEach((item) => {
          cost += item.costPerItem;
        });
        return cost;
      } else {
        return null;
      }
    },
    costPerUnit() {
      return this.totalCost / this.recipe.batchSize;
    },
    totalCostPerUnit() {
      return this.costPerUnit + this.totalOtherCosts;
    },
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
      .collection('users')
      .doc(this.$store.state.currentUser.uid)
      .collection('inventory');

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
  },
  mounted() {
    console.log('Here');
    if (this.recipe) {
      console.log(this.recipe);
      // this.newBatchSize = this.recipe.batchSize;
      // Vue.set(this.newBatchSize, this.recipe.batchSize);
    }
  },
};
</script>

<style lang="scss" scoped>
.recipe-info {
  .label {
    font-size: $text-base;
    line-height: 1;
    margin-bottom: 0;
  }
  .value {
    font-weight: bold;
    margin-left: auto;
  }
}
</style>
