<template>
  <div class="container-xl pt-5" v-if="recipe">
    <router-link to="/recipes">
      <font-awesome-icon class="mr-2" :icon="['far', 'arrow-left']"></font-awesome-icon>Recipes
    </router-link>
    <div class="d-flex my-4">
      <h1 class="page-title mb-0">{{ recipe.name }}</h1>
      <div class="d-flex align-items-baseline ml-4 flex-grow-1">
        <b-btn @click="showScaleRecipeModal = true" class="mr-2" size="sm" variant="outline-primary"
          >Scale Recipe</b-btn
        >
        <b-btn :disabled="!canMakeRecipe" @click="showMakeRecipeModal = true" class="mr-2" size="sm" variant="primary"
          >Make Recipe</b-btn
        >
        <div v-if="!canMakeRecipe">
          <b-icon class="mr-2" icon="exclamation-triangle"></b-icon
          ><span class="text-sm font-weight-bold">Can't make recipe</span>
        </div>
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
            <b-badge v-if="!enoughInventory(data.item.value, getItemById(data.item.ref).value)" variant="danger"
              >Not enough Inventory</b-badge
            >
          </template>
          <template v-slot:cell(percentageInInventory)="data">
            {{ ((data.item.value / getItemById(data.item.ref).value) * 100) | rounded }}
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
        <div v-if="recipe.history" class="box p-5 mb-3">
          <h3 class="text-base font-weight-bold">Previously Made Batches</h3>
          <b-list-group>
            <b-list-group-item
              class="d-flex align-items-baseline"
              v-for="item in orderedHistory"
              :key="item.timestamp.seconds"
            >
              <div>{{ item.timestamp.toDate() | date }}</div>
              <div class="ml-auto text-sm text-muted">{{ item.batchSize }} {{ item.batchLabel }}</div>
            </b-list-group-item>
          </b-list-group>
        </div>
      </div>
    </div>

    <create-edit-Recipe-Modal :currentRecipe="recipe"></create-edit-Recipe-Modal>

    <b-modal
      id="scale-recipe-modal"
      size="xl"
      v-model="showScaleRecipeModal"
      @shown="startScaleRecipe"
      @close="clearScaleRecipe"
      @cancel="clearScaleRecipe"
      title="Scale Recipe"
      lazy
      hide-footer
    >
      <div class="d-flex mb-3 align-items-end">
        <b-button-group class="mr-3">
          <b-button @click="scaleRecipe(option.value)" v-for="(option, index) in scaleOptions" :key="index">{{
            option.text
          }}</b-button>
        </b-button-group>
        <b-button id="customScalePopover" @click="customScalePopoverShow = !customScalePopoverShow">
          Custom Scale <span v-if="customScaleValue">: {{ customScaleValue }}</span>
        </b-button>
        <b-popover
          :show="customScalePopoverShow"
          @shown="customScalePopoverShown"
          target="customScalePopover"
          placement="bottom"
        >
          <b-form @submit="onCustomScaleSubmit">
            <b-input-group>
              <b-form-input ref="input1" placeholder="e.g. 7" v-model="customScaleValue" number></b-form-input>
              <b-input-group-prepend>
                <b-button type="submit" variant="primary">Submit</b-button>
              </b-input-group-prepend>
            </b-input-group>
          </b-form>
        </b-popover>
        <b-button :disabled="!newBatchSizeMultiplier" class="ml-auto" @click="clearCustomScale" variant="secondary"
          >Reset</b-button
        >
      </div>

      <table class="table" v-if="newBatchSizeMultiplier">
        <thead>
          <th>Ingredient</th>
          <th>Current Batch Size: {{ recipe.batchSize }}</th>
          <th style="min-width:100px">
            <div v-if="newBatchSizeMultiplier === null">-</div>
            <div v-else>
              New Batch Size: <ICountUp :endVal="recipe.batchSize * newBatchSizeMultiplier" :options="countUpOptions" />
            </div>
          </th>
          <th>Amount in Inventory</th>
        </thead>
        <tbody>
          <tr v-for="item in newBatchSizeItems" :key="item.id" :class="scaleRowClass(item)">
            <td>{{ getItemById(item.ref).name }}</td>
            <td>{{ item.value }}{{ item.unit }}</td>
            <td>
              <div v-if="newBatchSizeMultiplier === null">-</div>
              <div v-else>
                <ICountUp :endVal="item.newValue" :options="countUpOptions" />{{ item.unit }}
                <b-badge v-if="!enoughInventory(item.newValue, getItemById(item.ref).value)" variant="danger"
                  >Not enough Inventory</b-badge
                >
              </div>
            </td>
            <td>{{ getItemById(item.ref).value | rounded }} {{ getItemById(item.ref).unit }}</td>
          </tr>
        </tbody>
      </table>
      <div v-else>Select a scale factor</div>
      <div class="text-center mt-6">
        <b-button :disabled="!newBatchSizeMultiplier" variant="primary" @click="showMakeRecipeModal = true"
          >Make Scaled Recipe</b-button
        >
      </div>
    </b-modal>

    <b-modal
      @ok="handleRemove"
      ok-title="Confirm"
      v-model="showMakeRecipeModal"
      id="makeRecipeModal"
      title="Make Recipe"
    >
      <div v-if="!removingInventory">
        <p v-if="newBatchSizeMultiplier">
          Batch Size: {{ recipe.batchSize * newBatchSizeMultiplier }} {{ recipe.batchLabel }}
        </p>
        <p v-else>Batch Size: {{ recipe.batchSize }} {{ recipe.batchLabel }}</p>
        <p>This will remove the following quantities from your inventory</p>
        <div v-if="newBatchSizeMultiplier">
          <div class="d-flex mb-1" v-for="item in newBatchSizeItems" :key="item.id">
            <div>{{ getItemById(item.ref).name }}</div>
            <div class="ml-auto font-weight-bold">{{ item.newValue }} {{ item.unit }}</div>
          </div>
        </div>
        <div v-else>
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
      customScaleValue: null,
      customScalePopoverShow: false,
      newBatchSizeItems: {},
      countUpOptions: {
        duration: 1,
      },
      scaleOptions: [
        { text: 'Half', value: 0.5 },
        { text: 'Double', value: 2 },
        { text: '3x', value: 3 },
        { text: '4x', value: 4 },
      ],
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
      this.logCreation(this.recipe);
    },
    removeInventory() {
      if (this.newBatchSizeMultiplier) {
        this.newBatchSizeItems.forEach((item) => {
          const oldValue = this.inventory.find((test) => {
            return test.id === item.ref;
          });

          let newValue = Number(oldValue.value) - Number(item.newValue);

          this.refInventory.doc(item.ref).update({
            value: newValue,
          });
        });
      } else {
        this.recipe.items.forEach((item) => {
          const oldValue = this.inventory.find((test) => {
            return test.id === item.ref;
          });

          let newValue = Number(oldValue.value) - Number(item.value);

          this.refInventory.doc(item.ref).update({
            value: newValue,
          });
        });
      }
    },
    finishRemoving() {
      this.removingInventory = false;
      this.showMakeRecipeModal = false;
      this.showMakeRecipeModal = false;
      this.newBatchSizeMultiplier = null;
      this.$bvToast.toast('Inventory quantities updated');
    },
    enoughInventory(recipeQuantity, inventoryQuantity) {
      let recipeQuantityInterger = parseInt(recipeQuantity);
      let inventoryQuantityInterger = parseInt(inventoryQuantity);
      if (recipeQuantityInterger <= inventoryQuantityInterger) {
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
    scaleRowClass(item) {
      if (!this.enoughInventory(this.newValue(item.value), this.getItemById(item.ref).value)) {
        return 'table-danger';
      }
    },
    startScaleRecipe() {
      // Make a copy of the current reciepe
      this.newBatchSizeItems = JSON.parse(JSON.stringify(this.recipe.items));
    },
    scaleRecipe(factor) {
      this.newBatchSizeMultiplier = factor;
      // Loop through items in newBatchSizeItems object and change the value by the factor
      this.newBatchSizeItems.forEach((item) => {
        let value = parseInt(item.value);
        // Update quantity
        item.newValue = value * factor;
      });
    },
    clearScaleRecipe() {
      this.newBatchSizeMultiplier = null;
      this.newBatchSizeItems.forEach((item) => {
        item.newValue = null;
      });
    },
    onCustomScaleSubmit(value) {
      value.preventDefault();
      this.newBatchSizeMultiplier = this.customScaleValue;
      this.newBatchSizeItems.forEach((item) => {
        let value = parseInt(item.value);
        // Update quantity
        item.newValue = value * this.newBatchSizeMultiplier;
      });
      this.customScalePopoverShow = false;
    },
    customScalePopoverShown() {
      this.focusRef(this.$refs.input1);
    },
    focusRef(ref) {
      // Some references may be a component, functional component, or plain element
      // This handles that check before focusing, assuming a `focus()` method exists
      // We do this in a double `$nextTick()` to ensure components have
      // updated & popover positioned first
      this.$nextTick(() => {
        this.$nextTick(() => {
          (ref.$el || ref).focus();
        });
      });
    },
    clearCustomScale() {
      this.customScaleValue = null;
      this.newBatchSizeMultiplier = null;
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
          // console.error(err);
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
    orderedHistory() {
      if (!this.recipe.history) {
        return;
      }
      let items = this.recipe.history;
      let orderedItems = items.sort(function(x, y) {
        return y.timestamp.toDate() - x.timestamp.toDate();
      });
      return orderedItems;
    },
    canMakeRecipe() {
      let itemsArray = [];
      this.recipe.items.forEach((item) => {
        let itemValue = this.enoughInventory(item.value, this.getItemById(item.ref).value);
        itemsArray.push(itemValue);
      });
      let checker = (arr) => arr.every((v) => v === true);

      return checker(itemsArray);
    },
    // customScaleActive() {
    //   if (this.scaleOptions.some((e) => e.value === this.newBatchSizeMultiplier)) {
    //     return true;
    //   } else {
    //     return false;
    //   }
    // },
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
