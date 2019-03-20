import { Route } from "vue-router";
import {
  GameList,
  Locations,
  Parking,
  Equipment,
  TourismInfo,
  Player,
  CoffeeShop,
  TaxiInfo,
  BusStop
} from "@/model/interfaces";

export interface AppState {
  sidebar: boolean;
  showDisabled: boolean;
}

export type SportState = GameList;
export type VenueState = Locations;

export interface ParkingState {
  parkings: Parking[];
}

export interface EquipmentState {
  equipments: Equipment[];
}

export interface TourismState {
  tourisms: TourismInfo[];
}

export interface PlayerState {
  players: Player[];
}

export interface SpotMapState {
  coffeeShops: CoffeeShop[];
  taxiInfo: TaxiInfo[];
}

export interface BusStopState {
  busStops: BusStop[];
}

export interface State {
  app: AppState;
  equipments: EquipmentState;
  route: Route;
  sports: SportState;
  venues: VenueState;
  parkings: ParkingState;
  tourisms: TourismState;
  players: PlayerState;
  spotMaps: SpotMapState;
  busStops: BusStopState;
}
