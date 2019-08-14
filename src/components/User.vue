<template>
  <div>
    <h1>User</h1>
    {{ user }}
  </div>
</template>

<script>
import { db } from "@/db";

const users = db.collection("users");

export default {
  props: ["id"],
  data() {
    return {
      user: null
    };
  },

  watch: {
    id: {
      // call it upon creation too
      // immediate: true,
      handler(id) {
        // this.$bind("user", users.doc(id));
        this.$bind("user", users.doc(this.id)).then(user => {
          // user will point to the same property declared in data:
          // this.user === user;
        });
      }
    }
  }
};
</script>