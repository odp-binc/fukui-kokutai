import { ActionContext } from "vuex";
import { getStoreAccessors } from "vuex-typescript";

import Fetcher from "@/model/fetcher";
import { State, SportState } from "@/store/state";

type Context = ActionContext<SportState, State>;

const state: () => SportState = () => ({
  sports: [],
  disabledSports: []
});

const sportsModule = {
  namespaced: true,
  state,
  actions: {
    getAll(ctx: Context, payload: { fetcher: Fetcher }) {
      return payload.fetcher.getGameList().then(result => {
        plug.commit.setSports(ctx, result);
      });
    }
  },
  getters: {
    getSports(s: SportState) {
      return s;
    },
    getSportByName(s: SportState) {
      return (name: string, disabled: boolean) => {
        const sports = disabled ? s.disabledSports : s.sports;
        return sports.find(sport => sport.label === name);
      };
    }
  },
  mutations: {
    setSports(s: SportState, payload: SportState) {
      s.sports = payload.sports;
      s.disabledSports = payload.disabledSports;
    }
  }
};

const { commit, read, dispatch } = getStoreAccessors<SportState, State>(
  "sports"
);

const plug = {
  dispatch: {
    getAll: dispatch(sportsModule.actions.getAll)
  },
  commit: {
    setSports: commit(sportsModule.mutations.setSports)
  },
  read: {
    getSports: read(sportsModule.getters.getSports),
    getSportByName: read(sportsModule.getters.getSportByName)
  }
};

export default sportsModule;
export { plug };
