import { ActionContext } from "vuex";
import { getStoreAccessors } from "vuex-typescript";
import { LatLngBoundsExpression } from "leaflet";

import Fetcher from "@/model/fetcher";
import { Parking } from "@/model/interfaces";
import { State, ParkingState } from "@/store/state";

type Context = ActionContext<ParkingState, State>;

const state: () => ParkingState = () => ({
  parkings: []
});

const parkingModule = {
  namespaced: true,
  state,
  actions: {
    getAll(
      ctx: Context,
      payload: { fetcher: Fetcher; bounds: LatLngBoundsExpression }
    ) {
      return payload.fetcher.getParkings(payload.bounds).then(parks => {
        plug.commit.setAll(ctx, parks);
        return parks;
      });
    }
  },
  getters: {
    getAll(s: ParkingState) {
      return s.parkings;
    },
    getByName(s: ParkingState): (id: string) => Parking | undefined {
      return id => s.parkings.find(park => park.label === id);
    },
    getByNameAndSport(
      s: ParkingState
    ): (
      id: string,
      sportName: string,
      event: string,
      address?: string
    ) => Parking | undefined {
      return (id, sportName, event, address) =>
        s.parkings.find(
          park =>
            park.label === id &&
            park.sport === sportName &&
            park.event === event &&
            (address ? park.address === address : true)
        );
    }
  },
  mutations: {
    setAll(s: ParkingState, parkings: Parking[]) {
      s.parkings = parkings;
    }
  }
};

const { commit, read, dispatch } = getStoreAccessors<ParkingState, State>(
  "parkings"
);

const plug = {
  dispatch: {
    getAll: dispatch(parkingModule.actions.getAll)
  },
  commit: {
    setAll: commit(parkingModule.mutations.setAll)
  },
  read: {
    getAll: read(parkingModule.getters.getAll),
    getByName: read(parkingModule.getters.getByName),
    getByNameAndSport: read(parkingModule.getters.getByNameAndSport)
  }
};

export default parkingModule;
export { plug };
