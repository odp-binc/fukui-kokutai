<template>
  <div class="sports-detail">
    <article>
      <section v-if="summary">
        <h2>概要</h2>
        <p class="keep-nl">
          <link-or-text :text="summary" />
        </p>
      </section>
      <section v-if="rule">
        <h2>ルール</h2>
        <p>{{ rule }}</p>
      </section>
      <section
        v-for="(child, index) in children"
        :key="index"
        class="child-item"
      >
        <div v-if="child.summary !== undefined">
          <h2>
            {{ child.label }}
          </h2>
          <div>
            <div class="child-image">
              <img v-if="child.icon" :src="child.icon" />
            </div>

            <p class="keep-nl">{{ child.summary }}</p>
          </div>
        </div>
      </section>
    </article>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";

import { plug } from "@/store/module/sports";
import LinkOrText from "@/components/LinkOrText.vue";

@Component({
  components: {
    LinkOrText
  }
})
export default class SportDetail extends Vue {
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

  get summary() {
    return this.sport ? this.sport.summary : "対象競技が見つかりませんでした。";
  }

  get rule() {
    return this.sport ? this.sport.rule : "対象競技が見つかりませんでした。";
  }

  get children() {
    if (!this.sport || !this.sport.kinds || !this.sport.children) {
      return [];
    }
    return this.sport.kinds
      .map(kind =>
        (this.sport.children || []).find(
          child => child.label === kind && child.summary !== undefined
        )
      ) // kindsの順にsummary有りの要素を抽出
      .filter(Boolean); // undefinedを削除
  }
}
</script>
<style lang="postcss">
.sports-detail {
  width: 100%;

  article {
    padding: 1em;
    word-wrap: break-word;
  }

  .child-item > div {
    .child-image {
      text-align: center;
      img {
        max-width: 100%;
      }
    }
    @media screen and (min-width: 481px) {
      .child-image {
        padding: 0;
        float: right;
        max-width: 320px;
      }
    }
    &::after {
      content: "";
      display: block;
      clear: both;
    }
  }
}
</style>
