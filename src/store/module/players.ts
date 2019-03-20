import { ActionContext } from "vuex";
import { getStoreAccessors } from "vuex-typescript";

import Fetcher from "@/model/fetcher";
import { Player } from "@/model/interfaces";
import { State, PlayerState } from "@/store/state";

type Context = ActionContext<PlayerState, State>;

const state: () => PlayerState = () => ({
  players: []
});

const playerModule = {
  namespaced: true,
  state,
  actions: {
    getAll(ctx: Context, payload: { fetcher: Fetcher }) {
      return payload.fetcher.getPlayers().then(result => {
        plug.commit.setAll(ctx, result);
      });
    }
  },
  getters: {
    getAll(s: PlayerState) {
      return s.players;
    },
    getByName(s: PlayerState) {
      return (name: string) => s.players.find(p => p.name === name);
    },
    getByNameAndSport(s: PlayerState) {
      return (name: string, sport: string) =>
        s.players.find(p => p.name === name && p.sport.label === sport);
    }
  },
  mutations: {
    setAll(s: PlayerState, payload: Player[]) {
      s.players = payload;
    }
  }
};

const { commit, read, dispatch } = getStoreAccessors<PlayerState, State>(
  "players"
);

const plug = {
  dispatch: {
    getAll: dispatch(playerModule.actions.getAll)
  },
  commit: {
    setAll: commit(playerModule.mutations.setAll)
  },
  read: {
    getAll: read(playerModule.getters.getAll),
    getByName: read(playerModule.getters.getByName),
    getByNameAndSport: read(playerModule.getters.getByNameAndSport)
  }
};

export default playerModule;
export { plug };
