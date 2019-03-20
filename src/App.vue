<template>
  <div id="app">
    <div class="app-container">
      <header>
        <nav-bar />
      </header>
      <main class="main" role="main">
        <router-view />
      </main>
      <!-- <footer>
        <div class="cookie-warning" v-show="showCookieWarning">
          このWebサイトでは、サービス改善、利用状況の把握を目的としてGoogle
          Analyticsを使用しています。
          <a href="https://policies.google.com/technologies/partner-sites?hl=ja"
            >詳細はこちら</a
          >
          <button class="button" @click="accept">
            続行
          </button>
        </div>
      </footer> -->
      <!-- <footer>
        <img
          class="logo"
          src="@/assets/placeholder-banner.png">
      </footer> -->
    </div>
    <!-- <transition name="slide-right">
      <side-bar v-show="sideBar" />
    </transition> -->
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";
import * as Cookies from "es-cookie";

import NavBar from "@/components/layout/Navbar.vue";
import SideBar from "@/components/layout/Sidebar.vue";
import { plug } from "@/store/module/app";

@Component({
  components: {
    NavBar,
    SideBar
  }
})
export default class App extends Vue {
  get sideBar() {
    return plug.read.sideBar(this.$store);
  }

  accepted: boolean = false;

  accept() {
    Cookies.set("accepted", "true", {
      expires: new Date("Fri, 31 Dec 9999 23:59:59 GMT")
    });
    this.accepted = true;
  }

  get showCookieWarning() {
    return !Cookies.get("accepted") && !this.accepted;
  }
}
</script>
<style lang="postcss">
@import "normalize.css";

@import "@/styles/defines.css";
@import "@/styles/components.css";

html,
body {
  height: 100%;
  width: 100%;
  overflow: hidden;
  margin: 0;
  padding: 0;
  border: none;
}

#app {
  /* font-family: "Avenir", Helvetica, Arial, sans-serif; */
  font-family: "Avenir", "Corbel", "Osaka", "MS Pゴシック", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100%;
}

.app-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

main.main {
  flex: 1;
  display: flex;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
}

footer {
  flex: none;

  img.logo {
    margin: auto;
    display: block;
    width: auto;
    height: auto;
    max-height: 161px;
    max-width: 100%;
  }

  .cookie-warning {
    button {
      display: inline-block;
      color: white;
      background-color: $main-darker;
      border-radius: 5px;
    }
  }
}

.slide-right-enter-active {
  transition: transform 0.2s ease-in-out;
}

.slide-right-leave-active {
  transition: transform 0.2s ease-out;
}

.slide-right-enter,
.slide-right-leave-to {
  transform: translate3d(180px, 0, 0);
}
</style>
