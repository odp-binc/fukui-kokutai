<template>
  <div class="app-screen player-detail">
    <div v-if="!player" class="not-found">
      対象の選手情報が見つかりませんでした。
    </div>
    <div v-else>
      <dl>
        <dt>氏名:</dt>
        <dd>{{ player.name }}</dd>
        <dt>区分:</dt>
        <dd>{{ player.role }}</dd>
        <dt>出場競技:</dt>
        <dd>{{ player.sport.label }}</dd>
        <dd v-if="isShowEvents()">
          {{ player.sport.events.join(",") }}
        </dd>
        <template v-if="player.toCommute">
          <dt>勤務先/学校名:</dt>
          <dd>{{ player.toCommute }}</dd>
        </template>
        <template v-if="player.performance && player.performance.length > 0">
          <dt>実績:</dt>
          <dd v-for="(p, index) in player.performance" :key="index">
            {{ p }}
          </dd>
        </template>
      </dl>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";

import { defaultFetcher as fetcher } from "@/model/fetcher";
import { plug } from "@/store/module/players";

@Component
export default class PlayerDetail extends Vue {
  @Prop()
  name!: string;
  @Prop()
  sport!: string;

  created() {
    plug.dispatch.getAll(this.$store, { fetcher });
  }

  get player() {
    return plug.read.getByNameAndSport(this.$store)(this.name, this.sport);
  }

  isShowEvents() {
    const p = this.player;
    return (
      p !== undefined &&
      p.sport.events !== undefined &&
      p.sport.child !== undefined &&
      (p.sport.events.length > 1 ||
        (p.sport.events.length === 1 && p.sport.events[0] !== p.sport.child))
    );
  }
}
</script>
<style lang="postcss">
.player-detail {
  padding: 1em;
  dl dt {
    margin-top: 0.5em;
  }
}
</style>
