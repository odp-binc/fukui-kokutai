<template>
  <div class="main-screen">
    <div ref="gameContainer" class="game-container">
      <ul class="header-switch">
        <li>
          <button
            :class="{ 'not-selected': showDisabled }"
            class="button"
            @click="setDisabled(false)"
          >
            福井しあわせ元気国体
          </button>
        </li>
        <li>
          <button
            :class="{ 'not-selected': !showDisabled }"
            class="button"
            @click="setDisabled(true)"
          >
            福井しあわせ元気大会
          </button>
        </li>
      </ul>
      <ul ref="sportList" class="game-list">
        <li v-for="(item, index) in displaySports" :key="index">
          <router-link :to="link(index)">
            <div class="sport-image">
              <img v-if="item.icon" :src="item.icon" />
              <div v-else class="dummy-icon" />
            </div>
            <br />
            <div class="sport-label">
              {{ item.label }}
            </div>
          </router-link>
        </li>
      </ul>
    </div>
    <!-- メニュー -->
    <ul class="menu bottom-menu">
      <li>
        <router-link :to="{ name: 'SocialSites' }" class="button footer-button">
          SNS公式アカウント
        </router-link>
      </li>
      <li>
        <router-link :to="{ name: 'TourismList' }" class="button footer-button">
          観光情報
        </router-link>
      </li>
      <li>
        <router-link :to="{ name: 'PictFrame' }" class="button footer-button">
          写真フレーム
        </router-link>
      </li>
      <li>
        <router-link :to="{ name: 'SpotMap' }" class="button footer-button">
          タクシー・喫茶店情報表示
        </router-link>
      </li>
      <li>
        <router-link
          :to="{ name: 'Acknowledgement' }"
          class="button footer-button"
          >ライセンス情報</router-link
        >
      </li>
    </ul>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import { Route } from "vue-router";
import { Component } from "vue-property-decorator";
import { plug as appPlug } from "@/store/module/app";
import { plug } from "@/store/module/sports";
import { defaultFetcher as fetcher } from "@/model/fetcher";

@Component
export default class Main extends Vue {
  get showDisabled() {
    return appPlug.read.showDisabled(this.$store);
  }

  setDisabled(f: boolean) {
    appPlug.commit.setShowDisabled(this.$store, f);
  }

  get sports() {
    return plug.read.getSports(this.$store).sports;
  }

  get disabledSports() {
    return plug.read.getSports(this.$store).disabledSports;
  }

  get displaySports() {
    return this.showDisabled ? this.disabledSports : this.sports;
  }

  created() {
    plug.dispatch.getAll(this.$store, { fetcher });
  }

  beforeRouteEnter(_to: Route, from: Route, next: any) {
    const scrollTo =
      from.name === "SportSelect" || from.name === "DisabledSportSelect"
        ? parseInt(from.params.id, 10)
        : null;
    next((vm: Main) => {
      if (scrollTo !== null) {
        const container = vm.$refs.gameContainer as HTMLElement;
        const list = vm.$refs.sportList as HTMLElement;
        const target = list.children[scrollTo] as HTMLElement;
        container.scrollTo(0, target.offsetTop);
      }
    });
  }

  link(id: number) {
    return {
      name: this.showDisabled ? "DisabledSportSelect" : "SportSelect",
      params: {
        id
      }
    };
  }
}
</script>
<style lang="postcss">
.main-screen {
  display: flex;
  flex-direction: column;
  flex: 1;

  .game-container {
    flex: 1;

    position: relative; /* for element.offsetTop */
    overflow-y: scroll;
    /*
    https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariCSSRef/Articles/StandardCSSProperties.html#//apple_ref/doc/uid/TP30001266-SW26
     */
    -webkit-overflow-scrolling: touch;
  }

  ul.game-list {
    width: 100%;
    list-style-type: none;
    padding: 0;
    justify-content: space-evenly;

    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    row-gap: 1em;
    grid-row-gap: 1em;

    li {
      text-align: center;
      .sport-image {
        width: 160px;
        height: 160px;
        margin: auto;
        line-height: 160px;
        img {
          width: auto;
          height: auto;
          max-width: 100%;
          max-height: 100%;
          vertical-align: middle;
        }
      }
      .sport-label {
        padding: 0 0.5em;
      }
    }
  }
}
</style>
