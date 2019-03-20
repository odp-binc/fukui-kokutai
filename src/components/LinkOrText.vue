<template>
  <span>
    <template v-for="t in texts">
      <template v-if="isLink(t)">
        <a :href="t" :key="t">{{ t }}</a></template
      >
      <template v-else>
        {{ t }}
      </template>
    </template>
  </span>
</template>
<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";

@Component
export default class LinkOrText extends Vue {
  @Prop({ default: "" })
  text!: "";

  get texts() {
    return this.text.split(" ");
  }

  isLink(s: string) {
    return s.match(/^https?:\/\//);
  }
}
</script>
