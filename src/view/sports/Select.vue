<template>
  <div class="selecting-sport">
    <template v-if="sport">
      <div class="content">
        <img v-if="sport.icon" :src="sport.icon" class="icon" />
        <div v-else class="icon dummy-icon" />
        <br />
        <section>
          {{ sport.label }}
        </section>
      </div>
      <ul class="bottom-menu menu">
        <li>
          <router-link
            :to="{
              name: disabledSports ? 'DisabledSportDetail' : 'SportDetail',
              params: { disabledSports, index }
            }"
            class="button"
          >
            競技概要
          </router-link>
        </li>
        <li v-if="sideInfo.allowShowPlayer">
          <router-link
            :to="{
              name: disabledSports ? 'DisabledSportPlayers' : 'SportPlayers',
              params: { disabledSports, index }
            }"
            class="button"
          >
            福井県の選手情報
          </router-link>
        </li>
        <li>
          <router-link
            :to="{
              name: disabledSports ? 'DisabledSportVenues' : 'SportVenues',
              params: { disabledSports, index }
            }"
            class="button"
          >
            競技会場・アクセス
          </router-link>
        </li>
      </ul>
    </template>
    <div v-else class="missing-sports">
      該当する競技が見つかりませんでした。
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import { plug } from "@/store/module/sports";
import { getGameSideInfo } from "@/model/GameSideInfo";
import { mapToRecordStr } from "@/model/fixRecords";

@Component
export default class Main extends Vue {
  @Prop({ default: false })
  disabledSports!: boolean;

  @Prop()
  index!: number;

  get sport() {
    const info = plug.read.getSports(this.$store);
    return (this.disabledSports ? info.disabledSports : info.sports)[
      this.index
    ];
  }

  get sideInfo() {
    return getGameSideInfo(mapToRecordStr(this.sport.label));
  }
}
</script>
<style lang="postcss">
.selecting-sport {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;

  .content {
    flex-shrink: 1;
    overflow-y: scroll;

    .icon {
      width: 100%;
      height: 100%;
      max-width: 320px;
    }

    .dummy-icon:after {
      display: block;
      padding-top: 100%;
      content: "";
    }

    section {
      padding: 1em;
    }
  }

  .menu {
    flex: none;
  }
}
</style>
