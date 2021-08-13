<template>
  <b-modal
    id="create-edit-inventory-item-modal"
    :title="editing ? 'Edit Inventory Item' : 'Add Inventory Item'"
    @ok="handleOk"
    :ok-title="editing ? 'Save changes' : 'Add Item'"
    @shown="onShow"
    @close="onClose"
    size="lg"
  >
    <validation-observer ref="observer" v-slot="{ handleSubmit }">
      <b-form @submit.stop.prevent="handleSubmit">
        <validation-provider name="Name" :rules="{ required: true, min: 3 }" v-slot="validationContext">
          <b-form-group class="w-50" label="Name" label-for="name">
            <b-form-input
              ref="name"
              v-model="name"
              :state="getValidationState(validationContext)"
              placeholder="e.g. Oil"
              id="name"
            ></b-form-input>
            <b-form-invalid-feedback id="input-1-live-feedback">{{
              validationContext.errors[0]
            }}</b-form-invalid-feedback>
          </b-form-group>
        </validation-provider>
        <div class="d-flex">
          <b-form-group class="mr-2" label="Amount in Inventory" label-for="amount">
            <b-form-input type="number" placeholder="0" step="0.01" v-model.number="value" id="amount"></b-form-input>
          </b-form-group>
          <b-form-group class label="Unit">
            <b-form-select v-model="unit" :options="options"></b-form-select>
          </b-form-group>
        </div>
        <hr />
        <h3 class="text-md mb-1">Costing Info</h3>
        <p class="text-muted">e.g. $20 per 3kgs</p>
        <div class="d-flex align-items-center">
          <b-form-group label="Cost" label-for="cost" style="width:140px">
            <b-input-group prepend="$">
              <b-form-input type="number" step="0.01" placeholder="0.00" v-model.number="cost" id="cost"></b-form-input>
            </b-input-group>
          </b-form-group>
          <div class="mx-3 font-italic text-muted pull-down-5">Per</div>
          <b-form-group class="mr-2" label="Amount" label-for="costAmount" style="width:120px">
            <b-form-input
              type="number"
              step="0.01"
              placeholder="0"
              v-model.number="costAmount"
              id="costAmount"
            ></b-form-input>
          </b-form-group>
          <b-form-group label="Unit" style="width:120px">
            <b-form-select v-model="costUnit" :options="options"></b-form-select>
          </b-form-group>
        </div>
      </b-form>
    </validation-observer>
  </b-modal>
</template>

<script>
import { mapActions } from 'vuex';
import * as firebase from 'firebase/app';

export default {
  props: ['currentItem'],
  data() {
    return {
      editing: false,
      name: null,
      value: null,
      unit: 'kg',
      cost: null,
      costAmount: null,
      costUnit: 'kg',
    };
  },
  methods: {
    ...mapActions(['createInventoryItem', 'editInventoryItem']),
    getValidationState({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null;
    },
    handleOk(bvModalEvt) {
      // Prevent modal from closing
      bvModalEvt.preventDefault();
      // Trigger submit handler
      this.$refs.observer.validate().then((success) => {
        if (!success) {
          return;
        }
        console.log('valid');
        this.handleSubmit();
        this.clearForm();
        this.$nextTick(() => {
          this.$bvModal.hide('create-edit-inventory-item-modal');
        });
      });
    },
    handleSubmit() {
      if (this.unit === 'kg') {
        this.value = this.value * 1000;
        this.unit = 'g';
      } else if (this.unit === 'litres') {
        this.value = this.value * 1000;
        this.unit = 'ml';
      }
      if (this.costUnit === 'kg') {
        this.costAmount = this.costAmount * 1000;
        this.costUnit = 'g';
      } else if (this.costUnit === 'litres') {
        this.costAmount = this.costAmount * 1000;
        this.costUnit = 'ml';
      }

      const inventoryItem = {
        id: this.id,
        name: this.name,
        value: this.value,
        unit: this.unit,
        cost: this.cost,
        costAmount: this.costAmount,
        costUnit: this.costUnit,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      };

      if (this.currentItem) {
        this.editInventoryItem(inventoryItem).then(() => {
          console.log('Edited');
          // this.$bvToast.toast(`${this.name} updated`);
        });
      } else {
        this.createInventoryItem(inventoryItem);
      }

      // this.createInventoryItem(inventoryItem);
    },
    onShow() {
      this.clearForm();
      if (this.currentItem) {
        this.editing = true;

        this.id = this.currentItem.id;
        this.name = this.currentItem.name;
        this.value = this.currentItem.value;
        this.unit = this.currentItem.unit;
        this.cost = this.currentItem.cost;
        this.costAmount = this.currentItem.costAmount;
        this.costUnit = this.currentItem.costUnit;
        this.updated = firebase.firestore.FieldValue.serverTimestamp();

        // Convert values to best value
        // if (this.unit === "kg") {
        //   this.value = this.value * 1000;
        //   this.unit = "g";
        // } else if (this.unit === "litres") {
        //   this.value = this.value * 1000;
        //   this.unit = "ml";
        // }
        // if (this.costUnit === "kg") {
        //   this.costAmount = this.costAmount * 1000;
        //   this.costUnit = "g";
        // } else if (this.costUnit === "litres") {
        //   this.costAmount = this.costAmount * 1000;
        //   this.costUnit = "ml";
        // }

        if (this.unit === 'g' && this.value > 9999) {
          this.unit = 'kg';
          this.value = this.value / 1000;
        } else if (this.unit === 'ml' && this.value > 9999) {
          this.unit = 'litres';
          this.value = this.value / 1000;
        }
      }
      this.$refs.name.$el.focus();
    },
    onClose() {
      this.clearForm();
      this.currentItem = null;
    },
    clearForm() {
      (this.id = null),
        (this.name = null),
        (this.value = null),
        (this.unit = 'kg'),
        (this.cost = null),
        (this.costAmount = null),
        (this.costUnit = 'kg');
    },
  },
  computed: {
    options() {
      return this.$store.state.units;
    },
  },
  beforeMount() {},
};
</script>
