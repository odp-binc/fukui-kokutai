<template>
  <div class="app-screen venue-parkings-list">
    <div v-if="!venue" class="not-found">
      <p>対象の会場が見つかりませんでした。</p>
    </div>
    <div v-else-if="parkings.length === 0" class="not-found">
      <p>
        {{ venue.label }}周辺の駐車場情報がありません。<br />
        公共交通機関やP&amp;BR駐車場をご利用ください。
      </p>
      <p>
        会場周辺の道路や店舗駐車場での迷惑駐車は絶対におやめください。
      </p>
    </div>
    <div v-else>
      <p>{{ venue.label }}周辺の駐車場</p>
      <ul class="menu">
        <li v-for="(park, index) in parkings" :key="index">
          <router-link
            :to="{
              name: 'ParkingDetail',
              params: { id: park.label },
              query: Object.assign({}, $route.query, { address: park.address })
            }"
            class="button"
          >
            {{ park.label }}<br />
            {{ park.address }}
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>
<script lang="ts">
import { LatLng } from "leaflet";
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import { Parking } from "@/model/interfaces";
import { defaultFetcher as fetcher } from "@/model/fetcher";
import { plug as venuePlug } from "@/store/module/venues";
import { plug as parkingPlug } from "@/store/module/parks";
import queryToStr from "@/model/queryToStr";

interface HasCoord {
  latitude: number;
  longitude: number;
}

function validCoord(v: Parking): v is Parking & HasCoord {
  return typeof v.latitude === "number" && typeof v.longitude === "number";
}

@Component
export default class VenueParkings extends Vue {
  @Prop()
  id!: string;

  loading: boolean = false;

  get venue() {
    return venuePlug.read.getByName(this.$store)(this.id);
  }

  get parkings() {
    const venue = this.venue;
    if (!venue) {
      return [];
    }
    const sport = this.$route.query
      ? queryToStr(this.$route.query.sport)
      : undefined;
    const disabledQuery =
      this.$route.query && queryToStr(this.$route.query.disabled);
    const disabled = disabledQuery && JSON.parse(disabledQuery);
    const venuePlace = new LatLng(venue.latitude, venue.longitude);
    return parkingPlug.read
      .getAll(this.$store)
      .filter(
        park =>
          park.venue === venue.label &&
          (sport ? park.sport === sport : true) &&
          (disabled === undefined
            ? true
            : (park.event === "福井しあわせ元気大会") === disabled)
      )
      .sort((a, b) => {
        if (validCoord(a)) {
          if (validCoord(b)) {
            const diffA = venuePlace.distanceTo([a.latitude, a.longitude]);
            const diffB = venuePlace.distanceTo([b.latitude, b.longitude]);
            return diffA - diffB;
          } else {
            return -1;
          }
        } else if (validCoord(b)) {
          return 1;
        }
        return 0;
      });
  }

  fetchParkings() {
    this.loading = true;
    if (!this.venue) {
      return;
    }
    const bounds = new LatLng(
      this.venue.latitude,
      this.venue.longitude
    ).toBounds(1000);

    return parkingPlug.dispatch
      .getAll(this.$store, { fetcher, bounds })
      .then(() => {
        this.loading = false;
      });
  }

  created() {
    this.fetchParkings();
  }
}
</script>
<style lang="postcss">
.venue-parkings-list {
  padding: 0 1em;
  ul.menu {
    box-sizing: border-box;
    .button {
      padding: 4px 10px;
      text-align: start;
    }
  }
}
</style>
