<template>
  <nav class="navbar" aria-label="main navigation" role="navigation">
    <ul>
      <li>
        <button v-show="!hideBack" :disabled="disableBack" @click="histBack">
          <font-awesome-icon
            :icon="backIcon"
            style="color: white;"
            fixed-width
          />
        </button>
      </li>
      <li class="app-name">
        <template v-for="titleWord in title.split(' ')">
          {{ titleWord }}
          <wbr :key="titleWord" />
        </template>
      </li>
      <li>
        <!-- <button @click="toggleSidebar">
          <font-awesome-icon
            :icon="menuIcon"
            fixed-width />
        </button> -->
      </li>
    </ul>
  </nav>
</template>
<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faChevronLeft, faBars } from "@fortawesome/free-solid-svg-icons";

import { plug } from "@/store/module/app";

@Component({
  components: {
    FontAwesomeIcon
  }
})
export default class NavBar extends Vue {
  get backIcon() {
    return faChevronLeft;
  }

  get menuIcon() {
    return faBars;
  }

  get title() {
    const title = this.$route.meta && this.$route.meta.title;
    if (!title) {
      return "しあわせ元気 お役立ち情報アプリ";
    }
    if (typeof title === "function") {
      return title(this.$route, this.$store);
    }
    return title;
  }

  get disableBack() {
    return this.$route.name === "Main";
  }

  get hideBack() {
    return this.$route.name === "Main";
  }

  toggleSidebar() {
    plug.commit.changeSideBar(this.$store, !plug.read.sideBar(this.$store));
  }

  histBack() {
    return this.$router.back();
  }
}
</script>
<style lang="postcss">
@import "@/styles/defines.css";

.navbar {
  background-color: $main-color;
  color: white;
  min-width: 100%;
  height: $navbar-height;

  ul {
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    list-style-type: none;
    padding: 0;
    margin: 0;
    height: 100%;

    li {
      height: 100%;
      display: flex;
      align-items: center;
      min-width: 36px;
    }
  }

  li button {
    background-color: $main-darker;
    height: 100%;
    border: none;
  }

  .app-name {
    text-align: center;
    word-break: keep-all;
    white-space: nowrap;
    font-weight: bold;
  }
}
</style>
