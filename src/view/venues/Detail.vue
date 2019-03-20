<template>
  <div class="app-screen sports-venue-detail">
    <div v-if="!venue" class="not-found">
      対象の会場が見つかりませんでした。
    </div>
    <div v-else>
      <ul class="venue-menu menu">
        <li>
          <router-link
            :to="{
              name: 'VenueTrafficRegulation',
              params: { id },
              query: $route.query
            }"
            class="button"
          >
            交通規制
          </router-link>
        </li>
        <li>
          <router-link
            :to="{
              name: 'VenueShuttleBus',
              params: { id },
              query: $route.query
            }"
            class="button"
          >
            シャトルバス
          </router-link>
        </li>
        <li>
          <router-link
            :to="{ name: 'VenueParkings', params: { id }, query: $route.query }"
            class="button"
          >
            駐車場
          </router-link>
        </li>
        <li>
          <router-link
            :to="{ name: 'VenueEquipmentsList', params: { id } }"
            class="button"
          >
            多目的トイレ・AED
          </router-link>
        </li>
      </ul>
      <Map
        :latitude="venue.latitude"
        :longitude="venue.longitude"
        :markers="[marker]"
      />
      <br />
      <section v-if="venue.access" class="keep-nl">
        {{ venue.access }}
      </section>
      <p>
        <a :href="routeURL">Google Mapsで経路を調べる</a>
      </p>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";

import { Marker } from "@/model/interfaces";
import { plug as venuePlug } from "@/store/module/venues";
import Map from "@/components/Map.vue";
import { getGameSideInfo } from "@/model/GameSideInfo";
import { mapToRecordStr } from "@/model/fixRecords";
import queryToStr from "@/model/queryToStr";

@Component({
  components: {
    Map
  }
})
export default class SportsVenues extends Vue {
  @Prop({ default: false })
  disabledSports!: boolean;

  @Prop()
  id!: string;

  get venue() {
    return venuePlug.read.getByName(this.$store)(this.id);
  }

  get routeURL() {
    if (!this.venue) {
      return "";
    }
    return `https://www.google.com/maps/dir/?api=1&origin=&destination=${
      this.venue.latitude
    }%2C${this.venue.longitude}&dir_action=navigate`;
  }

  get marker(): Marker | undefined {
    return this.venue
      ? {
          latitude: this.venue.latitude,
          longitude: this.venue.longitude,
          color: "green",
          content: this.venue.label
        }
      : undefined;
  }

  get showParking(): boolean {
    const sport = queryToStr(this.$route.query.sport);
    return sport
      ? getGameSideInfo(mapToRecordStr(sport)).allowShowParking
      : true;
  }

  showParkingAlert() {
    window.alert(
      this.showParking
        ? "現在、準備中です。"
        : "会場周辺には一般観覧者用の駐車場はありません。"
    );
  }
}
</script>
<style lang="postcss">
.sports-venue-detail .venue-menu {
  display: grid;
  grid-template: 1fr 1fr / 1fr 1fr;

  border-top: 1px solid white;
  li:nth-child(odd) {
    border-right: 1px solid white;
  }
}

.dummy-map {
  width: 320px;
  height: 320px;
  max-width: 100%;
  object-fit: cover;
}

.aspect-wrapper {
  position: relative;
  width: 100%;

  &:before {
    content: "";
    display: block;
    padding-top: 100%;
  }

  .content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}
</style>
