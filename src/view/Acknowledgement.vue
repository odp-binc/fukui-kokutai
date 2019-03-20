<template>
  <div>
    <div v-if="loading">
      読込中です
    </div>
    <div v-else>
      <section
        class="thirdparty-license"
        v-for="dep in dependInfo.dependencies"
        :key="dep.name"
      >
        <h1>{{ dep.name }} v{{ dep.version }}</h1>
        author: {{ dep.author }} <br />
        repository: {{ dep.repository }}<br />
        {{ dep.licenseText || dep.licenseName }}<br />
      </section>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";

@Component
export default class Acknowledgement extends Vue {
  loading: boolean = false;
  dependInfo: any = { dependency: {} };

  created() {
    this.loading = true;
    fetch("/static/ThirdPartyNotices.json")
      .then(res => res.json())
      .then(res => {
        this.dependInfo = res;
      })
      .finally(() => {
        this.loading = false;
      });
  }
}
</script>
<style lang="postcss">
.thirdparty-license h1 {
  font-style: bold;
  font-size: 1.2em;
}
</style>
