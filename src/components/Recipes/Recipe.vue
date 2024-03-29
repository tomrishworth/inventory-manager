<template>
  <div class="container-xl pt-5" v-if="recipe">
    <router-link to="/recipes">
      <font-awesome-icon class="mr-2" :icon="['far', 'arrow-left']"></font-awesome-icon>Recipes
    </router-link>
    <div class="d-flex my-4">
      <h1 class="page-title mb-0">{{ recipe.name }}</h1>
      <div class="d-flex ml-4 flex-grow-1">
        <b-btn @click="showScaleRecipeModal = true" class="mr-2" size="sm" variant="outline-primary"
          >Scale Recipe</b-btn
        >
        <b-btn @click="showMakeRecipeModal = true" class="mr-2" size="sm" variant="primary">Make Recipe</b-btn>
        <div class="ml-auto">
          <b-btn @click="startEditingRecipe" class="mr-2" variant="outline-primary" size="sm">
            <font-awesome-icon :icon="['far', 'pen']"></font-awesome-icon>
          </b-btn>
          <b-dropdown variant="link" right class="dropdown-ellipsis" no-caret aria-label="actions">
            <template slot="button-content">
              <font-awesome-icon :icon="['far', 'ellipsis-v']"></font-awesome-icon>
            </template>
            <b-dropdown-item @click="handleDelete">
              <font-awesome-icon :icon="['far', 'trash-alt']"></font-awesome-icon>Delete
            </b-dropdown-item>
          </b-dropdown>
        </div>
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
          <template v-slot:cell(percentageInInventory)="data">
            {{ ( data.item.value / getItemById(data.item.ref).value ) * 100 | rounded}}
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

          <div v-if="recipe.otherCosts.length">
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

        <b-btn class="mx-1" @click="scaleRecipe(0.5)">Half</b-btn>
        <b-btn class="mx-1" @click="scaleRecipe(2)">2x</b-btn>
        <b-btn class="mx-1" @click="scaleRecipe(3)">3x</b-btn>
        <b-btn class="mx-1" @click="scaleRecipe(4)">4x</b-btn>
      </div>
      <p v-if="newBatchSizeMultiplier">
        Scale Factor: <strong>{{ newBatchSizeMultiplier }}</strong>
      </p>

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
            <!-- <td>{{ newValue(item.value) }}{{ item.unit }}</td> -->
            <td><ICountUp :endVal="newValue(item.value)" :options="countUpOptions"/>{{ item.unit }}</td>
          </tr>
        </tbody>
      </table>
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
import ICountUp from 'vue-countup-v2';

export default {
  name: 'recipe',
  props: ['id'],
  components: {
    createEditRecipeModal,
    ICountUp,
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
      countUpOptions: {
        duration: 1
      },
      // scaleReciepeFields: [
      //   {
      //     key: 'ref',
      //     label: 'Item',
      //   },
      //   {
      //     key: 'value',
      //     label: 'Recipe Amount',
      //   },
      //   {
      //     key: 'newValue',
      //     label: 'New Value',
      //   },
      //   {
      //     key: 'amountInInventory',
      //     label: 'Amount In Inventory',
      //   },
      //   {
      //     key: 'itemCost',
      //     label: 'Item Cost',
      //     tdClass: 'text-right',
      //     thClass: 'text-right',
      //   },
      // ],
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
          key: 'percentageInInventory',
          label: '% of Inventory',
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
        // console.log(value * factor);
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
    this.refInventory = db
      .collection('users')
      .doc(this.$store.state.currentUser.uid)
      .collection('inventory');
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
