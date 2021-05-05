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
      :items="entries"
      class="elevation-5"
      :search="search"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Entries</v-toolbar-title>
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
          <v-dialog v-model="dialog_article" max-width="700px">
            <v-card>
              <v-card-title>
                Articles
              </v-card-title>
              <v-card-text>
                <span v-if="error_exist.length" class="red--text">
                  {{ error_exist }}
                </span>
                <v-text-field
                  label="Search"
                  v-model="search_article"
                ></v-text-field>
                <v-data-table
                  :items="articles"
                  :headers="articlesHeaders"
                  :search="search_article"
                >
                  <template v-slot:item.actions="{ item }">
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon
                          small
                          @click="getArticle(item.code)"
                          v-bind="attrs"
                          v-on="on"
                        >
                          mdi-plus
                        </v-icon>
                      </template>
                      <span>Add</span>
                    </v-tooltip>
                  </template>
                </v-data-table>
              </v-card-text>
              <v-card-actions>
                <v-btn
                  color="primary"
                  text
                  @click="
                    dialog_article = false;
                    error_exist = '';
                  "
                >
                  Close
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="dialog" max-width="1000px">
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
                    <v-col cols="12" sm="4" md="4">
                      <v-select
                        v-model="editedItem.voucher_type"
                        label="Voucher type"
                        :items="['TICKET', 'INVOICE', 'GUIDE']"
                        :rules="[rules.required]"
                        :readonly="dialogView"
                      ></v-select>
                    </v-col>
                    <v-col cols="12" sm="4" md="4">
                      <v-text-field
                        v-model="editedItem.voucher_series"
                        :rules="[rules.required, rules.counter]"
                        :readonly="dialogView"
                        label="Voucher series"
                        counter
                        maxlength="999"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="4" md="4">
                      <v-text-field
                        v-model="editedItem.voucher_number"
                        label="Voucher No."
                        counter
                        maxlength="999"
                        :rules="[rules.required, rules.counter]"
                        :readonly="dialogView"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="8" md="8">
                      <v-autocomplete
                        v-model="editedItem.person"
                        :items="vendors"
                        item-text="name"
                        item-value="_id"
                        label="Vendor"
                        placeholder="Start typing to Search"
                        :rules="[rules.required]"
                        :readonly="dialogView"
                      ></v-autocomplete>
                    </v-col>
                    <v-col cols="12" sm="4" md="4">
                      <v-text-field
                        v-model.number="editedItem.tax"
                        label="Tax"
                        counter
                        maxlength="5"
                        :rules="[rules.required_number]"
                        :readonly="dialogView"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="8" md="8">
                      <v-text-field
                        v-model="editedItem.code"
                        label="Article Code"
                        v-if="!dialogView"
                      ></v-text-field>
                      <span v-if="error_exist.length" class="red--text">
                        {{ error_exist }}
                      </span>
                    </v-col>
                    <v-col cols="12" sm="4" md="4">
                      <v-btn
                        color="light-blue"
                        class="white--text"
                        width="49%"
                        @click="getArticle(editedItem.code)"
                        v-if="!dialogView"
                      >
                        Get article
                      </v-btn>
                      &nbsp; &nbsp;
                      <v-btn
                        color="info darken-4"
                        class="white--text"
                        width="49%"
                        @click="
                          dialog_article = true;
                          error_exist = '';
                        "
                        v-if="!dialogView"
                      >
                        Show all
                      </v-btn>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-data-table
                        :headers="detailsHeaders"
                        :items="editedItem.details"
                      >
                        <template v-slot:item.amount="{ item }">
                          <v-text-field
                            v-model.number="item.amount"
                            placeholder="Amount"
                            :readonly="dialogView"
                          ></v-text-field>
                        </template>
                        <template v-slot:item.price="{ item }">
                          <v-text-field
                            v-model.number="item.price"
                            placeholder="Amount"
                            :readonly="dialogView"
                          ></v-text-field>
                        </template>
                        <template v-slot:item.sub_total="{ item }">
                          <span>
                            ${{ (item.sub_total = item.price * item.amount) }}
                          </span>
                        </template>
                        <template v-slot:item.actions="{ item }">
                          <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                              <v-icon
                                small
                                @click="removeArticle(item)"
                                v-bind="attrs"
                                v-on="on"
                                :disabled="dialogView"
                              >
                                mdi-delete
                              </v-icon>
                            </template>
                            <span>Remove</span>
                          </v-tooltip>
                        </template>
                      </v-data-table>
                    </v-col>
                    <v-col cols="12" sm="12" md="12" align="right">
                      <div>
                        <b>Subtotal: </b>
                        ${{
                          dialogView
                            ? (
                                editedItem.total -
                                (editedItem.total * editedItem.tax) /
                                  (1 + editedItem.tax)
                              ).toFixed(2)
                            : (
                                total -
                                (total * editedItem.tax) / (1 + editedItem.tax)
                              ).toFixed(2)
                        }}
                      </div>
                      <div>
                        <b>Tax:</b>
                        ${{
                          dialogView
                            ? (
                                (editedItem.total * editedItem.tax) /
                                (1 + editedItem.tax)
                              ).toFixed(2)
                            : (
                                (total * editedItem.tax) /
                                (1 + editedItem.tax)
                              ).toFixed(2)
                        }}
                      </div>
                      <div>
                        <hr />
                        <b>Net total: </b>
                        <span class="body-1">
                          ${{ dialogView ? editedItem.total : total }}
                        </span>
                      </div>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="red darken-1" text @click="close">
                  {{ !dialogView ? "Cancel" : "Close" }}
                </v-btn>
                <v-btn
                  color="indigo darken-1"
                  text
                  @click="save"
                  :disabled="isInvalid"
                  v-if="!dialogView"
                >
                  Save
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="dialogState" max-width="500px">
            <v-card>
              <v-card-title class="headline flex justify-center">
                {{ dialogStateTitle }} this entry?
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
          {{ item.state ? "Approved" : "Cancelled" }}
        </span>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-icon small @click="edit(item)" v-bind="attrs" v-on="on">
              mdi-eye
            </v-icon>
          </template>
          <span>View details</span>
        </v-tooltip>
        &nbsp;
        <v-tooltip bottom v-if="item.state">
          <template v-slot:activator="{ on, attrs }">
            <v-icon small @click="changeState(item)" v-bind="attrs" v-on="on">
              mdi-cancel
            </v-icon>
          </template>
          <span>Cancel</span>
        </v-tooltip>

        <v-tooltip bottom v-else>
          <template v-slot:activator="{ on, attrs }">
            <v-icon small @click="changeState(item)" v-bind="attrs" v-on="on">
              mdi-check
            </v-icon>
          </template>
          <span>Approve</span>
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

export default {
  name: "Entry",
  data: () => ({
    search: "",
    dialog: false,
    dialogState: false,
    error_exist: "",
    dialog_article: false,
    vendors: [],
    articles: [],
    search_input: "",
    search_article: "",
    snackbar: {
      show: false,
      text: "",
      color: ""
    },
    rules: {
      required: value => !!value || "Required field",
      required_number: value => parseFloat(value) >= 0 || "Required field",
      counter: value => value.length <= 999 || "Maximum 999 characters"
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
        text: "User",
        align: "left",
        sortable: true,
        value: "user.name"
      },
      {
        text: "Vendor",
        align: "left",
        sortable: true,
        value: "person.name"
      },
      {
        text: "Voucher type",
        align: "left",
        sortable: true,
        value: "voucher_type"
      },
      {
        text: "Voucher series",
        align: "left",
        sortable: true,
        value: "voucher_series"
      },
      {
        text: "Voucher No.",
        align: "left",
        sortable: true,
        value: "voucher_number"
      },
      {
        text: "Tax",
        align: "left",
        sortable: true,
        value: "tax"
      },
      {
        text: "Total",
        align: "left",
        sortable: true,
        value: "total"
      },
      {
        text: "State",
        align: "center",
        sortable: true,
        value: "state",
        width: "10%"
      }
    ],
    detailsHeaders: [
      {
        text: "Actions",
        value: "actions",
        sortable: false,
        align: "center",
        width: "15%"
      },
      {
        text: "Article",
        align: "left",
        sortable: true,
        value: "article"
      },
      {
        text: "Amount",
        align: "left",
        sortable: true,
        value: "amount",
        width: "20%"
      },
      {
        text: "Price",
        align: "left",
        sortable: true,
        value: "price",
        width: "20%"
      },
      {
        text: "Sub total",
        align: "center",
        sortable: true,
        value: "sub_total",
        width: "15%"
      }
    ],

    articlesHeaders: [
      {
        text: "Actions",
        value: "actions",
        sortable: false,
        align: "center",
        width: "5%"
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
        align: "center",
        sortable: true,
        value: "stock",
        width: "12%"
      },
      {
        text: "Sale price",
        align: "center",
        sortable: true,
        value: "sale_price",
        width: "15%"
      }
    ],
    entries: [],
    editedIndex: -1,
    editedItem: {
      voucher_number: "",
      voucher_type: "",
      voucher_series: "",
      person: "",
      details: [],
      tax: 0,
      total: 0,
      state: 1
    },
    defaultItem: {
      voucher_number: "",
      voucher_type: "",
      voucher_series: "",
      person: "",
      details: [],
      tax: 0,
      total: 0,
      state: 1
    }
  }),

  computed: {
    ...mapState(["token", "user"]),
    formTitle: function() {
      return this.editedIndex === -1 ? "New Entry" : "Edit Entry";
    },
    dialogStateTitle: function() {
      return this.editedItem.state ? "Reject" : "Approve";
    },
    dialogView: function() {
      return this.editedIndex === -1 ? false : true;
    },
    isInvalid: function() {
      let self = this;

      if (
        self.editedItem.voucher_type.length > 0 &&
        self.editedItem.voucher_series.length > 0 &&
        self.editedItem.voucher_number.length > 0 &&
        self.editedItem.tax >= 0 &&
        self.editedItem.person.length > 0 &&
        self.editedItem.details.length > 0
      ) {
        return false;
      } else {
        return true;
      }
    },
    total: function() {
      let obj_entry = this.editedItem.details.map(item => item.sub_total);
      let total = obj_entry.reduce((x, y) => x + y, 0);

      return total;
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
    this.listVendors();
    this.listArticles();
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
        .get("/purchases/entry/list", config)
        .then(res => {
          this.entries = res.data;
        })
        .catch(() => {
          this.showSnackbar({
            show: true,
            text: "Server Error",
            color: "red darken-3"
          });
        });
    },
    listArticles: function() {
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
    listVendors: function() {
      let config = {
        headers: {
          Token: this.token
        }
      };

      axios
        .get("/person/list?type=Client", config)
        .then(res => {
          this.vendors = res.data;
        })
        .catch(() => {
          self.showSnackbar({
            show: true,
            text: "Server Error",
            color: "red darken-3"
          });
        });
    },
    getArticle: function(code) {
      let self = this;
      let config = {
        headers: {
          Token: this.token
        }
      };

      axios
        .get(`/article/search?code=${code}`, config)
        .then(res => {
          let new_article = {
            _id: res.data._id,
            article: res.data.name,
            amount: 0,
            price: res.data.sale_price,
            sub_total: 0
          };

          let exist = !!self.editedItem.details.find(
            item => new_article._id == item._id
          );

          if (!exist) {
            self.editedItem.details.push(new_article);
            self.error_exist = "";
            self.editedItem.code = "";
            code = "";
          } else {
            self.error_exist = "This article has already been added";
          }
        })
        .catch(error => {
          if (error.response.status === 404) {
            self.error_exist = "This article does not exist";
          }
          self.showSnackbar({
            show: true,
            text: "Server Error",
            color: "red darken-3"
          });
        });
    },

    edit: function(item) {
      this.editedIndex = this.entries.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    /** Change state to Enable or Disable **/
    changeState: function(item) {
      this.editedIndex = this.entries.indexOf(item);
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
          .put("/purchases/entry/cancel", self.editedItem, config)
          .then(() => {
            self.showSnackbar({
              show: true,
              text: "Cancelled Entry",
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
          .put("/purchases/entry/approve", self.editedItem, config)
          .then(() => {
            self.showSnackbar({
              show: true,
              text: "Approved Entry",
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

    removeArticle: function(item) {
      let index = this.editedItem.details.indexOf(item);
      this.editedItem.details.splice(index);
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

      self.editedItem.user = self.user._id;
      self.editedItem.total = self.total;

      axios
        .post("/purchases/entry/add", self.editedItem, config)
        .then(() => {
          self.showSnackbar({
            show: true,
            text: "Saved Entry",
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
      this.close();
    }
  }
};
</script>
