<template>
  <div class="app-screen">
    <p>現在地: {{ currentPlace }}</p>
    <Map
      :latitude="pos.latitude"
      :longitude="pos.longitude"
      :markers="allMarkers"
      :selecting-marker="selectingPlace"
      class="spot-map"
    />
    <div>
      凡例: <br />
      <span :style="legendBorder('aqua')">喫茶店</span><br />
      <span :style="legendBorder('#AF82CC')">タクシー</span><br />
    </div>
    <small>
      出典: <a href="https://www.finds.jp/rgeocode/index.html.ja">農研機構</a>
    </small>
    <ul class="menu content-menu">
      <li v-for="spot in spotList" :key="spot.key">
        <button class="button" @click="selectPlace(spot.key)">
          {{ spot.label }}<br />
          {{ spot.kind }}<br />
          {{ spot.address }}<br />
        </button>
      </li>
    </ul>
  </div>
</template>
<script lang="ts">
import L from "leaflet";
import Vue from "vue";
import { Component } from "vue-property-decorator";

import { CoffeeShop, Marker, TaxiInfo } from "@/model/interfaces";
import { defaultFetcher as fetcher } from "@/model/fetcher";
import Map from "@/components/Map.vue";
import { plug } from "@/store/module/spotmap";

interface SpotInfo {
  label: string;
  address: string;
  kind: string;
  latitude: number;
  longitude: number;
}

@Component({
  components: {
    Map
  }
})
export default class SpotMap extends Vue {
  currentPlace: string = "";
  selectingPlace: number | null = null;

  pos: { latitude?: number; longitude?: number } = {};

  get coffeeShops(): CoffeeShop[] {
    return plug.read.getCoffeeShops(this.$store);
  }

  get taxiInfos(): TaxiInfo[] {
    return plug.read.getTaxiInfo(this.$store);
  }

  get coffeeShopsMarkers(): Marker[] {
    const label: Array<[keyof CoffeeShop, string]> = [
      ["address", "住所"],
      ["tel", "電話番号"],
      ["businessHours", "営業時間"]
    ];
    return this.coffeeShops.map(coffeeShop => ({
      latitude: coffeeShop.latitude,
      longitude: coffeeShop.longitude,
      key: `喫茶店:${coffeeShop.label}:${coffeeShop.address}:${
        coffeeShop.latitude
      }:${coffeeShop.longitude}`,
      content: [coffeeShop.label]
        .concat(
          label
            .filter(l => coffeeShop[l[0]])
            .map(l => `${l[1]}:${coffeeShop[l[0]]}`)
        )
        .concat([(coffeeShop.memo || "").replace(/(\r?\n|\r)/g, "<br>")])
        .filter(v => v)
        .join("<br>")
    }));
  }

  get taxiInfoMarkers(): Marker[] {
    const label: Array<[keyof TaxiInfo, string]> = [
      ["address", "住所"],
      ["tel", "電話番号"],
      ["businessHours", "営業時間"]
    ];
    return this.taxiInfos.map(taxiInfo => ({
      latitude: taxiInfo.latitude,
      longitude: taxiInfo.longitude,

      content: [taxiInfo.label]
        .concat(
          label
            .filter(l => taxiInfo[l[0]])
            .map(l => `${l[1]}:${taxiInfo[l[0]]}`)
        )
        .concat([
          taxiInfo.memo ? taxiInfo.memo.replace(/(\r?\n|\r)/g, "<br>") : ""
        ])
        .filter(v => v)
        .join("<br>"),
      key: `タクシー:${taxiInfo.label}:${taxiInfo.address}:${
        taxiInfo.latitude
      }:${taxiInfo.longitude}`,
      color: "#AF82CC"
    }));
  }

  get allMarkers() {
    return this.coffeeShopsMarkers.concat(this.taxiInfoMarkers).concat(
      typeof this.pos.latitude === "number" &&
        typeof this.pos.longitude === "number"
        ? [
            {
              latitude: this.pos.latitude,
              longitude: this.pos.longitude,
              content: "現在地",
              color: "red"
            }
          ]
        : []
    );
  }

  get spotList(): SpotInfo[] {
    const coffeeShops = this.coffeeShops.map(shop => ({
      label: shop.label,
      address: shop.address || "住所不明",
      kind: "喫茶店",
      latitude: shop.latitude,
      longitude: shop.longitude,
      key: `喫茶店:${shop.label}:${shop.address}:${shop.latitude}:${
        shop.longitude
      }`
    }));
    const taxies = this.taxiInfos.map(shop => ({
      label: shop.label,
      address: shop.address || "住所不明",
      kind: "タクシー",
      latitude: shop.latitude,
      longitude: shop.longitude,
      key: `タクシー:${shop.label}:${shop.address}:${shop.latitude}:${
        shop.longitude
      }`
    }));
    return coffeeShops.concat(taxies).sort((a, b) => {
      const target = L.latLng({
        lat:
          typeof this.pos.latitude === "undefined"
            ? 36.062083
            : this.pos.latitude,
        lng:
          typeof this.pos.longitude === "undefined"
            ? 136.223333
            : this.pos.longitude
      });
      const distanceA = target.distanceTo({
        lat: a.latitude,
        lng: a.longitude
      });
      const distanceB = target.distanceTo({
        lat: b.latitude,
        lng: b.longitude
      });
      return distanceA - distanceB;
    });
  }

  mounted() {
    this.currentPlace = "位置情報取得中";
    if (!("geolocation" in navigator)) {
      this.currentPlace = "位置情報取得失敗";
      alert("現在地情報が使用できませんでした");
      return false;
    }
    this.fetchData();
    new Promise<Position>((res, rej) =>
      navigator.geolocation.getCurrentPosition(res, rej)
    )
      .then((pos: Position) => {
        this.pos = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        };
        return this.pos;
      })
      .then(pos => {
        const q = new URLSearchParams();
        q.set("json", "true");
        q.set("lat", `${pos.latitude}`);
        q.set("lon", `${pos.longitude}`);
        fetch("https://www.finds.jp/ws/rgeocode.php?" + q.toString())
          .then(res => res.json())
          .then((res: any) => {
            this.currentPlace =
              res.result.prefecture.pname +
              res.result.municipality.mname +
              (res.result.local.length > 0
                ? res.result.local[0].section +
                  "-" +
                  res.result.local[0].homenumber
                : "");
            console.log(res);
          });
      })
      .catch(err => {
        this.currentPlace = "位置情報取得失敗";
        window.alert(err.message);
      });
  }

  fetchData() {
    plug.dispatch.getAll(this.$store, { fetcher });
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

  selectPlace(key: string) {
    const index = this.allMarkers.findIndex(marker => marker.key === key);
    this.selectingPlace = index < 0 ? null : index;
  }
}
</script>
<style lang="postcss">
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

.spot-map {
  width: 320px;
  height: 320px;
}
</style>
