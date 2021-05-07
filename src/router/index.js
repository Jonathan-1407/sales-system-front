import Vue from "vue";
import VueRouter from "vue-router";
import store from "../store";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Login",
    component: () => import("../views/Auth/Login.vue"),
    meta: {
      visitor: true
    }
  },
  {
    path: "/home",
    name: "Home",
    component: () => import("../views/Home.vue"),
    meta: {
      administrator: true,
      grocer: true,
      seller: true
    }
  },
  {
    path: "/categories",
    name: "Category",
    component: () => import("../views/Warehouse/Category.vue"),
    meta: {
      administrator: true,
      grocer: true
    }
  },
  {
    path: "/articles",
    name: "Article",
    component: () => import("../views/Warehouse/Article.vue"),
    meta: {
      administrator: true,
      grocer: true
    }
  },
  {
    path: "/entries",
    name: "Entry",
    component: () => import("../views/Purchases/Entry.vue"),
    meta: {
      administrator: true,
      grocer: true
    }
  },
  {
    path: "/vendors",
    name: "Vendor",
    component: () => import("../views/Purchases/Vendor.vue"),
    meta: {
      administrator: true,
      grocer: true
    }
  },
  {
    path: "/sales",
    name: "Sale",
    component: () => import("../views/Sales/Sale.vue"),
    meta: {
      administrator: true,
      seller: true
    }
  },
  {
    path: "/clients",
    name: "Client",
    component: () => import("../views/Sales/Client.vue"),
    meta: {
      administrator: true,
      seller: true
    }
  },
  {
    path: "/users",
    name: "User",
    component: () => import("../views/Access/User.vue"),
    meta: {
      administrator: true
    }
  },
  {
    path: "/consult-purchases",
    name: "Purchases",
    component: () => import("../views/Consult/Purchases.vue"),
    meta: {
      administrator: true,
      grocer: true,
      seller: true
    }
  },
  {
    path: "/consult-sales",
    name: "Sales",
    component: () => import("../views/Consult/Sales.vue"),
    meta: {
      administrator: true,
      grocer: true,
      seller: true
    }
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.visitor)) {
    next();
  } else if (store.state.user && store.state.user.role == "Administrator") {
    if (to.matched.some(record => record.meta.administrator)) {
      next();
    }
  } else if (store.state.user && store.state.user.role == "Grocer") {
    if (to.matched.some(record => record.meta.grocer)) {
      next();
    }
  } else if (store.state.user && store.state.user.role == "Seller") {
    if (to.matched.some(record => record.meta.seller)) {
      next();
    }
  } else {
    next({ name: "Login" });
  }
});

export default router;
