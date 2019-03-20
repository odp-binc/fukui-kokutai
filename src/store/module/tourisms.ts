import { ActionContext } from "vuex";
import { getStoreAccessors } from "vuex-typescript";

import Fetcher from "@/model/fetcher";
import { TourismInfo } from "@/model/interfaces";
import { State, TourismState } from "@/store/state";

type Context = ActionContext<TourismState, State>;

const state: () => TourismState = () => ({
  tourisms: []
});

const tourismsModule = {
  namespaced: true,
  state,
  actions: {
    getAll(ctx: Context, payload: { fetcher: Fetcher }) {
      return payload.fetcher.getTourisms().then(result => {
        plug.commit.setAll(ctx, result);
      });
    }
  },
  getters: {
    getAll(s: TourismState) {
      return s.tourisms;
    },
    getByTitle(s: TourismState) {
      return (title: string) => s.tourisms.find(loc => loc.title === title);
    }
  },
  mutations: {
    setAll(s: TourismState, payload: TourismInfo[]) {
      s.tourisms = payload;
    }
  }
};

const { commit, read, dispatch } = getStoreAccessors<TourismState, State>(
  "tourisms"
);

const plug = {
  dispatch: {
    getAll: dispatch(tourismsModule.actions.getAll)
  },
  commit: {
    setAll: commit(tourismsModule.mutations.setAll)
  },
  read: {
    getAll: read(tourismsModule.getters.getAll),
    getByTitle: read(tourismsModule.getters.getByTitle)
  }
};

export default tourismsModule;
export { plug };
