<template>
  <div class="container">
    <div class="d-flex my-4">
      <h1 class="page-title mb-0">Recipes</h1>
      <div class="ml-4">
        <b-btn size="sm" variant="primary" v-b-modal.create-edit-recipe-modal>
          <font-awesome-icon class="mr-2" :icon="['far', 'plus']"></font-awesome-icon>Add recipe
        </b-btn>
      </div>
    </div>
    <div v-if="recipes" class="mb-4 row">
      <div class="recipe col-sm-3" v-for="recipe in recipes" :key="recipe.id">
        <div class="border bg-white">
          <!-- <div v-if="recipe.imageUrl">
            <img class="img-fluid" :src="recipe.imageUrl" />
          </div>-->
          <div class="d-flex p-4">
            <router-link :to="{ name: 'recipe', params: { id: recipe.id } }">{{ recipe.name }}</router-link>
            <!-- <b-dropdown
              variant="link"
              right
              class="ml-auto dropdown-ellipsis"
              no-caret
              aria-label="actions"
            >
              <template slot="button-content">
                <font-awesome-icon :icon="['far', 'ellipsis-v']"></font-awesome-icon>
              </template>
              <b-dropdown-item @click="startEditingRecipe(recipe)">
                <font-awesome-icon :icon="['far', 'pen']"></font-awesome-icon>Edit
              </b-dropdown-item>
              <b-dropdown-item @click="handleDelete(recipe.id)">
                <font-awesome-icon :icon="['far', 'trash-alt']"></font-awesome-icon>Delete
              </b-dropdown-item>
            </b-dropdown>-->
          </div>
        </div>
      </div>
    </div>

    <!-- <b-modal
      @ok="handleOk"
      @show="createRecipe"
      @cancel="handleCancel"
      id="addRecipe"
      title="Add a recipe"
      size="lg"
    >
      <div class="bg-light p-4">
        <b-form-group label="Recipe name" label-for="name">
          <b-form-input v-model="newRecipe.name" id="name"></b-form-input>
        </b-form-group>
        <b-form-group label="Retail Price" prepend="$" label-for="retailPrice">
          <b-form-input
            type="number"
            placeholder="0.00"
            v-model="newRecipe.retailPrice"
            id="retailPrice"
          ></b-form-input>
        </b-form-group>
        <b-form-group label="Batch Size">
          <div class="d-flex">
            <b-form-group
              label="Batch Size"
              label-sr-only
              label-for="batchSize"
              description="e.g 50"
              class="mr-2"
            >
              <b-form-input
                type="number"
                placeholder="Size"
                v-model="newRecipe.batchSize"
                id="batchSize"
              ></b-form-input>
            </b-form-group>
            <b-form-group
              label="Batch Label"
              label-sr-only
              label-for="batchLabel"
              description="e.g litres"
            >
              <b-form-input v-model="newRecipe.batchLabel" placeholder="Label" id="batchLabel"></b-form-input>
            </b-form-group>
          </div>
        </b-form-group>

        <b-form-group label="Image" label-for="image">
          <b-form-file
            v-model="newRecipe.image"
            accept=".jpg, .png, .gif"
            placeholder="Choose a file or drop it here..."
            drop-placeholder="Drop file here..."
          ></b-form-file>
        </b-form-group>

        <div class="row" v-if="newRecipe.items.length">
          <div class="col-4"></div>
          <div class="col-3">Quantity</div>
          <div class="col-3">Type</div>
        </div>
        <div class="row mb-1" v-for="(item, index) in newRecipe.items" :key="item.id">
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

    <!-- <b-modal
      @ok="saveEdit"
      ok-title="Save Changes"
      @cancel="handleCancel"
      size="lg"
      v-if="editRecipe"
      id="editRecipe"
      v-model="showEditModal"
      title="Edit recipe"
    >
      <div class>
        <b-form-group class="mr-4" label="Recipe Name" label-for="recipeName">
          <b-form-input v-model="editRecipe.name" id="recipeName"></b-form-input>
        </b-form-group>
        <div class="mb-2">
          <div style="width:100px" v-if="editRecipe.imageUrl">
            <img class="img-fluid" :src="editRecipe.imageUrl" />
            <button @click="deleteImage">Delete</button>
          </div>
          <div v-else>
            <p>File upload here</p>
          </div>
        </div>
        <div class="d-flex">
          <b-form-group class="mr-4" label="Retail Price" label-for="retailPrice">
            <b-input-group prepend="$">
              <b-form-input
                type="number"
                placeholder="0.00"
                v-model="editRecipe.retailPrice"
                id="retailPrice"
              ></b-form-input>
            </b-input-group>
          </b-form-group>
          <b-form-group label="Batch Size">
            <div class="d-flex">
              <b-form-group
                label="Batch Size"
                label-sr-only
                label-for="batchSize"
                description="e.g 50"
                class="mr-1"
              >
                <b-form-input
                  type="number"
                  placeholder="Size"
                  v-model="editRecipe.batchSize"
                  id="batchSize"
                ></b-form-input>
              </b-form-group>
              <b-form-group
                label="Batch Label"
                label-sr-only
                label-for="batchLabel"
                description="e.g litres"
              >
                <b-form-input v-model="editRecipe.batchLabel" placeholder="Label" id="batchLabel"></b-form-input>
              </b-form-group>
            </div>
          </b-form-group>
        </div>

        <h3 class="h6">Recipe Items</h3>
        <b-table borderless small :items="editRecipe.items" :fields="fields">
          <template v-slot:cell(name)="data">{{ getItemById(data.item.ref).name }}</template>
          <template v-slot:cell(quantity)="data">
            <b-form-group label="Amount" label-sr-only label-for="amount">
              <b-form-input
                style="min-width:100px"
                placeholder="Amount"
                type="number"
                step="0.01"
                v-model="data.item.value"
                id="amount"
              ></b-form-input>
            </b-form-group>
          </template>
          <template v-slot:cell(unit)="data">
            <b-form-group label-sr-only label="Type">
              <b-form-select v-model="data.item.unit" :options="options"></b-form-select>
            </b-form-group>
          </template>
          <template v-slot:cell(actions)="data">
            <b-dropdown
              variant="link"
              right
              class="dropdown-ellipsis"
              no-caret
              aria-label="actions"
            >
              <template slot="button-content">
                <font-awesome-icon :icon="['far', 'ellipsis-v']"></font-awesome-icon>
              </template>
              <b-dropdown-item @click="removeEditItem(data.index)">
                <font-awesome-icon :icon="['far', 'trash-alt']"></font-awesome-icon>Delete
              </b-dropdown-item>
            </b-dropdown>
          </template>
        </b-table>
  

        <v-select label="name" @input="handleEditAdd" :options="inventory"></v-select>

        <b-dropdown text="Add item">
          <b-dropdown-item
            @click="handleEditAdd(item.id)"
            v-for="item in inventory"
            :key="item.id"
          >{{ item.name }}</b-dropdown-item>
        </b-dropdown>
        <div class="mt-3">
          <small class="text-muted">Only items in your inventory can be added</small>
        </div>
      </div>
    </b-modal>-->
    <create-edit-Recipe-Modal currentRecipe></create-edit-Recipe-Modal>
  </div>
</template>

<script>
// import { db } from "@/db";
// import { auth } from "@/db";
// import * as firebase from "firebase/app";
import "firebase/storage";
import createEditRecipeModal from "@/components/Recipes/CreateEditRecipeModal.vue";

export default {
  name: "recipes",
  components: {
    createEditRecipeModal
  },
  data() {
    return {
      refRecipe: null,
      refInventory: null,
      newRecipe: {
        id: null,
        name: null,
        image: null,
        imageUrl: null,
        batchSize: null,
        batchLabel: null,
        items: []
      },
      editRecipe: null,
      makeRecipe: null,
      showEditModal: false,
      showCreateModal: false,
      fields: [
        {
          key: "name",
          sortable: true
        },
        {
          key: "quantity",
          label: "Quantity"
        },
        {
          key: "unit",
          label: "Unit"
        },
        {
          key: "actions"
        }
      ]
    };
  },
  methods: {
    // handleAdd(id) {
    //   const unit = this.getItemById(id).unit;
    //   const receipeItem = {
    //     ref: id,
    //     value: 0,
    //     unit: unit,
    //     id: uniqueId()
    //   };
    //   this.newRecipe.items.push(receipeItem);
    // },
    // handleEditAdd(value) {
    //   console.log(value);
    //   const unit = this.getItemById(value.id).unit;
    //   const receipeItem = {
    //     ref: value.id,
    //     value: 0,
    //     unit: unit,
    //     id: uniqueId()
    //   };
    //   this.editRecipe.items.push(receipeItem);
    // },
    // handleEditAdd(id) {
    //   const unit = this.getItemById(id).unit;
    //   const receipeItem = {
    //     ref: id,
    //     value: 0,
    //     unit: unit,
    //     id: uniqueId(),
    //   };
    //   this.editRecipe.items.push(receipeItem);
    // },
    removeItem(index) {
      this.newRecipe.items.splice(index, 1);
    },
    removeEditItem(index) {
      this.editRecipe.items.splice(index, 1);
    },
    // handleDelete(id) {
    //   this.$bvModal
    //     .msgBoxConfirm("Are you sure you want to delete this recipe?", {
    //       title: "Please Confirm",
    //       size: "sm",
    //       okVariant: "danger",
    //       okTitle: "Delete",
    //       cancelTitle: "Cancel",
    //       footerClass: "p-2",
    //       centered: true
    //     })
    //     .then(value => {
    //       if (value === true) {
    //         this.refRecipe
    //           .doc(id)
    //           .delete()
    //           .then(function() {
    //             console.log("Document successfully deleted!");
    //           });
    //       }
    //     })
    //     .catch(err => {
    //       console.error(err);
    //     });
    // },
    startMakerecipe(recipe) {
      this.makeRecipe = recipe;
      this.showCreateModal = true;
    },
    removeInventory() {
      this.makeRecipe.items.forEach(item => {
        const oldValue = this.inventory.find(test => {
          return test.id === item.ref;
        });

        let newValue = Number(oldValue.value) - Number(item.value);

        this.refInventory.doc(item.ref).update({
          value: newValue
        });
      });
    },
    startEditingRecipe(recipe) {
      this.editRecipe = recipe;
      this.showEditModal = true;
    },
    saveEdit() {
      this.refRecipe.doc(this.editRecipe.id).update({
        name: this.editRecipe.name,
        retailPrice: this.editRecipe.retailPrice,
        batchSize: this.editRecipe.batchSize,
        batchLabel: this.editRecipe.batchLabel,
        items: this.editRecipe.items
      });
      console.log("Saved");
    },
    handleCancel() {},
    // createRecipe() {
    //   const newRecipeRef = this.refRecipe.doc();
    //   this.newRecipe.id = newRecipeRef.id;
    // },
    getItemById(id) {
      return this.inventory.find(item => {
        if (item.id === id) {
          return item.id === id;
        } else {
          return null;
        }
      });
    },
    // handleOk() {
    //   if (this.newRecipe.image) {
    //     const filename = this.newRecipe.id + "-" + this.newRecipe.image.name;
    //     const storageRef = firebase.storage().ref();
    //     const imagesRef = storageRef.child("images");
    //     const imageRef = imagesRef.child(filename);
    //     const uploadTask = imageRef.put(this.newRecipe.image);

    //     uploadTask.on("state_changed", function(snapshot) {
    //       var progress =
    //         (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    //       console.log("Upload progress is " + progress + "% done");
    //     });

    //     uploadTask
    //       .then(snapshot => snapshot.ref.getDownloadURL())
    //       .then(url => (this.newRecipe.imageUrl = url))
    //       .then(() => {
    //         const recipe = {
    //           name: this.newRecipe.name,
    //           retailPrice: this.newRecipe.retailPrice,
    //           batchSize: this.newRecipe.batchSize,
    //           batchLabel: this.newRecipe.batchLabel,
    //           imageUrl: this.newRecipe.imageUrl,
    //           imageFileName: filename,
    //           items: this.newRecipe.items,
    //           timestamp: firebase.firestore.FieldValue.serverTimestamp()
    //         };

    //         this.refRecipe.doc(this.newRecipe.id).set(recipe);
    //       });
    //   } else {
    //     const recipe = {
    //       name: this.newRecipe.name,
    //       retailPrice: this.newRecipe.retailPrice,
    //       batchSize: this.newRecipe.batchSize,
    //       batchLabel: this.newRecipe.batchLabel,
    //       items: this.newRecipe.items,
    //       timestamp: firebase.firestore.FieldValue.serverTimestamp()
    //     };

    //     this.refRecipe.doc(this.newRecipe.id).set(recipe);
    //   }
    // },
    enoughInventory(recipeQuantity, inventoryQuantity) {
      if (recipeQuantity <= inventoryQuantity) {
        return true;
      } else {
        return false;
      }
    }
    // deleteImage() {
    //   const storageRef = firebase.storage().ref();
    //   const imageRef = storageRef.child(this.editRecipe.imageUrl);
    //   console.log(this.editRecipe.imageUrl);
    //   console.log(imageRef);
    //   const imageName = imageRef.name;
    //   console.log(imageName);
    //   this.$bvModal
    //     .msgBoxConfirm("Please confirm")
    //     .then(value => {
    //       console.log(value);
    //       if (value === true) {
    //         imageName
    //           .delete()
    //           .then(function() {
    //             console.log("File deleted");
    //           })
    //           .catch(function(error) {
    //             console.error(error);
    //           });
    //       }
    //     })
    //     .catch(err => {
    //       console.error(err);
    //     });
    // }
  },
  computed: {
    // options() {
    //   return this.$store.state.units;
    // },
    // inventory() {
    //   return this.$store.state.inventory;
    // },
    recipes() {
      return this.$store.state.recipes;
    }
  }
  // created() {
  //   auth.onAuthStateChanged(user => {
  //     this.refRecipe = db
  //       .collection("users")
  //       .doc(user.uid)
  //       .collection("recipes");

  //     this.refInventory = db
  //       .collection("users")
  //       .doc(user.uid)
  //       .collection("inventory");

  //     if (user) {
  //       db.collection("users")
  //         .doc(user.uid)
  //         .collection("inventory")
  //         .onSnapshot(snapshot => {
  //           const inventory = [];
  //           snapshot.forEach(doc => {
  //             const item = doc.data();
  //             item.id = doc.id;
  //             inventory.push(item);
  //           });
  //           this.inventory = inventory;
  //         });

  //       db.collection("users")
  //         .doc(user.uid)
  //         .collection("recipes")
  //         .onSnapshot(snapshot => {
  //           const recipes = [];
  //           snapshot.forEach(doc => {
  //             const item = doc.data();
  //             item.id = doc.id;
  //             recipes.push(item);
  //           });
  //           this.recipes = recipes;
  //         });
  //     }
  //   });
  // }
};
</script>

<style lang="scss" scoped>
.recipe {
}
</style>
