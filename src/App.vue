<template>
  <v-app id="inspire">
    <v-app id="inspire">
      <v-navigation-drawer
        v-model="drawer"
        app
        :clipped="$vuetify.breakpoint.lgAndUp"
      >
        <v-list dense>
          <template v-for="item in items">
            <v-list-group
              v-if="item.children"
              :key="item.text"
              :prepend-icon="item.model ? item.icon : item['icon-alt']"
              append-icon=""
            >
              <template v-slot:activator>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ item.text }}
                  </v-list-item-title>
                </v-list-item-content>
              </template>
              <v-list-item
                v-for="(child, i) in item.children"
                :key="i"
                :to="child.path"
                active-class="primary--text"
                link
              >
                <v-list-item-action v-if="child.icon">
                  <v-icon>{{ child.icon }}</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ child.text }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-group>
            <v-list-item
              v-else
              :key="item.text"
              link
              :to="item.path"
              active-class="primary--text"
            >
              <v-list-item-action>
                <v-icon>{{ item.icon }}</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>
                  {{ item.text }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </template>
        </v-list>
      </v-navigation-drawer>

      <v-app-bar
        app
        color="indigo"
        dark
        :clipped-left="$vuetify.breakpoint.lgAndUp"
      >
        <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
        <v-toolbar-title>Sales System</v-toolbar-title>
        <v-spacer></v-spacer>

        <v-btn icon @click="logout()">
          <v-icon>mdi-export</v-icon>
        </v-btn>
      </v-app-bar>

      <v-main>
        <v-container class="fill-height" fluid>
          <v-row align="center" justify="center">
            <v-col class="text-center">
              <router-view></router-view>
            </v-col>
          </v-row>
        </v-container>
      </v-main>
      <v-footer color="indigo" app>
        <span class="white--text">
          Jonathan Cua &copy; {{ new Date().getFullYear() }}
        </span>
      </v-footer>
    </v-app>
  </v-app>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "App",

  data: () => ({
    drawer: null,
    items: [
      { icon: "mdi-home", text: "Home", path: "/" },
      {
        icon: "mdi-chevron-up",
        "icon-alt": "mdi-chevron-down",
        text: "Warehouse",
        children: [
          { icon: "mdi-shape", text: "Categories", path: "/categories" },
          { icon: "mdi-archive", text: "Articles", path: "/articles" }
        ]
      },
      {
        icon: "mdi-chevron-up",
        "icon-alt": "mdi-chevron-down",
        text: "Purchases",
        children: [
          { icon: "mdi-arrow-left-thick", text: "Entries", path: "/entries" },
          { icon: "mdi-account-supervisor", text: "Vendors", path: "/vendors" }
        ]
      },
      {
        icon: "mdi-chevron-up",
        "icon-alt": "mdi-chevron-down",
        text: "Sales",
        children: [
          { icon: "mdi-arrow-right-thick", text: "Sales", path: "/sales" },
          { icon: "mdi-account-supervisor", text: "Clients", path: "/clients" }
        ]
      },
      {
        icon: "mdi-chevron-up",
        "icon-alt": "mdi-chevron-down",
        text: "Access",
        children: [
          { icon: "mdi-account-supervisor", text: "Users", path: "/users" }
        ]
      },
      {
        icon: "mdi-chevron-up",
        "icon-alt": "mdi-chevron-down",
        text: "Consult",
        children: [
          {
            icon: "mdi-arrow-left-thick",
            text: "Purchases",
            path: "/purchases"
          },
          { icon: "mdi-arrow-right-thick", text: "Sales", path: "/sales" }
        ]
      }
    ]
  }),
  methods: {
    ...mapActions(["autoLogin", "logout"])
  },
  created: function() {
    this.autoLogin();
  }
};
</script>
