<template>
  <div>
    <v-row class="text-center" align="center" justify="center">
      <v-col cols="12" sm="6" md="6">
        <v-menu
          ref="menu"
          v-model="menu"
          :close-on-content-click="false"
          :return-value.sync="dates"
          transition="scale-transition"
          offset-y
          min-width="auto"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              v-model="dateRangeText"
              label="Select the start date and end date to search for sales"
              prepend-icon="mdi-calendar"
              readonly
              v-bind="attrs"
              v-on="on"
              color="indigo"
            ></v-text-field>
          </template>
          <v-date-picker
            v-model="dates"
            color="indigo"
            no-title
            scrollable
            range
            :max="nowDate"
          >
            <v-spacer></v-spacer>
            <v-btn text color="red" @click="menu = false">
              Cancel
            </v-btn>
            <v-btn text color="indigo" @click="$refs.menu.save(dates)">
              OK
            </v-btn>
          </v-date-picker>
        </v-menu>
      </v-col>
      <v-col cols="12" sm="4" md="4">
        <v-btn @click="clean()" class="mr-2" v-if="show_clean">
          <v-icon>mdi-close-circle</v-icon>
        </v-btn>
        <v-btn color="indigo" class="white--text" @click="list()">
          Get Information
        </v-btn>
      </v-col>
    </v-row>
    <v-data-table
      :headers="headers"
      :items="entries"
      class="elevation-5"
      :search="search"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Sales</v-toolbar-title>
          <v-divider class="mx-4" inset vertical></v-divider>
          <v-spacer></v-spacer>
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Search"
            single-line
            hide-details
            width="10%"
          />
          <v-dialog v-model="dialog" max-width="1000px">
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
                        readonly
                      ></v-select>
                    </v-col>
                    <v-col cols="12" sm="4" md="4">
                      <v-text-field
                        v-model="editedItem.voucher_series"
                        readonly
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
                        readonly
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="8" md="8">
                      <v-autocomplete
                        v-model="editedItem.person"
                        :items="clients"
                        item-text="name"
                        item-value="_id"
                        label="Client"
                        readonly
                      ></v-autocomplete>
                    </v-col>
                    <v-col cols="12" sm="4" md="4">
                      <v-text-field
                        v-model.number="editedItem.tax"
                        label="Tax"
                        counter
                        maxlength="5"
                        :rules="[rules.required_number]"
                        readonly
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-data-table
                        :headers="detailsHeaders"
                        :items="editedItem.details"
                      >
                        <template v-slot:item.sub_total="{ item }">
                          <span>
                            ${{ (item.sub_total = (item.price * item.amount) - item.discount) }}
                          </span>
                        </template>
                      </v-data-table>
                    </v-col>
                    <v-col cols="12" sm="12" md="12" align="right">
                      <div>
                        <b>Subtotal: </b>
                        ${{
                          (
                            editedItem.total -
                            (editedItem.total * editedItem.tax) /
                              (1 + editedItem.tax)
                          ).toFixed(2)
                        }}
                      </div>
                      <div>
                        <b>Tax:</b>
                        ${{
                          (
                            (editedItem.total * editedItem.tax) /
                            (1 + editedItem.tax)
                          ).toFixed(2)
                        }}
                      </div>
                      <div>
                        <hr />
                        <b>Net total: </b>
                        <span class="body-1"> ${{ editedItem.total }} </span>
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
      </template>
    </v-data-table>
  </div>
</template>

<script>
import { mapState } from "vuex";
import axios from "axios";

export default {
  name: "Sales",
  data: () => ({
    dates: ["", ""],
    nowDate: new Date().toISOString().slice(0, 10),
    menu: false,
    show_clean: false,
    search: "",
    dialog: false,
    dialogState: false,
    error_exist: "",
    dialog_article: false,
    clients: [],
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
        text: "Discount",
        align: "left",
        sortable: true,
        value: "discount",
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
    dateRangeText: function() {
      return this.dates.join(" - ");
    },
    formTitle: function() {
      return this.editedIndex === -1 ? "" : "View Entry";
    },
    dialogView: function() {
      return this.editedIndex === -1 ? false : true;
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
    this.show_clean = false;
    this.listVendors();
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
        .post(
          "/sales/sale/search-between-dates",
          { start: this.dates[0], end: this.dates[1] },
          config
        )
        .then(res => {
          this.entries = res.data;
          this.show_clean = true;
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
          this.clients = res.data;
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
      this.editedIndex = this.entries.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    close: function() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    clean: function() {
      this.entries = [];
      this.dates = [];
      this.show_clean = false;
    }
  }
};
</script>
