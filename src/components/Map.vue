<template>
  <div>
    <div ref="map" class="map" />
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import { Component, Prop, Watch } from "vue-property-decorator";
import L, { LatLngExpression } from "leaflet";
import "leaflet-defaulticon-compatibility";

import { Marker } from "@/model/interfaces";

function icon(color: string = "aqua"): L.DivIcon {
  const width = 44;
  const height = 64;
  const html = `<svg width="${width}" height="${height}" viewBox="0, 0, 22, 32" xmlns="http://www.w3.org/2000/svg">
<path d="M11,31L5,10L16,10L11,31z" fill="${color}"/>
<circle cx="11" cy="11" r="10" fill="${color}"/>
<circle cx="11" cy="11" r="7" fill="white"/>
</svg>`;

  return L.divIcon({
    html,
    iconSize: [width, height],
    iconAnchor: [width / 2, height],
    popupAnchor: [0, -height],
    className: "map-marker"
  });
}

@Component({
  watch: {
    latitude: "updatePosition",
    longitude: "updatePosition"
  }
})
export default class Map extends Vue {
  map!: L.Map;

  @Prop({ default: 36.062083 })
  latitude!: number;
  @Prop({ default: 136.223333 })
  longitude!: number;
  @Prop({
    default: () => []
  })
  markers!: Marker[];
  @Prop({
    default: () => []
  })
  lines!: LatLngExpression[][];
  @Prop({ default: null, type: [Number] })
  selectingMarker!: number | null;
  @Prop({ default: false })
  disableClick!: boolean;
  @Prop({ default: 14 })
  zoom!: number;

  currentMarkers: L.Marker[] = [];
  currentLines: L.Polyline[] = [];
  currentSelectingMarker: number | null = null;

  mounted() {
    this.map = L.map(this.$refs.map as HTMLElement).setView(
      L.latLng(this.latitude, this.longitude),
      this.zoom
    );
    this.map.on("moveend", e => {
      this.$emit("moveend", e);
      this.$emit("updatedBound", this.map.getBounds());
    });

    L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png", {
      attribution:
        "Map data &copy; <a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
      maxZoom: 18
    }).addTo(this.map);
    this.updateMarkers();
    this.$emit("updatedBound", this.map.getBounds());
  }

  @Watch("markers")
  updateMarkers() {
    this.currentMarkers.forEach(marker => this.map.removeLayer(marker));
    this.currentMarkers = this.markers.map((pos, index) => {
      return L.marker(L.latLng(pos.latitude, pos.longitude), {
        icon: icon(pos.color)
      })
        .addTo(this.map)
        .bindPopup(`<div>${pos.content}</div>`)
        .on("click", e => {
          if (this.disableClick) {
            e.target.closePopup();
            return false;
          }
          this.currentSelectingMarker = index;
          if (pos.key) {
            this.$emit("markerClicked", pos.key);
          }
        });
    });
  }

  @Watch("lines")
  updateLines() {
    this.currentLines.forEach(marker => this.map.removeLayer(marker));
    this.currentLines = this.lines.map(line => {
      return L.polyline(line, { color: "purple" }).addTo(this.map);
    });
  }

  @Watch("selectingMarker")
  updateSelecting() {
    if (this.selectingMarker === null) {
      return;
    }
    this.currentSelectingMarker = this.selectingMarker;
    this.currentMarkers[this.selectingMarker].openPopup();
  }

  updatePosition() {
    this.map.panTo([this.latitude, this.longitude]);
  }
}
</script>
<style lang="postcss">
@import "leaflet/dist/leaflet.css";
@import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css";

.map {
  height: 320px;
}
.map-marker {
  background: none;
  border: none;
}
</style>
