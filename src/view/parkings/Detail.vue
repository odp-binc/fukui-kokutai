<template>
  <div class="app-screen">
    <div v-if="!parking" class="not-found">
      対象の駐車場が見つかりませんでした。
    </div>
    <div v-else>
      <div class="parking-info">
        <h4>{{ parking.label }}</h4>
        <dl>
          <dt>住所:</dt>
          <dd>{{ parking.address }}</dd>
          <dt v-if="parking.capacity.length > 0">駐車可能台数:</dt>
          <dd v-for="(cap, index) in parking.capacity" :key="index">
            {{ cap.price }} : {{ cap.value }}台
          </dd>
          <template v-if="parking.price">
            <dt>利用料金:</dt>
            <dd>{{ parking.price }}</dd>
          </template>
        </dl>
      </div>
      <Map
        v-if="
          typeof parking.latitude === 'number' &&
            typeof parking.longitude === 'number'
        "
        :latitude="parking.latitude"
        :longitude="parking.longitude"
        :markers="markers"
      />
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import { LatLng } from "leaflet";

import { plug as parkingPlug } from "@/store/module/parks";
import { Parking, Marker } from "@/model/interfaces";
import { defaultFetcher as fetcher } from "@/model/fetcher";
import queryToStr from "@/model/queryToStr";
import Map from "@/components/Map.vue";

@Component({
  components: {
    Map
  }
})
export default class ParkingDetail extends Vue {
  @Prop()
  id!: string;

  get parking(): Parking | undefined {
    const disabled =
      this.$route.query && queryToStr(this.$route.query.disabled);
    if (disabled === undefined) {
      return parkingPlug.read.getByName(this.$store)(this.id);
    }

    const sport = this.$route.query && queryToStr(this.$route.query.sport);
    const address = this.$route.query && queryToStr(this.$route.query.address);
    const event = JSON.parse(disabled)
      ? "福井しあわせ元気大会"
      : "福井しあわせ元気国体";
    return sport
      ? parkingPlug.read.getByNameAndSport(this.$store)(
          this.id,
          sport,
          event,
          address
        )
      : parkingPlug.read.getByName(this.$store)(this.id);
  }

  get markers(): Marker[] {
    return this.parking &&
      typeof this.parking.latitude === "number" &&
      typeof this.parking.longitude === "number"
      ? [
          {
            latitude: this.parking.latitude,
            longitude: this.parking.longitude,
            content: this.parking.label
          }
        ]
      : [];
  }

  created() {
    this.fetchParkings();
  }

  fetchParkings() {
    const bounds = new LatLng(0, 0).toBounds(1000);

    return parkingPlug.dispatch.getAll(this.$store, { fetcher, bounds });
  }
}
</script>
<style lang="postcss">
.parking-info {
  padding: 0 1em;
  dt {
    font-weight: bold;
    margin-top: 8px;
  }
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
