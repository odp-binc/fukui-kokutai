<template>
  <div class="app-screen venue-traffic-regulations">
    <div v-if="!venue" class="not-found">
      対象の会場が見つかりませんでした。
    </div>
    <div v-else-if="aggregatedRegulationRoute.length > 0">
      <Map
        :latitude="venue.latitude"
        :longitude="venue.longitude"
        :lines="selectingRegulation ? selectingRegulation.geo_lines : []"
      />
      <p>{{ venue.label }}周辺の交通規制情報</p>
      <ul class="menu">
        <li
          v-for="regulation in aggregatedRegulationRoute"
          :key="regulation.id"
        >
          <button class="button" @click="select(regulation.id)">
            <dl>
              <dt class="regulation">{{ regulation.regulation }}</dt>
              <dd class="memo">{{ regulation.memo }}</dd>
              <dt>規制期間：</dt>
              <dd
                v-for="(interval, intervalIndex) in regulation.intervals"
                :key="intervalIndex"
                class="interval"
              >
                {{ interval }}
              </dd>
            </dl>
          </button>
        </li>
      </ul>
    </div>
    <p v-else>{{ venue.label }}周辺の交通規制情報はありません</p>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import { defaultFetcher as fetcher } from "@/model/fetcher";
import { plug as venuePlug } from "@/store/module/venues";
import { TrafficRegulation, TrafficRegulationEvents } from "@/model/interfaces";
import Map from "@/components/Map.vue";
import { DateTime } from "luxon";

@Component({
  components: {
    Map
  }
})
export default class VenueTrafficRegulation extends Vue {
  @Prop()
  id!: string;

  loading: boolean = false;
  regulations: TrafficRegulation | null = null;
  selecting: string | null = null;
  disabled: boolean | null = null;

  get venue() {
    return venuePlug.read.getByName(this.$store)(this.id);
  }

  get sport() {
    return this.$route.query && this.$route.query.sport;
  }

  get filterEvents() {
    const venue = this.venue;
    const place = venue ? venue.label : null;
    return (event: TrafficRegulationEvents) =>
      event.event === this.event &&
      event.place === place &&
      event.label === this.sport;
  }

  get selectingRegulation() {
    if (this.selecting === null || this.regulations === null) {
      return null;
    }
    return (
      this.regulations.routes.find(route => route.id === this.selecting) || null
    );
  }

  get event() {
    if (this.disabled === null && this.$route && this.$route.query) {
      const queryDisabled = this.$route.query.disabled;
      this.disabled =
        typeof queryDisabled === "boolean"
          ? queryDisabled
          : queryDisabled !== "false";
    }
    return this.disabled ? "福井しあわせ元気大会" : "福井しあわせ元気国体";
  }

  get aggregatedRegulationRoute() {
    const regulations = this.regulations;
    if (regulations === null) {
      return [];
    }
    const events = regulations.events.filter(this.filterEvents);
    return events
      .map(event => {
        const route = regulations.routes.find(
          route => route.id === event.route_id
        );
        if (route === undefined) {
          return undefined;
        }
        const intervals = event.periods
          .map(period => {
            return {
              start_at: DateTime.fromISO(period.start_at),
              end_at: DateTime.fromISO(period.end_at)
            };
          })
          .sort(
            (a, b) =>
              a.start_at.valueOf() - b.start_at.valueOf() ||
              a.end_at.valueOf() - b.end_at.valueOf()
          )
          .map(
            interval =>
              this.showDateTime(interval.start_at) +
              " 〜 " +
              this.showDateTime(interval.end_at)
          );
        return {
          id: route.id,
          regulation: route.regulation,
          memo: route.note,
          intervals: intervals
        };
      })
      .filter(Boolean);
  }

  select(route_id: string | null) {
    if (this.selecting === route_id) {
      route_id = null;
    }
    this.selecting = route_id;
  }

  created() {
    this.fetchData();
  }

  showDateTime(d: DateTime) {
    return d.toFormat("yyyy/LL/dd HH:mm");
  }

  fetchData() {
    if (!this.venue) {
      return;
    }
    this.loading = true;
    fetcher.getTrafficRegulation().then(data => {
      this.regulations = data;
    });
  }
}
</script>
<style lang="postcss">
.venue-traffic-regulations ul.menu {
  padding: 1em;
  box-sizing: border-box;
  .button {
    text-align: start;
    dl {
      margin: 0.5em;
      dd.memo {
        white-space: pre-wrap;
      }
      @media screen and (max-width: 370px) {
        margin: 2px;
        dd {
          &.interval {
            margin-left: 0px;
            text-align: right;
          }
        }
      }
    }
  }
}
</style>
