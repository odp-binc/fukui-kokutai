type Venue = {
  label: string;
  starts: string[];
};

export interface GameInfo {
  label: string;
  icon?: string;
  type: string;
  start: string[]; // ISO-8601
  venues: Venue[];
  summary?: string;
  kinds?: string[]; // 子要素名を重複値を削除してソートしたもの
  children?: GameInfo[];
  rule?: string;
  classified: string;
}

// 位置情報
export interface Location {
  label: string;
  address: string;
  // @ja odp:trafficGuide ?
  access?: string;
  latitude: number;
  longitude: number;
}

// 駐車場
export interface Parking {
  // "福井しあわせ元気大会" | "福井しあわせ元気国体"
  event: string; // [] a odp:SportEvent;schema:superEvent/rdfs:label ?event.
  sport: string; // [] a odp:SportEvent;rdfs:label ?sport.
  venue: string; // [] a odp:SportEvent;schema:location/rdfs:label ?venue.
  label: string; // rdfs:label
  address: string; // jrrk:address
  capacity: ParkingCapacity[];
  openingHours?: string; // jrrk:openingHours
  barrierFree?: boolean; // jrrk:hasBarrier-freeFacility
  limit?: string; // jrrk:canParked?
  latitude?: number; // geo:lat
  longitude?: number; // geo:long
}

// 駐車場収容台数
export interface ParkingCapacity {
  price?: string; // schema:price
  value?: number; // ic:駐車場/ic:収容台数
}

export enum EquipmentType {
  AED,
  Toilet
}
// 設備(AED? トイレ?)
export interface Equipment {
  type: EquipmentType;
  label: string;
  latitude: number;
  longitude: number;
}

// 観光
export interface TourismInfo {
  title: string;
  colors: {
    light: string;
    dark: string;
  };
  spots: Array<{
    label: {
      value: string;
      ruby: string;
    };
    image?: string;
    imageStyle?: string;
    introduction: string;
    description: string;
    address?: string[];
    tel?: string[];
    businessHours?: string[];
    holiday?: string[];
    price?: string[];
    access?: string[];
    barrierfreeEquipment?: string[];
    additional?: Array<{
      label: string;
      image: string;
      description: string;
    }>;
    subImages?: string[];
  }>;
}

// 喫茶店
export interface CoffeeShop {
  label: string;
  latitude: number;
  longitude: number;
  address?: string;
  tel?: string;
  businessHours?: string;
  memo?: string;
}

// タクシー
export interface TaxiInfo {
  label: string;
  latitude: number;
  longitude: number;
  address: string;
  tel: string;
  businessHours?: string;
  memo?: string;
}

// 選手情報
export interface Player {
  type: string; // 福井しあわせ元気(国体|大会)
  sport: Sport; // 出場競技の情報
  gender?: string; // 性別
  role: string; // 監督or選手
  name: string; // 氏名
  kana: string; // nameのカタカナ表記
  toCommute?: string;
  isHomePlayer: boolean;
  performance?: string[];
}

// 選手の出場競技情報
export interface Sport {
  type: string; // 福井しあわせ元気(国体|大会)
  label: string; // 競技名
  parent: string; // 競技名(大項目)
  child?: string; // 競技名(小項目)
  kinds?: string[]; // 種別
  events?: string[]; // 種目
  gender?: string; // 性別
  disability?: string; // 障害内容
}

// 交通規制情報
export interface TrafficRegulationRoute {
  id: string;
  regulation: string;
  note: string;
  geo_lines: number[][][];
}

export interface TrafficRegulationEvents {
  event: string;
  route_id: string;
  label: string;
  place: string;
  periods: Array<{
    start_at: string;
    end_at: string;
  }>;
}

export interface TrafficRegulation {
  routes: TrafficRegulationRoute[];
  events: TrafficRegulationEvents[];
}

// バス停
export interface BusStop {
  label: string; // バス停名
  latitude: number; // 緯度
  longitude: number; // 経度
  routes: BusRoute[];
  color?: string;
  type?: string; // 会場, 駅, P&BR
}

// バス路線
export interface BusRoute {
  event: string;
  sport: string;
  venues: string[];
  label: string;
  dest: BusStopInfo;
  duration?: string;
  services: BusService[];
}

// バス運行情報
export interface BusService {
  period: Period;
  interval: string | undefined;
  date: string | undefined;
  timetable: string[] | undefined;
}

// 期間
export interface Period {
  start_at: string; // 開始日時 iso8601
  end_at: string; // 終了日時 iso8601
}

// shuttle_bus.jsonを読み込むためのinterfaces
// バス停
export interface BusStopInfo {
  stop_id: number; // ID
  type: string; // '駅', 'P&BR' or '会場'
  label: string; // バス停名
  latitude: number; // 緯度
  longitude: number; // 経度
}

// shuttle_bus.jsonを読み込むためのinterfaces
// バス路線
export interface BusRouteInfo {
  route_id: number; // ID
  departure: number; // 出発地
  destination: number; // 行き先
  label: string; // 路線系統名
  duration?: string; // 片道所要時間
}

// shuttle_bus.jsonを読み込むためのinterfaces
// バス運行情報
export interface BusServiceInfo {
  route_id: number; // BusRouteのID
  route_reverse: boolean; // true なら復路(出発地と行き先を入れ替える)
  type: string; // '福井しあわせ元気国体' or '福井しあわせ元気大会'
  label: string; // 開催イベント名 or 競技名
  venues: string[]; // 会場名
  interval?: string; // 運行間隔
  period: Period; // 乗車時間
  date?: string;
  timetable?: string[];
}

export interface ShuttleBus {
  busstops: BusStopInfo[];
  routes: BusRouteInfo[];
  services: BusServiceInfo[];
}

export interface PlayerList {
  players: Player[];
}

export interface GameList {
  sports: GameInfo[];
  disabledSports: GameInfo[];
}

export interface Locations {
  locations: Location[];
}

// マーカー

export interface Marker {
  latitude: number;
  longitude: number;
  content?: string;
  color?: string;
  key?: string;
}
