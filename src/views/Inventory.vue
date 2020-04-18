<template>
  <div class="container">
    <div class="d-flex my-4">
      <h1 class="page-title mb-0">Inventory</h1>
      <div class="ml-4">
        <b-btn size="sm" variant="primary" v-b-modal.addInventory>
          <font-awesome-icon class="mr-2" :icon="['far', 'plus']"></font-awesome-icon>Add inventory item
        </b-btn>
      </div>
    </div>
    <div class="mb-4 w-75">
      <b-table class="inventory bg-white" :items="inventory" :fields="fields">
        <template v-slot:cell(test)="data">
          <div class="d-flex align-items-baseline">
            <div class="mr-3">
              <!-- {{ data.item.value }} {{ data.item.unit }} -->
              <div>{{ convertedValue(data.item.value, data.item.unit) }}</div>
            </div>
            <adjust-quantity :item="data.item"></adjust-quantity>
          </div>
        </template>
        <template v-slot:cell(costInfo)="data">
          <div v-if="data.item.cost">
            <!-- <div>${{ data.item.cost }} per {{ data.item.costAmount }} {{ data.item.costUnit }}</div> -->
            <div>${{ data.item.cost }} per {{ convertedValue(data.item.costAmount, data.item.costUnit) }}</div>
            <div class="text-sm text-muted">
              <!-- {{ unitCost(data.item.cost, data.item.costAmount) }} per {{ data.item.costUnit }} -->
              {{ unitCost(data.item) }}
            </div>
          </div>
        </template>
        <template v-slot:cell(actions)="data">
          <b-dropdown variant="link" right class="dropdown-ellipsis" no-caret aria-label="actions">
            <template slot="button-content">
              <font-awesome-icon :icon="['far', 'ellipsis-v']"></font-awesome-icon>
            </template>
            <b-dropdown-item @click="viewInventory(data.item)">
              <font-awesome-icon :icon="['far', 'pen']"></font-awesome-icon>Edit
            </b-dropdown-item>
            <b-dropdown-item @click="handleDelete(data.item)">
              <font-awesome-icon :icon="['far', 'trash-alt']"></font-awesome-icon>Delete
            </b-dropdown-item>
          </b-dropdown>
        </template>
      </b-table>
    </div>

    <!-- Add Inventory Item Modal -->
    <b-modal
      id="addInventory"
      title="Add Inventory Item"
      @ok="addItem"
      ok-title="Add"
      @shown="focusInput"
    >
      <b-form class>
        <b-form-group class label="Name" label-for="name">
          <b-form-input ref="name" v-model="name" placeholder="e.g. Oil" id="name"></b-form-input>
        </b-form-group>
        <div class="d-flex">
          <b-form-group class="mr-2" label="Amount in Inventory" label-for="amount">
            <b-form-input type="number" step="0.01" v-model.number="value" id="amount"></b-form-input>
          </b-form-group>
          <b-form-group class label="Unit">
            <b-form-select v-model="unit" :options="options"></b-form-select>
          </b-form-group>
        </div>
        <hr />
        <h3 class="text-md">Costing Info</h3>
        <p class="text-muted">e.g. $20 per 3kgs</p>
        <div class="d-flex align-items-center">
          <b-form-group prepend="$" class="mr-2" label="Cost" label-for="cost" style="width:120px">
            <b-form-input
              type="number"
              step="0.01"
              placeholder="e.g. 20"
              v-model.number="cost"
              id="cost"
            ></b-form-input>
          </b-form-group>
          <div class="mx-2 font-italic text-muted">Per</div>
          <b-form-group class="mr-2" label="Amount" label-for="costAmount" style="width:120px">
            <b-form-input
              type="number"
              step="0.01"
              placeholder="3"
              v-model.number="costAmount"
              id="costAmount"
            ></b-form-input>
          </b-form-group>
          <b-form-group label="Unit" style="width:120px">
            <b-form-select v-model="costUnit" :options="options"></b-form-select>
          </b-form-group>
        </div>
      </b-form>
    </b-modal>

    <!-- Edit Inventory Item Modal -->
    <b-modal ref="viewItemModal" id="viewItem" title="Edit Item" ok-title="Save" @ok="handleEdit">
      <b-form v-if="currentItem" class>
        <b-form-group class label="Name" label-for="name">
          <b-form-input ref="name" v-model="currentItem.name" placeholder="e.g. Oil" id="name"></b-form-input>
        </b-form-group>
        <div class="d-flex">
          <b-form-group class="mr-2" label="Amount" label-for="amount">
            <b-form-input type="number" step="0.01" v-model.number="currentItem.value" id="amount"></b-form-input>
          </b-form-group>
          <b-form-group class label="Type">
            <b-form-select v-model="currentItem.unit" :options="options"></b-form-select>
          </b-form-group>
        </div>
        <h3 class="text-md">Costing Info</h3>
        <p class="text-muted">e.g. $20 per 3kgs</p>
        <div class="d-flex align-items-center">
          <b-form-group prepend="$" class="mr-2" label="Cost" label-for="cost" style="width:120px">
            <b-form-input
              type="number"
              step="0.01"
              placeholder="e.g. 20"
              v-model.number="currentItem.cost"
              id="cost"
            ></b-form-input>
          </b-form-group>
          <div class="mx-2 font-italic text-muted">Per</div>
          <b-form-group class="mr-2" label="Amount" label-for="costAmount" style="width:120px">
            <b-form-input
              type="number"
              step="0.01"
              placeholder="3"
              v-model.number="currentItem.costAmount"
              id="costAmount"
            ></b-form-input>
          </b-form-group>
          <b-form-group label="Unit" style="width:120px">
            <b-form-select v-model="currentItem.costUnit" :options="options"></b-form-select>
          </b-form-group>
        </div>
      </b-form>
    </b-modal>
  </div>
</template>

<script>
import { db } from "@/db";
import { auth } from "@/db";
import * as firebase from "firebase/app";
import AdjustQuantity from "@/components/Inventory/AdjustQuantity";
import { formatMoney } from "accounting";
// import User from "@/components/User";
// import Multiselect from "vue-multiselect";
// import Qty from "js-quantities";
// import { unit } from 'mathjs';
// import math from "mathjs";

// const users = db.collection("users");

export default {
  name: "home",
  components: {
    AdjustQuantity
  },
  data() {
    return {
      value: null,
      userID: null,
      user: null,
      currentItem: null,
      users: [],
      inventory: [],
      name: null,
      unit: "kg",
      cost: null,
      costAmount: null,
      costUnit: "kg",
      fields: [
        {
          key: "name",
          sortable: true
        },
        {
          key: "test",
          label: "Quantity"
        },
        {
          key: "costInfo",
          label: "Cost"
        },
        {
          key: "actions"
        }
      ]
    };
  },
  methods: {
    addItem() {
      if (this.unit === "kg") {
        this.value = this.value * 1000;
        this.unit = "g";
      } else if (this.unit === "litres") {
        this.value = this.value * 1000;
        this.unit = "ml";
      }
      if (this.costUnit === "kg") {
        this.costAmount = this.costAmount * 1000;
        this.costUnit = "g";
      } else if (this.costUnit === "litres") {
        this.costAmount = this.costAmount * 1000;
        this.costUnit = "ml";
      }
      db.collection("users")
        .doc(this.$store.state.currentUser.uid)
        .collection("inventory")
        .add({
          name: this.name,
          value: this.value,
          unit: this.unit,
          cost: this.cost,
          costAmount: this.costAmount,
          costUnit: this.costUnit,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
          this.clearForm();
        });
    },
    focusInput() {
      this.$refs.name.$el.focus();
    },
    clearForm() {
      (this.name = null), (this.value = null), (this.unit = null);
    },
    viewInventory(item) {
      this.currentItem = item;

      if (item.value > 1000 && item.unit === "g") {
        this.currentItem.value = item.value / 1000;
        this.currentItem.unit = "kg";
      } else if (item.value > 1000 && item.unit === "ml") {
        this.currentItem.value = item.value / 1000;
        this.currentItem.unit = "litres";
      }
      this.$refs["viewItemModal"].show();
    },
    handleDelete(item) {
      const name = item.name;
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
            this.deleteItem(item);
          }
        })
        .catch(err => {
          console.error(err);
        });
    },
    deleteItem(item) {
      this.$store.dispatch("inventoryItemLoadingStatus", {
        id: item.id,
        loading: true
      });
      const name = item.name;
      db.collection("users")
        .doc(this.$store.state.currentUser.uid)
        .collection("inventory")
        .doc(item.id)
        .delete()
        .then(() => {
          this.$store.dispatch("inventoryItemLoadingStatus", {
            id: item.id,
            loading: false
          });
          this.$bvToast.toast(`${name} deleted`);
        });
    },
    handleEdit() {
      if (this.currentItem.unit === "kg") {
        this.currentItem.value = this.currentItem.value * 1000;
        this.currentItem.unit = "g";
      } else if (this.currentItem.unit === "litres") {
        this.currentItem.value = this.currentItem.value * 1000;
        this.currentItem.unit = "ml";
      }
      if (this.currentItem.costUnit === "kg") {
        this.currentItem.costAmount = this.currentItem.costAmount * 1000;
        this.currentItem.costUnit = "g";
      } else if (this.currentItem.costUnit === "litres") {
        this.currentItem.costAmount = this.currentItem.costAmount * 1000;
        this.currentItem.costUnit = "ml";
      }
      this.$store.dispatch("inventoryItemLoadingStatus", {
        id: this.currentItem.id,
        loading: true
      });
      const name = this.currentItem.name;
      db.collection("users")
        .doc(this.$store.state.currentUser.uid)
        .collection("inventory")
        .doc(this.currentItem.id)
        .set(this.currentItem)
        .then(() => {
          this.$store.dispatch("inventoryItemLoadingStatus", {
            id: this.currentItem.id,
            loading: false
          });
          this.$bvToast.toast(`${name} updated`);
        });
    },
    // unitCost(cost, costAmount) {
    //   if (costAmount > 1000)
    //   return formatMoney(cost / costAmount);
    // },
    unitCost(item) {
      console.log(item);
      if (item.costAmount > 1000 && item.costUnit === "g") {
        let convertedValue = item.costAmount / 1000;
        return formatMoney(item.cost / convertedValue) + " per kg";
      } else if (item.costAmount > 1000 && item.costUnit === "ml") {
        let convertedValue = item.costAmount / 1000;
        return formatMoney(item.cost / convertedValue) + " per litre";
      } else {
        return (
          formatMoney(item.cost / item.costAmount) + " per " + item.costUnit
        );
      }
    },
    convertedValue(value, unit) {
      if (value > 1000 && unit === "g") {
        const newValue = value / 1000;
        return newValue + " kg";
      } else if (value > 1000 && unit === "ml") {
        const newValue = value / 1000;
        return newValue + " litres";
      } else {
        return value + " " + unit;
      }
    }
  },
  computed: {
    options() {
      return this.$store.state.units;
    },
    currentUser() {
      if (this.$store.state.currentUser) {
        return this.$store.state.currentUser.uid;
      } else {
        return null;
      }
    },
    indexedInventory() {
      return this.inventory.reduce((indexedItems, item) => {
        indexedItems[item.id] = item;
        return indexedItems;
      }, {});
    }
  },
  created() {
    auth.onAuthStateChanged(user => {
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
      }
    });
  }
};
</script>


<style lang="scss">
.adjust-quantity {
  opacity: 0;
  transition: opacity 1000ms ease;
}

.inventory {
  tr {
    &:hover {
      .adjust-quantity {
        opacity: 1;
      }
    }
  }
}
</style>