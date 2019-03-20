<template>
  <div class="app-screen venue-equipments">
    <div v-if="!venue" class="not-found">
      対象の会場が見つかりませんでした。
    </div>
    <div v-else>
      <ul class="menu">
        <li
          v-for="equipType in equipmentTypes"
          :key="`equip_` + equipType.value"
        >
          <label
            ><input
              v-model="showList"
              :value="equipType.value"
              type="checkbox"
            />{{ equipType.label }}</label
          >
        </li>
      </ul>
      <Map
        :latitude="venue.latitude"
        :longitude="venue.longitude"
        :markers="markers"
        @updatedBound="mapMoved"
      />
      <div>
        凡例: <br />
        <span :style="legendBorder('blue')">多目的トイレ</span><br />
        <span :style="legendBorder('red')">AED</span><br />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { LatLngBoundsExpression } from "leaflet";
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";

import { defaultFetcher as fetcher } from "@/model/fetcher";
import { EquipmentType, Marker, Equipment } from "@/model/interfaces";
import { plug as venuePlug } from "@/store/module/venues";
import { plug as equipmentPlug } from "@/store/module/equipments";
import Map from "@/components/Map.vue";

@Component({
  components: {
    Map
  }
})
export default class ParkingDetail extends Vue {
  @Prop()
  id!: string;

  showList = [EquipmentType.AED, EquipmentType.Toilet];

  get venue() {
    return venuePlug.read.getByName(this.$store)(this.id);
  }

  get equipments(): Equipment[] {
    return equipmentPlug.read
      .getAll(this.$store)
      .filter(equip => this.showList.includes(equip.type));
  }

  get equipmentTypes() {
    return [
      {
        value: EquipmentType.Toilet,
        label: "多目的トイレ"
      },
      {
        value: EquipmentType.AED,
        label: "AED"
      }
    ];
  }

  get markers(): Marker[] {
    return this.equipments.map(equipment => ({
      latitude: equipment.latitude,
      longitude: equipment.longitude,
      content: equipment.label,
      color: equipment.type === EquipmentType.AED ? "red" : "blue"
    }));
  }

  mapMoved(e: LatLngBoundsExpression) {
    this.fetchEquipments(e);
  }

  legendBorder(color: string) {
    return {
      display: "inline-block",
      "border-bottom": "solid",
      "border-width": "5px",
      "border-color": color,
      margin: "7px 0"
    };
  }
  fetchEquipments(bounds: LatLngBoundsExpression) {
    equipmentPlug.dispatch.getAll(this.$store, { fetcher, bounds });
  }
}
</script>
<style lang="postcss">
.venue-equipments {
  ul.menu {
    display: flex;

    li {
      text-align: center;
      padding: 1em;
      flex: 1;
    }
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
