<template>
  <div class="app-screen sports-venues">
    <div v-if="!sport" class="not-found">
      対象の競技が見つかりませんでした。
    </div>
    <div v-else>
      <p class="message">会場一覧</p>
      <ul class="menu content-menu">
        <li v-for="(venue, index) in sport.venues" :key="index" class="venue">
          <router-link
            :to="{
              name: 'VenueDetail',
              params: { id: venue.label },
              query: { sport: sport.label, disabled: disabledSports }
            }"
            class="button"
          >
            {{ venue.label }}<br />
            {{ getVenue(venue.label).address }}<br />
            <div
              v-for="sports in getSportsFromVenue(venue.label)"
              :key="sports.label"
              class="event-date"
            >
              <span class="nowrap">{{ sports.label }}</span>
              <span class="nowrap">{{ getDateRange(sports.starts) }}</span>
            </div>
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import { plug } from "@/store/module/sports";
import { Location } from "@/model/interfaces";
import { plug as venuePlug } from "@/store/module/venues";
import { DateTime } from "luxon";
import { getSportsFromVenue } from "@/model/gameInfoHelper";

@Component
export default class SportsVenues extends Vue {
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

  showIso(iso: string): string {
    return DateTime.fromISO(iso).toFormat("yyyy/LL/dd HH:mm:ss");
  }

  getVenue(id: string): Location {
    return (
      venuePlug.read.getByName(this.$store)(id) || {
        label: id,
        address: "住所不明",
        access: "アクセス先不明",
        latitude: NaN,
        longitude: NaN
      }
    );
  }

  getDateRange(starts: string[]): string {
    const dateTimes = starts
      .map(start => DateTime.fromISO(start))
      .sort((a, b) => a.valueOf() - b.valueOf());
    if (dateTimes.length < 1) {
      return "期間不明";
    }
    const chunk = dateTimes.reduce(
      (prev: Array<{ start: DateTime; end: DateTime }>, current) => {
        if (prev.length < 1) {
          return [{ start: current, end: current }];
        }
        const last = prev[prev.length - 1];
        const toDivide =
          current
            .startOf("day")
            .diff(last.end.startOf("day"), "days")
            .as("days") > 1;
        return toDivide
          ? prev.concat({ start: current, end: current })
          : prev.slice(0, -1).concat({ start: last.start, end: current });
      },
      []
    );

    return chunk
      .map(c => {
        const isSame =
          c.start.startOf("day").valueOf() === c.end.startOf("day").valueOf();
        return (
          `${c.start.toFormat("yyyy/LL/dd")}` +
          (isSame ? "" : ` - ${c.end.toFormat("yyyy/LL/dd")}`)
        );
      })
      .join(", ");
  }

  getSportsFromVenue(venueId: string) {
    return this.sport === undefined
      ? []
      : getSportsFromVenue(this.sport, venueId);
  }
}
</script>
<style lang="postcss">
.sports-venues {
  .message {
    margin: 0.5em;
    color: green;
  }

  ul.menu {
    padding: 1em;
    box-sizing: border-box;
    .button {
      text-align: start;
      max-width: 500px;
      margin: auto;
    }
    li.venue .button {
      padding: 4px 10px;

      .event-date {
        text-align: right;
        padding: 4px;
        .nowrap {
          white-space: nowrap;
        }
      }
    }
  }
}
</style>
