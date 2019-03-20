<template>
  <div class="app-screen">
    <div v-if="!venue">
      お探しの競技場情報は見つかりませんでした。
    </div>
    <div v-else>
      <Map
        :latitude="venue.latitude"
        :longitude="venue.longitude"
        :markers="markers"
        :disable-click="false"
        :zoom="11"
        @markerClicked="markerClicked"
      />
      <div v-if="busOpsStatus" class="bus-ops">
        <p>
          <a :href="busOpsStatus"
            >シャトルバスの運行状況はこちらから(実証実験中)</a
          >
        </p>
      </div>
      <div v-if="!selectingBusStop" class="before-select">
        <p v-if="onlyInvited">
          開会式にご招待予定のお客様に限ります。
        </p>
        <p v-else-if="isNotFound">
          シャトルバスの運行情報が見つかりませんでした。<br />
          情報が分かり次第、随時更新します。
        </p>
        <p v-else>
          バス停マーカーをタップすると時刻表が表示されます。
        </p>
      </div>
      <div v-else class="busstop-info">
        <h3>{{ selectingBusStop.label }}</h3>
        <div
          v-for="(route, index) in selectingBusStop.routes"
          :key="index"
          class="route"
        >
          <h4>行き先: {{ route.dest.label }}</h4>
          <dl class="route-data">
            <template v-if="route.duration">
              <dt>所要時間</dt>
              <dd>{{ route.duration }}</dd>
            </template>
            <template v-if="route.services.length === 1">
              <template v-if="route.services[0].interval">
                <dt>運行時間</dt>
                <dd class="period">
                  {{ dateString(route.services[0], luxonDateFormat) }}
                  {{ periodString(route.services[0].period, luxonTimeFormat) }}
                </dd>
                <dt>運行間隔</dt>
                <dd class="interval">{{ route.services[0].interval }}</dd>
              </template>
              <template v-else>
                <dt>時刻表</dt>
                <dd class="timetable-data">
                  <div class="service">
                    <dl>
                      <dt class="date">
                        {{ dateString(route.services[0], luxonDateFormat) }}
                      </dt>
                      <dd
                        v-for="(time, index) in route.services[0].timetable"
                        :key="route.services[0].date + index"
                        class="time"
                      >
                        {{ time }}
                      </dd>
                    </dl>
                  </div>
                </dd>
              </template>
            </template>
            <template v-else>
              <dt>時刻表</dt>
              <dd class="timetable-data">
                <div
                  v-for="(service, index) in route.services"
                  :key="index"
                  class="service"
                >
                  <dl>
                    <dt class="date">
                      {{ dateString(service, luxonDateFormat) }}
                    </dt>
                    <template v-if="service.interval">
                      <dt>運行時間</dt>
                      <dd class="period">
                        {{ periodString(service.period, luxonTimeFormat) }}
                      </dd>
                      <dt>運行間隔</dt>
                      <dd>{{ service.interval }}</dd>
                    </template>
                    <template v-else>
                      <dd
                        v-for="(time, index) in service.timetable"
                        :key="service.date + index"
                        class="time"
                      >
                        {{ time }}
                      </dd>
                    </template>
                  </dl>
                </div>
              </dd>
            </template>
          </dl>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import { DateTime } from "luxon";

import { BusStop, BusRoute, BusService, Period } from "@/model/interfaces";
import { plug as venuePlug } from "@/store/module/venues";
import { plug as busStopPlug } from "@/store/module/busStops";
import Map from "@/components/Map.vue";

@Component({
  components: {
    Map
  }
})
export default class ShuttleBus extends Vue {
  @Prop()
  id!: string;

  loading: boolean = false;

  selectingMarkerLabel: string = "";

  luxonDateFormat: string = "yyyy/LL/dd";
  luxonTimeFormat: string = "HH:mm";
  luxonDateTimeFormat: string = "yyyy/LL/dd HH:mm";

  get venue() {
    return venuePlug.read.getByName(this.$store)(this.id);
  }

  get sport() {
    return this.$route.query && this.$route.query.sport;
  }

  get disabled() {
    const queryDisabled = this.$route.query.disabled;
    return typeof queryDisabled === "boolean"
      ? queryDisabled
      : queryDisabled !== "false";
  }

  get eventLabel() {
    return this.disabled ? "福井しあわせ元気大会" : "福井しあわせ元気国体";
  }

  get isNotFound() {
    const busstops = this.busStops;
    return !busstops || busstops.length === 0;
  }

  get busStops() {
    const routeFilter = (route: BusRoute) =>
      route.event === this.eventLabel &&
      route.sport === this.sport &&
      this.isIncludeVenue(route.venues);
    return busStopPlug.read
      .getAll(this.$store)
      .filter(busstop => busstop.routes.find(routeFilter))
      .reduce(
        (prev, current) => [
          ...prev,
          {
            ...current,
            routes: current.routes.filter(routeFilter)
          }
        ],
        [] as BusStop[]
      );
  }

  get markers() {
    return this.busStops.map(busStop => ({
      latitude: busStop.latitude,
      longitude: busStop.longitude,
      color: busStop.color || "green",
      content: busStop.label,
      key: busStop.label
    }));
  }

  get selectingBusStop() {
    return this.busStops.find(
      busStop => busStop.label === this.selectingMarkerLabel
    );
  }

  get onlyInvited() {
    const sport = this.sport;
    return sport === "開会式" || sport === "閉会式";
  }

  markerClicked(key: string) {
    this.selectingMarkerLabel = key;
  }

  isIncludeVenue(venues: string[]): boolean {
    return this.venue !== undefined && venues.indexOf(this.venue.label) >= 0;
  }

  dateString(service: BusService, format: string) {
    if (service.date) {
      return DateTime.fromISO(service.date).toFormat(format);
    }
    return DateTime.fromISO(service.period.start_at).toFormat(format);
  }

  period(route: BusRoute) {
    const dateArray: string[] = route.services
      .map(service => service.date || "")
      .filter(date => date.length > 0)
      .sort();
    if (dateArray.length === 0) {
      return "不明";
    }
    return this.periodString(
      {
        start_at: dateArray[0],
        end_at: dateArray[dateArray.length - 1]
      } as Period,
      this.luxonDateFormat
    );
  }

  periodString(period: Period, format: string) {
    if (period.start_at === period.end_at) {
      return DateTime.fromISO(period.start_at).toFormat(format);
    }
    return `${DateTime.fromISO(period.start_at).toFormat(
      format
    )} 〜 ${DateTime.fromISO(period.end_at).toFormat(format)}`;
  }

  get busOpsStatus() {
    const eiheijiLink = "https://code4eiheiji.github.io/busmap/";
    const busOpsRecord: { [key: string]: string } = {
      // 永平寺緑の村ふれあいセンターアリーナ: eiheijiLink,
      // 永平寺緑の村ふれあいセンター: eiheijiLink,
      北陸電力福井体育館フレア: eiheijiLink
      // 松岡中学校体育館: eiheijiLink,
      // "松岡総合運動公園 you meパーク": eiheijiLink
    };
    return this.id in busOpsRecord ? busOpsRecord[this.id] : undefined;
  }
}
</script>
<style lang="postcss">
@import "@/styles/defines.css";

.bus-ops {
  padding: 0 1em;
}

.before-select {
  padding: 0 1em;
}

.route {
  overflow-y: scroll;
}

.busstop-info {
  padding: 0 1em;
  max-width: 400px;
  margin: auto;

  dl.route-data {
    margin: 0.5em 1em;

    dd {
      text-align: right;
      padding: 3px 0.5em;
    }

    dd.timetable-data {
      margin: 0;
      text-align: left;

      .service dl {
        margin: 3px 0;

        dt.date {
          background-color: $main-color;
          color: white;
          padding: 3px 0.5em;
          text-align: right;
        }
      }
    }
  }
}
</style>
