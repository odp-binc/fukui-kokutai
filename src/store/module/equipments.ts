import { LatLngBoundsExpression } from "leaflet";
import { ActionContext } from "vuex";
import { getStoreAccessors } from "vuex-typescript";

import Fetcher from "@/model/fetcher";
import { Equipment } from "@/model/interfaces";
import { State, EquipmentState } from "@/store/state";

type Context = ActionContext<EquipmentState, State>;

const state: () => EquipmentState = () => ({
  equipments: []
});

const equipmentModule = {
  namespaced: true,
  state,
  actions: {
    getAll(
      ctx: Context,
      payload: { fetcher: Fetcher; bounds: LatLngBoundsExpression }
    ) {
      return payload.fetcher.getEquipments(payload.bounds).then(result => {
        plug.commit.setAll(ctx, result);
      });
    }
  },
  getters: {
    getAll(s: EquipmentState) {
      return s.equipments;
    }
  },
  mutations: {
    setAll(s: EquipmentState, payload: Equipment[]) {
      s.equipments = payload;
    }
  }
};

const { commit, read, dispatch } = getStoreAccessors<EquipmentState, State>(
  "equipments"
);

const plug = {
  dispatch: {
    getAll: dispatch(equipmentModule.actions.getAll)
  },
  commit: {
    setAll: commit(equipmentModule.mutations.setAll)
  },
  read: {
    getAll: read(equipmentModule.getters.getAll)
  }
};

export default equipmentModule;
export { plug };
