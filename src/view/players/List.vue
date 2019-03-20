<template>
  <div class="app-screen">
    <div v-if="players.length < 1" class="not-found">
      {{
        sport ? sport.label : "この競技"
      }}に出場する選手の情報が見つかりませんでした。
    </div>
    <div v-else>
      <div class="player-search-form">
        <input v-model="query" type="text" />
        <button>検索</button>
      </div>
      <ul class="content-menu menu">
        <li v-for="player in filteredPlayer" :key="toKey(player)">
          <router-link :to="detailLink(player)" class="button">
            {{ toKey(player) }}
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";

import { defaultFetcher as fetcher } from "@/model/fetcher";
import { Player } from "@/model/interfaces";
import { comparatorChildren } from "@/model/sorter";
import { plug } from "@/store/module/players";
import { plug as sportPlug } from "@/store/module/sports";
import { mapToRecordStr } from "@/model/fixRecords";

@Component
export default class PlayerList extends Vue {
  @Prop()
  index!: number;

  @Prop()
  disabledSports!: boolean;

  query: string = "";

  created() {
    plug.dispatch.getAll(this.$store, { fetcher });
  }

  get sport() {
    const info = sportPlug.read.getSports(this.$store);
    return (this.disabledSports ? info.disabledSports : info.sports)[
      this.index
    ];
  }

  get players() {
    if (!this.sport) {
      return [];
    }
    return plug.read
      .getAll(this.$store)
      .filter(
        player =>
          player.type ===
            (this.disabledSports
              ? "福井しあわせ元気大会"
              : "福井しあわせ元気国体") &&
          player.sport.parent === mapToRecordStr(this.sport.label)
      );
  }

  get filteredPlayer() {
    const event = this.disabledSports
      ? "福井しあわせ元気大会"
      : "福井しあわせ元気国体";
    const comparator = comparatorChildren(event, this.sport.label);
    return this.players
      .filter(this.isFiltered)
      .sort(
        (a, b) =>
          comparator(a.sport.child || "", b.sport.child || "") ||
          a.kana.localeCompare(b.kana)
      );
  }

  isFiltered(p: Player) {
    const keywords = this.query.split(" ");
    const filter = (str: string) => {
      return keywords.reduce((prev, k) => prev || str.includes(k), false);
    };
    return (
      filter(p.name) ||
      filter(p.kana) ||
      filter(p.sport.label) ||
      filter(p.role) ||
      (p.performance || []).reduce((prev, perf) => prev || filter(perf), false)
    );
  }

  detailLink(player: Player) {
    return {
      name: "SportPlayersDetail",
      params: { name: player.name, sport: player.sport.label }
    };
  }

  toKey(player: Player) {
    return player.name + (player.sport.child ? " / " + player.sport.child : "");
  }
}
</script>
<style lang="postcss">
.not-found {
  padding: 1em;
}
.player-search-form {
  text-align: center;

  button {
    background-image: url(~@/assets/search_button_bg.png);
    color: white;
    border-radius: 0.5em;
    padding: 0.5em;
    margin: 1em 0.5em;
  }
}
.content-menu {
  .button {
    padding: 3px 0.5em;
  }
}
</style>
