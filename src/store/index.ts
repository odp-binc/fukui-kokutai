import Vue from "vue";
import Vuex from "vuex";
import { createStore } from "./store";

Vue.use(Vuex);
const store = createStore();

export default store;
