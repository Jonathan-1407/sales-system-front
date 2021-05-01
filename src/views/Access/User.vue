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
      :items="users"
      sort-by="calories"
      class="elevation-5"
      :search="search"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Users</v-toolbar-title>
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
                    <v-col cols="12" sm="12" md="4">
                      <v-select
                        v-model="editedItem.role"
                        :items="roles"
                        label="Role"
                        :rules="[rules.required, rules.counter]"
                      ></v-select>
                    </v-col>

                    <v-col cols="12" sm="12" md="8">
                      <v-text-field
                        v-model="editedItem.name"
                        label="Name"
                        :rules="[rules.required, rules.counter]"
                        counter
                        maxlength="30"
                      ></v-text-field>
                    </v-col>

                    <v-col cols="12" sm="12" md="12">
                      <v-text-field
                        v-model="editedItem.address"
                        label="Address"
                        :rules="[rules.required, rules.counter]"
                        counter
                        maxlength="100"
                      ></v-text-field>
                    </v-col>

                    <v-col cols="12" sm="12" md="6">
                      <v-text-field
                        v-model="editedItem.phone"
                        label="Phone"
                        :rules="[rules.required, rules.counter]"
                        counter
                        maxlength="8"
                      ></v-text-field>
                    </v-col>

                    <v-col cols="12" sm="12" md="6">
                      <v-text-field
                        v-model="editedItem.email"
                        label="Email"
                        :rules="[rules.required, rules.counter, rules.email]"
                        counter
                        maxlength="30"
                      ></v-text-field>
                    </v-col>

                    <v-col cols="12" sm="12" md="12">
                      <v-text-field
                        v-model="editedItem._password"
                        label="Password"
                        :rules="[rules.counter]"
                        counter
                        maxlength="20"
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
                {{ dialogStateTitle }} this user?
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
  name: "User",
  data: () => ({
    search: "",
    dialog: false,
    dialogState: false,
    snackbar: {
      show: false,
      text: "",
      color: ""
    },
    roles: ["Seller", "Grocer", "Administrator"],
    rules: {
      required: value => !!value || "Required field",
      counter: value => value.length <= 60 || "Maximum 60 characters",
      email: value =>
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
        "Email must be valid"
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
        text: "Role",
        align: "left",
        sortable: true,
        value: "role"
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
        text: "Email",
        align: "left",
        sortable: true,
        value: "email"
      },
      {
        text: "State",
        align: "center",
        sortable: true,
        value: "state",
        width: "15%"
      }
    ],
    users: [],
    editedIndex: -1,
    editedItem: {
      role: "",
      name: "",
      address: "",
      phone: "",
      email: "",
      state: 1
    },
    defaultItem: {
      role: "",
      name: "",
      address: "",
      phone: "",
      email: "",
      state: 1
    }
  }),

  computed: {
    ...mapState(["token"]),
    formTitle: function() {
      return this.editedIndex === -1 ? "New User" : "Edit User";
    },
    dialogStateTitle: function() {
      return this.editedItem.state ? "Disable" : "Enable";
    },
    isInvalid: function() {
      let self = this;
      if (
        self.editedItem.role.length > 0 &&
        self.editedItem.name.length > 0 &&
        (self.editedItem.address.length > 0) &
          (self.editedItem.phone.length > 0) &&
        self.editedItem.email.length > 0
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
        .get("/user/list", config)
        .then(res => {
          this.users = res.data;
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
      this.editedIndex = this.users.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    /** Change state to Enable or Disable **/
    changeState: function(item) {
      this.editedIndex = this.users.indexOf(item);
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
          .put("/user/disable", self.editedItem, config)
          .then(() => {
            self.showSnackbar({
              show: true,
              text: "Disabled Category",
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
          .put("/user/enable", self.editedItem, config)
          .then(() => {
            self.showSnackbar({
              show: true,
              text: "Enable Category",
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
        if (self.editedItem._password) {
          self.editedItem.password = self.editedItem._password;
        }

        axios
          .put("/user/update", self.editedItem, config)
          .then(() => {
            self.showSnackbar({
              show: true,
              text: "Updated User",
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
        self.editedItem.password = self.editedItem._password;
        axios
          .post("/user/add", self.editedItem, config)
          .then(() => {
            self.showSnackbar({
              show: true,
              text: "Saved Category",
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
