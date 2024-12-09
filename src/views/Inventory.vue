<template>
  <div class="container">
    <div class="d-flex my-4 w-75">
      <h1 class="page-title mb-0">Inventory</h1>
      <div v-if="inventory.length" class="ml-auto">
        <b-btn size="sm" variant="primary" @click="handleAdd">
          <font-awesome-icon class="mr-2" :icon="['far', 'plus']"></font-awesome-icon>Add inventory item
        </b-btn>
      </div>
    </div>
    <div class="mb-4 w-75">
      <b-table v-if="inventory.length" class="inventory bg-white" :items="inventory" :fields="fields">
        <template v-slot:table-busy>
          <div class="text-center my-6">
            <b-spinner class="align-middle mr-2"></b-spinner>
            <strong>Loading...</strong>
          </div>
        </template>
        <template v-slot:cell(test)="data">
          <div class="d-flex align-items-baseline">
            <div class="mr-3">
              <div>{{ convertedValue(data.item.value, data.item.unit) }}</div>
            </div>
            <adjust-quantity :item="data.item"></adjust-quantity>
          </div>
        </template>
        <template v-slot:cell(costInfo)="data">
          <div v-if="data.item.cost">
            <div>${{ data.item.cost }} per {{ convertedValue(data.item.costAmount, data.item.costUnit) }}</div>
            <div class="text-sm text-muted">{{ unitCost(data.item) }}</div>
          </div>
        </template>
        <template v-slot:cell(actions)="data">
          <b-dropdown variant="link" right class="dropdown-ellipsis" no-caret aria-label="actions">
            <template slot="button-content">
              <font-awesome-icon :icon="['far', 'ellipsis-v']"></font-awesome-icon>
            </template>
            <b-dropdown-item @click="handleEdit(data.item)">
              <font-awesome-icon :icon="['far', 'pen']"></font-awesome-icon>Edit
            </b-dropdown-item>
            <b-dropdown-item @click="handleDelete(data.item)">
              <font-awesome-icon :icon="['far', 'trash-alt']"></font-awesome-icon>Delete
            </b-dropdown-item>
          </b-dropdown>
        </template>
      </b-table>
      <div style="max-width: 700px" class="text-center" v-else>
        <img width="700" src="../assets/images/clip-list-is-empty.png" />
        <p>Add your first inventory item</p>
        <b-btn size="sm" variant="primary" @click="handleAdd">
          <font-awesome-icon class="mr-2" :icon="['far', 'plus']"></font-awesome-icon>Add item
        </b-btn>
      </div>
    </div>

    <create-edit-inventory-item-modal :currentItem="currentItem"></create-edit-inventory-item-modal>
  </div>
</template>

<script>
import { db } from '@/db';
import { auth } from '@/db';
import * as firebase from 'firebase/app';
import AdjustQuantity from '@/components/Inventory/AdjustQuantity';
import { formatMoney } from 'accounting';
import CreateEditInventoryItemModal from '@/components/Inventory/CreateEditInventoryItemModal.vue';
import { mapActions } from 'vuex';
import _ from 'lodash';

// import User from "@/components/User";
// import Multiselect from "vue-multiselect";
// import Qty from "js-quantities";
// import { unit } from 'mathjs';
// import math from "mathjs";

// const users = db.collection("users");

export default {
  name: 'home',
  components: {
    AdjustQuantity,
    CreateEditInventoryItemModal,
  },
  data() {
    return {
      loading: true,
      value: null,
      userID: null,
      user: null,
      currentItem: null,
      users: [],
      name: null,
      unit: 'kg',
      cost: null,
      costAmount: null,
      costUnit: 'kg',
      fields: [
        {
          key: 'name',
          sortable: true,
        },
        {
          key: 'test',
          label: 'Quantity',
        },
        {
          key: 'costInfo',
          label: 'Cost',
        },
        {
          key: 'actions',
        },
      ],
    };
  },
  methods: {
    ...mapActions(['deleteInventoryItem']),
    handleAdd() {
      this.currentItem = null;
      this.$bvModal.show('create-edit-inventory-item-modal');
    },
    handleEdit(item) {
      this.currentItem = item;
      this.$bvModal.show('create-edit-inventory-item-modal');
    },
    handleDelete(item) {
      const name = item.name;
      this.$bvModal
        .msgBoxConfirm(`Are you sure you want to delete ${name}?`, {
          title: 'Please Confirm',
          size: 'sm',
          okVariant: 'danger',
          okTitle: 'Delete',
          cancelTitle: 'Cancel',
        })
        .then((value) => {
          if (value === true) {
            this.deleteInventoryItem(item);
          }
        })
        .catch((err) => {
          // console.error(err);
        });
    },
    unitCost(item) {
      if (item.costAmount > 1000 && item.costUnit === 'g') {
        let convertedValue = item.costAmount / 1000;
        return formatMoney(item.cost / convertedValue) + ' per kg';
      } else if (item.costAmount > 1000 && item.costUnit === 'ml') {
        let convertedValue = item.costAmount / 1000;
        return formatMoney(item.cost / convertedValue) + ' per litre';
      } else {
        return formatMoney(item.cost / item.costAmount) + ' per ' + item.costUnit;
      }
    },
    convertedValue(value, unit) {
      if (unit === 'g') {
        const newValue = this.$units(value)
          .from('g')
          .toBest();
        const rounded = _.round(newValue.val, 2);
        return `${rounded} ${newValue.unit}`;
      } else if (unit === 'ml') {
        const newValue = this.$units(value)
          .from('ml')
          .toBest({
            exclude: [
              'mm3',
              'cm3',
              'cl',
              'dl',
              'kl',
              'm3',
              'km3',
              'krm',
              'tsk',
              'msk',
              'kkp',
              'glas',
              'kanna',
              'tsp',
              'Tbs',
              'in3',
              'fl-oz',
              'cup',
              'pnt',
              'qt',
              'gal',
              'ft3',
              'yd3',
            ],
          });
        const rounded = _.round(newValue.val, 2);
        return `${rounded} ${newValue.unit}`;
      } else {
        return value + ' ' + unit;
      }
    },
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
    inventory() {
      return this.$store.getters.inventory;
    },
    // indexedInventory() {
    //   return this.inventory.reduce((indexedItems, item) => {
    //     indexedItems[item.id] = item;
    //     return indexedItems;
    //   }, {});
    // }
  },
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
