<template>
  <div class="app-screen tourisms-list">
    <div v-if="tourisms.length < 1" class="not-found">
      対象の観光情報が見つかりませんでした。
    </div>
    <div v-else>
      <ul class="menu">
        <li v-for="tourism in tourisms" :key="tourism.id">
          <router-link
            :to="{ name: 'TourismDetail', params: { id: tourism.id } }"
            class="button"
          >
            {{ tourism.title }}
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";

import { defaultFetcher as fetcher } from "@/model/fetcher";
import { plug } from "@/store/module/tourisms";

@Component
export default class SportsVenues extends Vue {
  created() {
    plug.dispatch.getAll(this.$store, { fetcher });
  }

  get tourisms() {
    return plug.read.getAll(this.$store).map(t => ({
      title: t.title,
      id: t.title
    }));
  }
}
</script>
<style lang="postcss">
.tourisms-list {
  ul.menu {
    padding: 1em;
    box-sizing: border-box;
    .button {
      text-align: start;
    }
  }
}
</style>
