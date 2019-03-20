import { ActionContext } from "vuex";
import { getStoreAccessors } from "vuex-typescript";

import Fetcher from "@/model/fetcher";
import { CoffeeShop, TaxiInfo } from "@/model/interfaces";
import { State, SpotMapState } from "@/store/state";

type Context = ActionContext<SpotMapState, State>;

const state: () => SpotMapState = () => ({
  coffeeShops: [],
  taxiInfo: []
});

const spotMapModule = {
  namespaced: true,
  state,
  actions: {
    getCoffeeShops(ctx: Context, payload: { fetcher: Fetcher }) {
      return payload.fetcher.getCoffeeShops().then(result => {
        plug.commit.setCoffeeShops(ctx, result);
      });
    },
    getTaxiInfo(ctx: Context, payload: { fetcher: Fetcher }) {
      return payload.fetcher.getTaxiInfo().then(result => {
        plug.commit.setTaxiInfo(ctx, result);
      });
    },
    getAll(ctx: Context, payload: { fetcher: Fetcher }) {
      return Promise.all([
        spotMapModule.actions.getCoffeeShops(ctx, payload),
        spotMapModule.actions.getTaxiInfo(ctx, payload)
      ]);
    }
  },
  getters: {
    getCoffeeShops(s: SpotMapState) {
      return s.coffeeShops;
    },
    getTaxiInfo(s: SpotMapState) {
      return s.taxiInfo;
    }
  },
  mutations: {
    setCoffeeShops(s: SpotMapState, payload: CoffeeShop[]) {
      s.coffeeShops = payload;
    },
    setTaxiInfo(s: SpotMapState, payload: TaxiInfo[]) {
      s.taxiInfo = payload;
    }
  }
};

const { commit, read, dispatch } = getStoreAccessors<SpotMapState, State>(
  "spotMaps"
);

const plug = {
  dispatch: {
    getCoffeeShops: dispatch(spotMapModule.actions.getCoffeeShops),
    getTaxiInfo: dispatch(spotMapModule.actions.getTaxiInfo),
    getAll: dispatch(spotMapModule.actions.getAll)
  },
  commit: {
    setCoffeeShops: commit(spotMapModule.mutations.setCoffeeShops),
    setTaxiInfo: commit(spotMapModule.mutations.setTaxiInfo)
  },
  read: {
    getCoffeeShops: read(spotMapModule.getters.getCoffeeShops),
    getTaxiInfo: read(spotMapModule.getters.getTaxiInfo)
  }
};

export default spotMapModule;
export { plug };
