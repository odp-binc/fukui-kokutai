<template>
  <article class="app-screen social-sites">
    <ul class="content-menu menu">
      <li>
        <a href="https://twitter.com/Happy_Ryu2018" class="button"
          >Twitter<br />@Happy_Ryu2018</a
        >
      </li>
      <li>
        <a
          href="https://www.facebook.com/Happiness2018.kokutai.fukui/"
          class="button"
          >Facebook<br />@Happiness2018.kokutai.fukui</a
        >
      </li>
      <li>
        <a
          href="https://www.youtube.com/channel/UCFTFjRF16hIHpp8CZz_aCUg"
          class="button"
          >YouTube<br />福井しあわせ元気国体・障スポ</a
        >
      </li>
    </ul>
  </article>
</template>
<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";

@Component
export default class SocialSites extends Vue {}
</script>
<style lang="postcss">
/* style here */
.social-sites .content-menu li > a {
  padding: 0.5em 1em;
}
</style>
