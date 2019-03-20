<template>
  <div class="tourism-detail">
    <div v-if="!placeInfo">Loading</div>
    <article v-else>
      <h1 :style="styles.backLight" class="spot-title">
        {{ placeInfo.title }}
      </h1>
      <section
        v-for="(spot, index) in placeInfo.spots"
        :key="index"
        class="spot-detail"
      >
        <div v-if="spot.image" class="head-image">
          <img :style="spot.imageStyle" :src="spot.image" />
          <div class="image-label">
            <div :style="styles.textShadow" class="introduction keep-nl">
              <template
                v-for="(sentence, index) in zwsp2list(spot.introduction)"
                >{{ sentence }}<wbr :key="index"
              /></template>
            </div>
            <div class="label">
              <div :style="styles.backLight" class="name">
                {{ spot.label.value }}
              </div>
              <div :style="styles.backDark" class="kana">
                {{ spot.label.ruby }}
              </div>
            </div>
          </div>
        </div>
        <div v-else class="head-no-image">
          <div class="label">
            <div :style="styles.backLight" class="name">
              {{ spot.label.value }}
            </div>
            <div :style="styles.backDark" class="kana">
              {{ spot.label.ruby }}
            </div>
          </div>
          <div :style="styles.text" class="introduction">
            {{ spot.introduction }}
          </div>
        </div>
        <div class="spot-content">
          <img
            v-for="(img, subIndex) in spot.subImages"
            :src="img"
            :key="`${index}-subImg-${subIndex}`"
            class="sub-image"
          />
          <div class="spot-description keep-nl">{{ spot.description }}</div>
          <dl>
            <template v-for="key in list_keys">
              <template v-if="spot[key[0]]">
                <dt :key="`${index}-${key[0]}`">{{ key[1] }}</dt>
                <dd
                  v-for="(value, vIndex) in spot[key[0]]"
                  :key="`${index}-${key[0]}-${vIndex}`"
                >
                  {{ value }}
                </dd>
              </template>
            </template>
          </dl>
        </div>
        <div v-if="spot.additional" class="additional">
          <h2>オススメスポットをチェック！</h2>
          <section
            v-for="(addSpot, addSpotIndex) in spot.additional"
            :key="`${index}-add-${addSpotIndex}`"
          >
            <img :src="addSpot.image" />
            <div class="spot-content">
              <h3>{{ addSpot.label }}</h3>
              <div class="description keep-nl">{{ addSpot.description }}</div>
            </div>
          </section>
        </div>
      </section>
      <div class="warning-barrierfree">
        ※バリアフリー設備の設置場所等は施設によって異なります。また、観光する際に介助者が必要となる場合がありますので、詳細は各施設へお問い合わせください。
      </div>
    </article>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";

import { defaultFetcher as fetcher } from "@/model/fetcher";
import { plug } from "@/store/module/tourisms";

@Component
export default class TourismDetail extends Vue {
  @Prop()
  title!: string;

  created() {
    plug.dispatch.getAll(this.$store, { fetcher });
  }

  zwsp2list(str: string) {
    return str.split("\u200b");
  }

  get placeInfo() {
    return plug.read.getByTitle(this.$store)(this.title);
  }

  get list_keys() {
    return [
      ["address", "住所"],
      ["tel", "tel"],
      ["businessHours", "営業時間"],
      ["holiday", "定休日"],
      ["price", "料金"],
      ["access", "アクセス"],
      ["barrierfreeEquipment", "バリアフリー設備"]
    ];
  }

  get styles() {
    if (!this.placeInfo) {
      return {
        backLight: {},
        backDark: {},
        text: {},
        textShadow: {}
      };
    }

    return {
      backLight: {
        backgroundColor: this.placeInfo.colors.light
      },
      backDark: {
        backgroundColor: this.placeInfo.colors.dark
      },
      text: {
        color: this.placeInfo.colors.dark
      },
      textShadow: {
        textShadow: `2px 2px 1px ${this.placeInfo.colors.dark}`
      }
    };
  }
}
</script>
<style lang="postcss">
/* css */
.spot-detail {
  .spot-content {
    padding: 9px;

    dt {
      font-weight: bold;
    }
  }
  .spot-content::after {
    display: block;
    clear: both;
    content: "";
  }

  img {
    width: 100%;
    height: auto;
  }
}

.warning-barrierfree {
  color: red;
  font-size: x-small;
  padding: 9px;
}

img.sub-image {
  float: left;
  width: 50%;
  height: auto;
  margin: 9px 9px 9px 0;
}

.label {
  .name {
    font-weight: bold;
    font-size: 20px;
    border-radius: 10px;
    padding: 8px;
    white-space: nowrap;
  }
  .kana {
    font-size: 9px;
    border-radius: 10px;
    padding: 12px 8px 8px 8px;
    margin-top: -22px;
    white-space: nowrap;
  }
}

.head-no-image {
  .introduction {
    padding-left: 9px;
    font-weight: bold;
    font-size: 18px;
  }

  .label {
    width: 94%;
    color: white;
    margin: 8px auto 0;
  }
}

.head-image {
  position: relative;
  min-width: 320px;
  min-height: 160px;
  background-color: #ddd;
  img {
    width: 100%;
    max-height: 80vw;
    object-fit: cover;
  }
  .image-label {
    color: white;
    position: absolute;
    bottom: 10px;
    right: 10px;
    width: 80%;

    .label {
      float: right;
      margin-top: 8px;
      text-align: center;
      .name,
      .kana {
        padding: 8px 30px;
      }
    }

    .introduction {
      font-weight: bold;
      font-size: 18px;
      width: 100%;
      text-align: right;
      word-break: keep-all;
    }
  }
}

.spot-title {
  margin: 0;
  padding: 21px;
  color: #ffffff;
  font-weight: bold;
}

.tourism-detail {
  width: 100%;
  line-height: normal;
}

.additional {
  background-image: url("/static/additional-bg.jpg");
  background-color: #eee4d8;
  margin-bottom: 10px;

  h2 {
    font-size: 16px;
    padding: 9px;
    margin: 0;
  }

  h3 {
    margin: 0;
  }
}
</style>
