import Vue from "vue";
import Vuex from "vuex";
import decode from "jwt-decode";
import router from "../router";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    token: "",
    user: {},
    loggedIn: false
  },
  mutations: {
    SET_TOKEN: function(state, token) {
      state.token = token;
    },
    SET_USER: function(state, user) {
      state.user = user;
      state.loggedIn = Boolean(user);
    }
  },
  actions: {
    saveToken: function({ commit }, token) {
      commit("SET_TOKEN", token);
      commit("SET_USER", decode(token));
      localStorage.setItem("token", token);
    },
    autoLogin: function({ commit }) {
      let token = localStorage.getItem("token");

      if (token) {
        commit("SET_TOKEN", token);
        commit("SET_USER", decode(token));
      }

      router.push({ name: "Home" });
    },
    logout: function({ commit }) {
      commit("SET_TOKEN", null);
      commit("SET_USER", null);
      localStorage.removeItem("token");
      router.push({ name: "Login" });
    }
  },
  getters: {
    isLoggedIn: state => state.loggedIn
  },
  modules: {}
});
