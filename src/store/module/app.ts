import { getStoreAccessors } from "vuex-typescript";

import { AppState, State } from "@/store/state";

const state: () => AppState = () => ({
  sidebar: false,
  showDisabled: false
});

const appModule = {
  namespaced: true,
  state,
  getters: {
    sideBar(s: AppState) {
      return s.sidebar;
    },
    showDisabled(s: AppState) {
      return s.showDisabled;
    }
  },
  mutations: {
    changeSideBar(s: AppState, f: boolean) {
      s.sidebar = f;
    },
    setShowDisabled(s: AppState, f: boolean) {
      s.showDisabled = f;
    }
  }
};

const { commit, read } = getStoreAccessors<AppState, State>("app");

const plug = {
  commit: {
    changeSideBar: commit(appModule.mutations.changeSideBar),
    setShowDisabled: commit(appModule.mutations.setShowDisabled)
  },
  read: {
    sideBar: read(appModule.getters.sideBar),
    showDisabled: read(appModule.getters.showDisabled)
  }
};

export default appModule;
export { plug };
