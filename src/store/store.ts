import * as Vuex from "vuex";

import { State } from "@/store/state";
import app from "@/store/module/app";
import sports from "@/store/module/sports";
import venues from "@/store/module/venues";
import parkings from "@/store/module/parks";
import equipments from "@/store/module/equipments";
import tourisms from "@/store/module/tourisms";
import players from "@/store/module/players";
import spotMaps from "@/store/module/spotmap";
import busStops from "@/store/module/busStops";

const storeOptions = {
  modules: {
    app,
    equipments,
    sports,
    venues,
    parkings,
    tourisms,
    players,
    spotMaps,
    busStops
  },
  strict: process.env.NODE_ENV !== "production"
};

export const createStore = () => new Vuex.Store<State>(storeOptions);

const plug = {
  read: {}
};

export { plug };
