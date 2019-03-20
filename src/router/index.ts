import Router, { NavigationGuard, Route } from "vue-router";
import { Store } from "vuex";

// import HelloWorld from "@/components/HelloWorld.vue";
import { State } from "@/store/state";
import store from "@/store/index";
import { plug } from "@/store/module/sports";
import { plug as venuesPlug } from "@/store/module/venues";
import { plug as tourismPlug } from "@/store/module/tourisms";
import { plug as busStopPlug } from "@/store/module/busStops";

import { defaultFetcher as fetcher } from "@/model/fetcher";

// TODO:
// https://router.vuejs.org/ja/guide/advanced/lazy-loading.html#%E5%90%8C%E3%81%98%E3%83%81%E3%83%A3%E3%83%B3%E3%82%AF%E5%86%85%E3%81%A7%E3%81%AE%E3%82%B3%E3%83%B3%E3%83%9D%E3%83%BC%E3%83%8D%E3%83%B3%E3%83%88%E3%82%B0%E3%83%AB%E3%83%BC%E3%83%97%E5%8C%96
import Main from "@/view/Main.vue";
import PictFrame from "@/view/PictFrame.vue";
import SportSelect from "@/view/sports/Select.vue";
import SportDetail from "@/view/sports/Detail.vue";
import SportVenues from "@/view/sports/Venues.vue";
import VenueDetail from "@/view/venues/Detail.vue";
import VenueParkings from "@/view/venues/Parkings.vue";
import VenueEquipments from "@/view/venues/Equipments.vue";
import ParkingDetail from "@/view/parkings/Detail.vue";
import TourismList from "@/view/tourism/List.vue";
import TourismDetail from "@/view/tourism/Detail.vue";
import Acknowledgement from "@/view/Acknowledgement.vue";
import PlayerList from "@/view/players/List.vue";
import PlayerDetail from "@/view/players/Detail.vue";
import SpotMap from "@/view/SpotMap.vue";
import VenueShuttleBus from "@/view/venues/ShuttleBus.vue";
import VenueTrafficRegulation from "@/view/venues/TrafficRegulation.vue";
import SocialSites from "@/view/SocialSites.vue";

const fetchSportInfo: (
  disabledSports: boolean
) => NavigationGuard = disabledSports => (to, _from, next) => {
  const id = parseInt(to.params.id, 10);
  if (
    !plug.read.getSports(store)[disabledSports ? "disabledSports" : "sports"][
      id
    ]
  ) {
    plug.dispatch.getAll(store, { fetcher }).then(() => next());
    return;
  }
  next();
};

const fetchSportAndVenueInfo: (
  disabledSports: boolean
) => NavigationGuard = disabledSports => (to, _from, next) => {
  const id = parseInt(to.params.id, 10);
  Promise.resolve(id)
    .then(id => {
      if (
        !plug.read.getSports(store)[
          disabledSports ? "disabledSports" : "sports"
        ][id]
      ) {
        return plug.dispatch.getAll(store, { fetcher }).then(() => id);
      }
      return id;
    })
    .then((id: number) => {
      const sport = plug.read.getSports(store)[
        disabledSports ? "disabledSports" : "sports"
      ][id];
      const hasMissingVenues =
        sport &&
        sport.venues.reduce(
          (toLoad, venueId) =>
            !venuesPlug.read.getByName(store)(venueId.label) || toLoad,
          false
        );
      if (hasMissingVenues) {
        return venuesPlug.dispatch.getAll(store, {
          fetcher,
          ids: sport.venues.map(venue => venue.label)
        });
      }
      return;
    })
    .then(() => next());
};

function sportTitle(
  s: Store<State>,
  index: number,
  disabled: boolean,
  defaultValue: string
): string {
  const sports = disabled
    ? plug.read.getSports(s).disabledSports
    : plug.read.getSports(s).sports;
  const sport = sports[index];
  return (sport && sport.label) || defaultValue;
}

const router = new Router({
  routes: [
    {
      path: "/",
      name: "Main",
      component: Main
    },
    {
      path: "/acknowledgement",
      name: "Acknowledgement",
      meta: {
        title: "ライセンス情報"
      },
      component: Acknowledgement
    },
    {
      path: "/pict-frame",
      name: "PictFrame",
      meta: {
        title: "写真フレーム"
      },
      component: PictFrame
    },
    {
      path: "/social-sites",
      name: "SocialSites",
      meta: {
        title: "SNS公式アカウント"
      },
      component: SocialSites
    },
    {
      beforeEnter: fetchSportInfo(false),
      path: "/sports/:id",
      name: "SportSelect",
      meta: {
        title: (route: Route, s: Store<State>) =>
          sportTitle(s, parseInt(route.params.id, 10), false, "競技選択")
      },
      component: SportSelect,
      props: route => ({
        disabledSports: false,
        index: parseInt(route.params.id, 10)
      })
    },
    {
      beforeEnter: fetchSportInfo(false),
      path: "/sports/:id/detail",
      name: "SportDetail",
      meta: {
        title: (route: Route, s: Store<State>) =>
          sportTitle(s, parseInt(route.params.id, 10), false, "競技概要")
      },
      component: SportDetail,
      props: route => ({
        disabledSports: false,
        index: parseInt(route.params.id, 10)
      })
    },
    {
      beforeEnter: fetchSportAndVenueInfo(false),
      path: "/sports/:id/venue",
      name: "SportVenues",
      meta: {
        title: (route: Route, s: Store<State>) =>
          sportTitle(s, parseInt(route.params.id, 10), false, "会場選択")
      },
      component: SportVenues,
      props: route => ({
        disabledSports: false,
        index: parseInt(route.params.id, 10)
      })
    },
    {
      path: "/sports/:id/players",
      name: "SportPlayers",
      meta: {
        title: "福井県の選手情報"
      },
      component: PlayerList,
      props: route => ({
        disabledSports: false,
        index: parseInt(route.params.id, 10)
      })
    },
    {
      path: "/players/:sport/:name",
      name: "SportPlayersDetail",
      meta: {
        title: "福井県の選手情報"
      },
      component: PlayerDetail,
      props: route => ({
        sport: route.params.sport,
        name: route.params.name
      })
    },
    {
      path: "/disabledSports/:id",
      name: "DisabledSportSelect",
      beforeEnter: fetchSportInfo(true),
      meta: {
        title: (route: Route, s: Store<State>) =>
          sportTitle(s, parseInt(route.params.id, 10), true, "障スポ競技選択")
      },
      component: SportSelect,
      props: route => ({
        disabledSports: true,
        index: parseInt(route.params.id, 10)
      })
    },
    {
      beforeEnter: fetchSportInfo(true),
      path: "/disabledSports/:id/detail",
      name: "DisabledSportDetail",
      meta: {
        title: (route: Route, s: Store<State>) =>
          sportTitle(s, parseInt(route.params.id, 10), true, "競技概要")
      },
      component: SportDetail,
      props: route => ({
        disabledSports: true,
        index: parseInt(route.params.id, 10),
        name: route.params.name,
        sport: route.params.sport
      })
    },
    {
      beforeEnter: fetchSportAndVenueInfo(true),
      path: "/disabledSports/:id/venue",
      name: "DisabledSportVenues",
      meta: {
        title: (route: Route, s: Store<State>) =>
          sportTitle(s, parseInt(route.params.id, 10), true, "会場選択")
      },
      component: SportVenues,
      props: route => ({
        disabledSports: true,
        index: parseInt(route.params.id, 10)
      })
    },
    {
      path: "/disabledSports/:id/players",
      name: "DisabledSportPlayers",
      meta: {
        title: "福井県の選手情報"
      },
      component: PlayerList,
      props: route => ({
        disabledSports: true,
        index: parseInt(route.params.id, 10)
      })
    },
    {
      beforeEnter: (to, _from, next) => {
        const venue = venuesPlug.read.getByName(store)(to.params.id);
        if (venue) {
          next();
          return;
        }
        venuesPlug.dispatch
          .getAll(store, { fetcher, ids: [to.params.id] })
          .then(() => next());
      },
      path: "/venue/:id",
      name: "VenueDetail",
      meta: {
        title: (route: Route, s: Store<State>) => {
          const venue = venuesPlug.read.getByName(s)(route.params.id);
          return venue ? venue.label : "会場情報";
        }
      },
      component: VenueDetail,
      props: route => ({
        id: route.params.id
      })
    },
    {
      beforeEnter: (to, _from, next) => {
        const venue = venuesPlug.read.getByName(store)(to.params.id);
        if (venue) {
          next();
          return;
        }
        venuesPlug.dispatch
          .getAll(store, { fetcher, ids: [to.params.id] })
          .then(() => next());
      },
      path: "/venue/:id/parkings",
      name: "VenueParkings",
      meta: {
        title: "駐車場情報"
      },
      component: VenueParkings,
      props: route => ({
        id: route.params.id
      })
    },
    {
      beforeEnter: (to, _from, next) => {
        const venue = venuesPlug.read.getByName(store)(to.params.id);
        if (venue) {
          next();
          return;
        }
        venuesPlug.dispatch
          .getAll(store, { fetcher, ids: [to.params.id] })
          .then(() => next());
      },
      path: "/venue/:id/traffic-regulation",
      name: "VenueTrafficRegulation",
      meta: {
        title: "交通規制情報"
      },
      component: VenueTrafficRegulation,
      props: route => ({
        id: route.params.id
      })
    },
    {
      beforeEnter: (to, _from, next) => {
        const venue = venuesPlug.read.getByName(store)(to.params.id);
        const busStops = busStopPlug.read.getAll(store);
        return Promise.all([
          venue
            ? Promise.resolve()
            : venuesPlug.dispatch.getAll(store, {
                fetcher,
                ids: [to.params.id]
              }),
          busStops.length > 0
            ? Promise.resolve()
            : busStopPlug.dispatch.getAll(store, { fetcher })
        ]).finally(() => next());
      },
      path: "/venue/:id/shuttlebus",
      name: "VenueShuttleBus",
      meta: {
        title: "シャトルバス"
      },
      component: VenueShuttleBus,
      props: route => ({
        id: route.params.id
      })
    },
    {
      beforeEnter: (to, _from, next) => {
        const venue = venuesPlug.read.getByName(store)(to.params.id);
        if (venue) {
          next();
          return;
        }
        venuesPlug.dispatch
          .getAll(store, { fetcher, ids: [to.params.id] })
          .then(() => next());
      },
      path: "/venue/:id/equipments",
      name: "VenueEquipmentsList",
      meta: {
        title: "多目的トイレ・AED"
      },
      component: VenueEquipments,
      props: route => ({
        id: route.params.id
      })
    },
    {
      path: "/parking/:id",
      name: "ParkingDetail",
      meta: {
        title: "駐車場情報"
      },
      component: ParkingDetail,
      props: route => ({
        id: route.params.id
      })
    },
    {
      path: "/tourism",
      name: "TourismList",
      meta: {
        title: "観光情報"
      },
      component: TourismList
    },
    {
      beforeEnter: (to, _from, next) => {
        const tourism = tourismPlug.read.getByTitle(store)(to.params.id);
        if (tourism) {
          next();
          return;
        }
        tourismPlug.dispatch.getAll(store, { fetcher }).then(() => next());
      },
      path: "/tourism/:id",
      name: "TourismDetail",
      meta: {
        title: (route: Route, s: Store<State>) => {
          const tourism = tourismPlug.read.getByTitle(s)(route.params.id);
          return tourism ? tourism.title : "観光情報";
        }
      },
      component: TourismDetail,
      props: route => ({
        title: route.params.id
      })
    },
    {
      path: "/spotmap",
      name: "SpotMap",
      meta: {
        title: "タクシー・喫茶店"
      },
      component: SpotMap
    }
  ]
});

export default router;
