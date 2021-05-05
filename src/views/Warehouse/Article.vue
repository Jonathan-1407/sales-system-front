<template>
  <div>
    <v-snackbar
      v-model="snackbar.show"
      :timeout="2000"
      transition="scroll-x-reverse-transition"
      absolute
      :color="snackbar.color"
      top
      right
      text
    >
      {{ snackbar.text }}
      <template v-slot:action="{ attrs }">
        <v-btn
          :color="snackbar.color"
          text
          v-bind="attrs"
          @click="snackbar.show = false"
        >
          <v-icon>mdi-close-circle</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
    <v-data-table
      :headers="headers"
      :items="articles"
      sort-by="calories"
      class="elevation-5"
      :search="search"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-btn class="mx-4" @click="generatePDF()" :loading="is_loading_pdf">
            <v-icon>mdi-printer</v-icon>
          </v-btn>
          <v-toolbar-title>Articles</v-toolbar-title>
          <v-divider class="mx-4" inset vertical></v-divider>
          <v-spacer></v-spacer>
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Search"
            single-line
            hide-details
          />
          <v-spacer></v-spacer>
          <v-dialog v-model="dialog" max-width="500px">
            <template v-slot:activator="{ on, attrs }">
              <v-btn color="indigo" dark class="mb-2" v-bind="attrs" v-on="on">
                New <v-icon>mdi-plus</v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-title>
                <span class="headline">{{ formTitle }}</span>
              </v-card-title>
              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col cols="12" sm="5" md="5">
                      <v-text-field
                        v-model="editedItem.code"
                        label="Code"
                        :rules="[rules.required, rules.counter]"
                        counter
                        maxlength="30"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="7" md="7">
                      <v-select
                        :items="categories"
                        v-model="editedItem.category"
                        label="category"
                        item-text="name"
                        item-value="_id"
                        :rules="[rules.required]"
                      ></v-select>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-text-field
                        v-model="editedItem.name"
                        label="Name"
                        :rules="[rules.required]"
                        counter
                        maxlength="60"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="6">
                      <v-text-field
                        v-model.number="editedItem.stock"
                        label="Stock"
                        :rules="[rules.required, rules.number]"
                        counter
                        maxlength="999"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="6">
                      <v-text-field
                        v-model.number="editedItem.sale_price"
                        label="Sale Price"
                        :rules="[rules.required, rules.number]"
                        counter
                        maxlength="999"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-text-field
                        v-model="editedItem.description"
                        label="Description (optional)"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="red darken-1" text @click="close">
                  Cancel
                </v-btn>
                <v-btn
                  color="indigo darken-1"
                  text
                  @click="save"
                  :disabled="isInvalid"
                >
                  Save
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="dialogState" max-width="500px">
            <v-card>
              <v-card-title class="headline flex justify-center">
                {{ dialogStateTitle }} this article?
              </v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="red darken-1" text @click="closeChangeState">
                  Cancel
                </v-btn>
                <v-btn color="indigo darken-1" text @click="changeStateConfirm">
                  {{ dialogStateTitle }}
                </v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>
      <template v-slot:item.description="{ item }">
        <span>
          {{ item.description ? item.description : "---" }}
        </span>
      </template>
      <template v-slot:item.state="{ item }">
        <span :class="item.state ? 'indigo--text' : 'red--text'">
          {{ item.state ? "Enabled" : "Disabled" }}
        </span>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-icon
              small
              class="mr-2"
              @click="edit(item)"
              v-bind="attrs"
              v-on="on"
            >
              mdi-pencil
            </v-icon>
          </template>
          <span>Edit</span>
        </v-tooltip>

        <v-tooltip bottom v-if="item.state">
          <template v-slot:activator="{ on, attrs }">
            <v-icon small @click="changeState(item)" v-bind="attrs" v-on="on">
              mdi-cancel
            </v-icon>
          </template>
          <span>Disable</span>
        </v-tooltip>

        <v-tooltip bottom v-else>
          <template v-slot:activator="{ on, attrs }">
            <v-icon small @click="changeState(item)" v-bind="attrs" v-on="on">
              mdi-check
            </v-icon>
          </template>
          <span>Enable</span>
        </v-tooltip>
      </template>
      <template v-slot:no-data>
        <v-btn color="indigo" class="white--text" @click="list">
          Reset
        </v-btn>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import { mapState } from "vuex";
import axios from "axios";
import jsPDF from "jspdf";

// eslint-disable-next-line no-unused-vars
import { autoTable } from "jspdf-autotable";

export default {
  name: "Article",
  data: () => ({
    search: "",
    dialog: false,
    dialogState: false,
    is_loading_pdf: false,
    snackbar: {
      show: false,
      text: "",
      color: ""
    },
    rules: {
      required: value => !!value || "Required field",
      counter: value => value.length <= 30 || "Maximum 30 characters",
      number: value => /^-?\d*\.?\d*$/.test(value) || "Only numbers"
    },
    headers: [
      {
        text: "Actions",
        value: "actions",
        sortable: false,
        align: "center",
        width: "15%"
      },
      {
        text: "Code",
        align: "left",
        sortable: true,
        value: "code"
      },
      {
        text: "Name",
        align: "left",
        sortable: true,
        value: "name"
      },
      {
        text: "Category",
        align: "left",
        sortable: true,
        value: "category.name"
      },
      {
        text: "Stock",
        align: "left",
        sortable: true,
        value: "stock"
      },
      {
        text: "Sale Price",
        align: "left",
        sortable: true,
        value: "sale_price"
      },
      {
        text: "Description",
        align: "left",
        sortable: true,
        value: "description"
      },
      {
        text: "State",
        align: "center",
        sortable: true,
        value: "state",
        width: "15%"
      }
    ],
    articles: [],
    categories: [],
    editedIndex: -1,
    editedItem: {
      code: "",
      name: "",
      category: "",
      stock: 0,
      sale_price: 0,
      state: 1
    },
    defaultItem: {
      code: "",
      name: "",
      category: "",
      stock: 0,
      sale_price: 0,
      state: 1
    }
  }),

  computed: {
    ...mapState(["token"]),
    formTitle: function() {
      return this.editedIndex === -1 ? "New Article" : "Edit Article";
    },
    dialogStateTitle: function() {
      return this.editedItem.state ? "Disable" : "Enable";
    },
    isInvalid: function() {
      let self = this;

      if (
        self.editedItem.code.length > 0 &&
        self.editedItem.name.length > 0 &&
        self.editedItem.category.length > 0 &&
        self.editedItem.stock >= 0 &&
        self.editedItem.sale_price >= 0
      ) {
        return false;
      } else {
        return true;
      }
    }
  },

  watch: {
    dialog: function(val) {
      val || this.close();
    },
    dialogState: function(val) {
      val || this.closeChangeState();
    }
  },

  created: function() {
    this.list();
    this.listCategories();
  },

  methods: {
    showSnackbar: function({ show, text, color }) {
      let self = this;
      self.snackbar.show = show;
      self.snackbar.text = text;
      self.snackbar.color = color;
    },
    list: function() {
      let config = {
        headers: {
          Token: this.token
        }
      };

      axios
        .get("/article/list", config)
        .then(res => {
          this.articles = res.data;
        })
        .catch(() => {
          this.showSnackbar({
            show: true,
            text: "Server Error",
            color: "red darken-3"
          });
        });
    },

    listCategories: function() {
      let config = {
        headers: {
          Token: this.token
        }
      };

      axios
        .get("/category/list", config)
        .then(res => {
          this.categories = res.data;
        })
        .catch(() => {
          self.showSnackbar({
            show: true,
            text: "Server Error",
            color: "red darken-3"
          });
        });
    },

    edit: function(item) {
      this.editedIndex = this.articles.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    /** Change state to Enable or Disable **/
    changeState: function(item) {
      this.editedIndex = this.articles.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogState = true;
    },

    changeStateConfirm: function() {
      let self = this;
      let config = {
        headers: {
          Token: this.token
        }
      };

      if (self.editedItem.state) {
        axios
          .put("/article/disable", self.editedItem, config)
          .then(() => {
            self.showSnackbar({
              show: true,
              text: "Disabled Article",
              color: "red darken-3"
            });
            self.list();
          })
          .catch(() => {
            self.showSnackbar({
              show: true,
              text: "Server Error",
              color: "red lighten-3"
            });
          });
      } else {
        axios
          .put("/article/enable", self.editedItem, config)
          .then(() => {
            self.showSnackbar({
              show: true,
              text: "Enable Article",
              color: "indigo darken-3"
            });
            self.list();
          })
          .catch(() => {
            self.showSnackbar({
              show: true,
              text: "Server Error",
              color: "red darken-3"
            });
          });
      }
      this.closeChangeState();
    },

    close: function() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    closeChangeState: function() {
      this.dialogState = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    save: function() {
      let self = this;
      let config = {
        headers: {
          Token: this.token
        }
      };

      if (self.editedIndex > -1) {
        self.editedItem.state = 1;

        axios
          .put("/article/update", self.editedItem, config)
          .then(() => {
            self.showSnackbar({
              show: true,
              text: "Updated Article",
              color: "orange darken-3"
            });
            self.list();
          })
          .catch(() => {
            self.showSnackbar({
              show: true,
              text: "Server Error",
              color: "red darken-3"
            });
          });
      } else {
        axios
          .post("/article/add", self.editedItem, config)
          .then(() => {
            self.showSnackbar({
              show: true,
              text: "Saved Article",
              color: "indigo darken-3"
            });
            self.list();
          })
          .catch(() => {
            self.showSnackbar({
              show: true,
              text: "Server Error",
              color: "red darken-3"
            });
          });
      }
      this.close();
    },
    generatePDF: function() {
      let self = this;
      self.is_loading_pdf = true;
      let date = new Date().getTime();
      let columns = [
        { title: "Code", dataKey: "code" },
        { title: "Name", dataKey: "name" },
        { title: "Category", dataKey: "category" },
        { title: "Stock", dataKey: "stock" },
        { title: "Sale price", dataKey: "sale_price" }
      ];

      let rows = [];

      self.articles.map(function(item) {
        rows.push({
          code: item.code,
          name: item.name,
          category: item.category.name,
          stock: item.stock,
          sale_price: item.sale_price
        });
      });

      let doc = new jsPDF("p", "pt");
      doc.autoTable(columns, rows, {
        margin: { top: 60 },
        didDrawPage: function() {
          doc.text("List of articles", 40, 30);
        }
      });
      doc.save(`consult-article-${date}.pdf`);
      self.is_loading_pdf = false;
    }
  }
};
</script>
