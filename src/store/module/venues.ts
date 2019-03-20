import { ActionContext } from "vuex";
import { getStoreAccessors } from "vuex-typescript";

import Fetcher from "@/model/fetcher";
import { Locations } from "@/model/interfaces";
import { State, VenueState } from "@/store/state";

type Context = ActionContext<VenueState, State>;

const state: () => VenueState = () => ({
  locations: []
});

const venuesModule = {
  namespaced: true,
  state,
  actions: {
    getAll(ctx: Context, payload: { fetcher: Fetcher; ids: string[] }) {
      return payload.fetcher.getSportsVenues(payload.ids).then(result => {
        plug.commit.setVenues(ctx, result);
      });
    }
  },
  getters: {
    getVenues(s: VenueState) {
      return s.locations;
    },
    getByName(s: VenueState) {
      return (id: string) => s.locations.find(loc => loc.label === id);
    }
  },
  mutations: {
    setVenues(s: VenueState, payload: Locations) {
      s.locations = payload.locations;
    }
  }
};

const { commit, read, dispatch } = getStoreAccessors<VenueState, State>(
  "venues"
);

const plug = {
  dispatch: {
    getAll: dispatch(venuesModule.actions.getAll)
  },
  commit: {
    setVenues: commit(venuesModule.mutations.setVenues)
  },
  read: {
    getVenues: read(venuesModule.getters.getVenues),
    getByName: read(venuesModule.getters.getByName)
  }
};

export default venuesModule;
export { plug };
