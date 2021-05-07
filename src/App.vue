<template>
  <v-app id="inspire">
    <v-navigation-drawer
      v-model="drawer"
      app
      :clipped="$vuetify.breakpoint.lgAndUp"
      v-if="isLoggedIn"
    >
      <v-list dense>
        <template v-for="item in items">
          <v-list-group
            v-if="
              ((item.access.administrator === true, isAdministrator === true) ||
                (item.access.grocer === true && isGrocer === true) ||
                (item.access.seller === true && isSeller === true)) &&
                item.children
            "
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
            v-if="
              ((item.access.administrator === true, isAdministrator === true) ||
                (item.access.grocer === true && isGrocer === true) ||
                (item.access.seller === true && isSeller === true)) &&
                !item.children
            "
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
      v-if="isLoggedIn"
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
            <transition name="fade" mode="out-in">
              <router-view></router-view>
            </transition>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
    <v-footer
      color="indigo"
      app
      v-if="isLoggedIn"
      inset
      class="flex justify-center"
    >
      <span class="white--text">
        Jonathan Cua &copy; {{ new Date().getFullYear() }}
      </span>
    </v-footer>
  </v-app>
</template>

<script>
import { mapActions, mapState, mapGetters } from "vuex";

export default {
  name: "App",

  data: () => ({
    drawer: null,
    items: [
      {
        icon: "mdi-home",
        text: "Home",
        path: "/home",
        access: {
          administrator: true,
          grocer: true,
          seller: true
        }
      },
      {
        icon: "mdi-chevron-up",
        "icon-alt": "mdi-chevron-down",
        text: "Warehouse",
        children: [
          { icon: "mdi-shape", text: "Categories", path: "/categories" },
          { icon: "mdi-archive", text: "Articles", path: "/articles" }
        ],
        access: {
          administrator: true,
          grocer: true,
          seller: false
        }
      },
      {
        icon: "mdi-chevron-up",
        "icon-alt": "mdi-chevron-down",
        text: "Purchases",
        children: [
          { icon: "mdi-arrow-left-thick", text: "Entries", path: "/entries" },
          { icon: "mdi-account-supervisor", text: "Vendors", path: "/vendors" }
        ],
        access: {
          administrator: true,
          grocer: true,
          seller: false
        }
      },
      {
        icon: "mdi-chevron-up",
        "icon-alt": "mdi-chevron-down",
        text: "Sales",
        children: [
          { icon: "mdi-arrow-right-thick", text: "Sales", path: "/sales" },
          { icon: "mdi-account-supervisor", text: "Clients", path: "/clients" }
        ],
        access: {
          administrator: true,
          grocer: false,
          seller: true
        }
      },
      {
        icon: "mdi-chevron-up",
        "icon-alt": "mdi-chevron-down",
        text: "Access",
        children: [
          { icon: "mdi-account-supervisor", text: "Users", path: "/users" }
        ],
        access: {
          administrator: true,
          grocer: false,
          seller: false
        }
      },
      {
        icon: "mdi-chevron-up",
        "icon-alt": "mdi-chevron-down",
        text: "Consult",
        children: [
          {
            icon: "mdi-arrow-left-thick",
            text: "Purchases",
            path: "/consult-purchases"
          },
          { icon: "mdi-arrow-right-thick", text: "Sales", path: "/consult-sales" }
        ],
        access: {
          administrator: true,
          grocer: true,
          seller: true
        }
      }
    ]
  }),
  computed: {
    ...mapGetters(["isLoggedIn"]),
    ...mapState(["user"]),
    isAdministrator: function() {
      let self = this;

      return self.user && self.user.role == "Administrator";
    },
    isGrocer: function() {
      let self = this;

      return self.user && self.user.role == "Grocer";
    },
    isSeller: function() {
      let self = this;

      return self.user && self.user.role == "Seller";
    }
  },
  methods: {
    ...mapActions(["autoLogin", "logout"])
  },
  created: function() {
    this.autoLogin();
  }
};
</script>
<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
