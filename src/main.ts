// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import "@babel/polyfill";
import "whatwg-fetch";

import "./hack";
import "./class-component-hooks";

import Vue from "vue";
import VueRouter from "vue-router";
import { sync } from "vuex-router-sync";

import App from "./App.vue";
import router from "./router";
import store from "./store/index";

Vue.use(VueRouter);
sync(store, router);
Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: "#app",
  router,
  store,
  components: { App },
  template: "<App/>"
});
