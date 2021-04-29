<template>
  <div class="login">
    <v-container>
      <v-layout>
        <v-flex sm12 md12 lg12 xl12>
          <v-card
            max-width="450"
            class="mx-auto mt-5 justify-center"
            elevation="8"
          >
            <v-form @submit.prevent="login()">
              <v-app-bar color="indigo" class="white--text">
                <v-spacer></v-spacer>
                <h3>
                  Sales Sytem
                  {{ $store.state.user }}
                </h3>
                <v-spacer></v-spacer>
              </v-app-bar>
              <v-card-text>
                <span v-if="error" class="red--text">{{ error }}</span>
                <v-text-field
                  color="indigo"
                  type="text"
                  label="Email"
                  prepend-icon="mdi-email"
                  :rules="[rules.required, rules.counter, email]"
                  v-model="email"
                  counter
                  maxlength="30"
                />
                <v-text-field
                  color="indigo"
                  :type="show_password ? 'text' : 'password'"
                  label="Password"
                  prepend-icon="mdi-lock"
                  :append-icon="show_password ? 'mdi-eye' : 'mdi-eye-off'"
                  @click:append="show_password = !show_password"
                  :rules="[rules.required, rules.counter]"
                  v-model="password"
                  counter
                  maxlength="20"
                />
                <div class="text-center error--text">
                  <span v-text="error.message"></span>
                </div>
              </v-card-text>
              <v-divider></v-divider>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="indigo"
                  class="white--text"
                  type="submit"
                  :loading="loading"
                >
                  Login
                </v-btn>
                {{ isLoggedIn }}
              </v-card-actions>
            </v-form>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
    <v-snackbar
      transition="slide-x-reverse-transition"
      elevation="15"
      :timeout="3000"
      v-model="alert"
      absolute
      top
      color="error"
      right
      text
    >
      <v-icon class="red--text">mdi-alert-circle-outline</v-icon>
      Lo sentimos ha ocurrido un error.
      <template v-slot:action="{ attrs }">
        <v-icon text v-bind="attrs" @click="alert = false">
          mdi-close-circle
        </v-icon>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import axios from "axios";

export default {
  name: "Login",
  data: () => ({
    show_password: false,
    email: "jon@email.com",
    password: "hola1234",
    rules: {
      required: value => !!value || "Required field",
      counter: value => value.length <= 30 || "Maximum 30 characters",
      email: value =>
        !!value ||
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
        "E-mail must be valid"
    },
    alert: false,
    loading: false,
    error: ""
  }),
  computed: {
    ...mapGetters(["isLoggedIn"])
  },
  methods: {
    ...mapActions(["saveToken"]),
    login: function() {
      let self = this;
      self.loading = true;

      axios
        .post("/user/login", {
          email: self.email,
          password: self.password
        })
        .then(response => {
          return response.data;
        })
        .then(data => {
          self.loading = false;
          self.saveToken(data._token);
        })
        .catch(error => {
          self.error = "These credentials do not match our records";

          if (error.response.status >= 500) {
            self.error = error.response.data;
          }
          self.loading = false;
        });
    }
  }
};
</script>
