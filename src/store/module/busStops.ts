import { ActionContext } from "vuex";
import { getStoreAccessors } from "vuex-typescript";

import Fetcher from "@/model/fetcher";
import { BusStop } from "@/model/interfaces";
import { State, BusStopState } from "@/store/state";

type Context = ActionContext<BusStopState, State>;

const state: () => BusStopState = () => ({
  busStops: []
});

const busStopModule = {
  namespaced: true,
  state,
  actions: {
    getAll(ctx: Context, payload: { fetcher: Fetcher }) {
      return payload.fetcher.getBusStop().then(result => {
        plug.commit.setAll(ctx, result);
      });
    }
  },
  getters: {
    getAll(s: BusStopState) {
      return s.busStops;
    }
  },
  mutations: {
    setAll(s: BusStopState, payload: BusStop[]) {
      s.busStops = payload;
    }
  }
};

const { commit, read, dispatch } = getStoreAccessors<BusStopState, State>(
  "busStops"
);

const plug = {
  dispatch: {
    getAll: dispatch(busStopModule.actions.getAll)
  },
  commit: {
    setAll: commit(busStopModule.mutations.setAll)
  },
  read: {
    getAll: read(busStopModule.getters.getAll)
  }
};

export default busStopModule;
export { plug };
