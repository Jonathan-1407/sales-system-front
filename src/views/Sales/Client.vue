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
      :items="categories"
      sort-by="calories"
      class="elevation-5"
      :search="search"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Client</v-toolbar-title>
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
                    <v-col cols="12" sm="4" md="4">
                      <v-text-field
                        v-model="editedItem.document_type"
                        label="Document Type"
                        :rules="[rules.required, rules.counter]"
                        counter
                        maxlength="30"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="8" md="8">
                      <v-text-field
                        v-model="editedItem.document_number"
                        label="Document No."
                        :rules="[rules.required, rules.counter]"
                        counter
                        maxlength="30"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-text-field
                        v-model="editedItem.name"
                        label="Name"
                        :rules="[rules.required, rules.counter]"
                        counter
                        maxlength="30"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="6">
                      <v-text-field
                        v-model="editedItem.email"
                        label="Email"
                        :rules="[rules.required, rules.counter]"
                        counter
                        maxlength="30"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="6">
                      <v-text-field
                        v-model="editedItem.phone"
                        label="Phone"
                        :rules="[rules.required, rules.counter]"
                        counter
                        maxlength="30"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-text-field
                        v-model="editedItem.address"
                        label="Address"
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
                {{ dialogStateTitle }} this client?
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

export default {
  name: "Client",
  data: () => ({
    search: "",
    dialog: false,
    dialogState: false,
    snackbar: {
      show: false,
      text: "",
      color: ""
    },
    rules: {
      required: value => !!value || "Required field",
      counter: value => value.length <= 30 || "Maximum 30 characters"
    },
    headers: [
      {
        text: "Actions",
        value: "actions",
        sortable: false,
        align: "center",
        width: "10%"
      },
      {
        text: "Name",
        align: "left",
        sortable: true,
        value: "name"
      },
      {
        text: "Document Type",
        align: "left",
        sortable: true,
        value: "document_type"
      },
      {
        text: "Document No.",
        align: "left",
        sortable: true,
        value: "document_number"
      },
      {
        text: "Email",
        align: "left",
        sortable: true,
        value: "email"
      },
      {
        text: "Address",
        align: "left",
        sortable: true,
        value: "address"
      },
      {
        text: "Phone",
        align: "left",
        sortable: true,
        value: "phone"
      },
      {
        text: "State",
        align: "center",
        sortable: true,
        value: "state",
        width: "15%"
      }
    ],
    categories: [],
    editedIndex: -1,
    editedItem: {
      name: "",
      document_type: "Client",
      state: 1
    },
    defaultItem: {
      name: "",
      document_type: "DUI",
      person_type: "Client",
      state: 1
    }
  }),

  computed: {
    ...mapState(["token"]),
    formTitle: function() {
      return this.editedIndex === -1 ? "New Client" : "Edit Client";
    },
    dialogStateTitle: function() {
      return this.editedItem.state ? "Disable" : "Enable";
    },
    isInvalid: function() {
      return this.editedItem.name.length > 0 ? false : true;
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
        .get("/person/list?type=Client", config)
        .then(res => {
          this.categories = res.data;
          console.log(res.data);
        })
        .catch(() => {
          this.showSnackbar({
            show: true,
            text: "Server Error",
            color: "red darken-3"
          });
        });
    },

    edit: function(item) {
      this.editedIndex = this.categories.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    /** Change state to Enable or Disable **/
    changeState: function(item) {
      this.editedIndex = this.categories.indexOf(item);
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
          .put("/person/disable", self.editedItem, config)
          .then(() => {
            self.showSnackbar({
              show: true,
              text: "Disabled Client",
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
          .put("/person/enable", self.editedItem, config)
          .then(() => {
            self.showSnackbar({
              show: true,
              text: "Enable Client",
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
          .put("/person/update", self.editedItem, config)
          .then(() => {
            self.showSnackbar({
              show: true,
              text: "Updated Client",
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
          .post("/person/add", self.editedItem, config)
          .then(() => {
            self.showSnackbar({
              show: true,
              text: "Saved Client",
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
    }
  }
};
</script>
