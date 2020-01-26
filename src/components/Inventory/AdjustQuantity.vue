<template>
  <div>
    <b-button size="sm" variant="outline-primary" :id="`popover-target-${item.id}`">Edit</b-button>
    <b-popover
      :ref="popover"
      @show="onShow"
      @shown="onShown"
      :target="`popover-target-${item.id}`"
      placement="bottom"
      :show.sync="popoverShow"
    >
      <template v-slot:title>
        <b-button @click="onClose" class="close pull-up-5" aria-label="Close">
          <span class="d-inline-block" aria-hidden="true">&times;</span>
        </b-button>Adjust Quantity
      </template>
      <b-form @submit.stop.prevent>
        <div class="form-row">
          <b-form-group class="col" label="New Amount" label-for="amount">
            <b-form-input ref="input" type="number" step="0.01" v-model="initalValue" id="amount"></b-form-input>
          </b-form-group>
          <b-form-group class="col" label="Type">
            <b-form-select v-model="initalUnit" :options="options"></b-form-select>
          </b-form-group>
        </div>
        <div class="d-flex justify-content-end">
          <b-btn @click="onClose" class="mr-1" size="sm" variant="link">Cancel</b-btn>
          <b-btn @click="onOk" type="submit" size="sm" variant="primary">Save</b-btn>
        </div>
      </b-form>
    </b-popover>
  </div>
</template>

<script>
import { db } from "@/db";

export default {
  name: "AdjustQuantity",
  props: ["item"],
  data() {
    return {
      popoverShow: false,
      initalValue: null,
      initalUnit: null,
      popover: null
    };
  },
  methods: {
    onOk() {
      const name = this.item.name;
      db.collection("users")
        .doc(this.$store.state.currentUser.uid)
        .collection("inventory")
        .doc(this.item.id)
        .update({
          value: this.initalValue,
          unit: this.initalUnit
        });
      this.$bvToast.toast(`${name} updated`);
      this.onClose();
    },
    onClose() {
      this.popoverShow = false;
    },
    onShow() {
      this.initalValue = this.item.value;
      this.initalUnit = this.item.unit;
    },
    onShown() {
      this.focusRef(this.$refs.input);
    },
    focusRef(ref) {
      this.$nextTick(() => {
        this.$nextTick(() => {
          (ref.$el || ref).focus();
        });
      });
    }
  },
  computed: {
    options() {
      return this.$store.state.units;
    }
  }
};
</script>
