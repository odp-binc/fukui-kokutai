import { LatLngBoundsExpression, LatLngBounds } from "leaflet";
import N3 from "n3";
import RDF from "rdf-js";
import { DateTime } from "luxon";

import {
  GameInfo,
  GameList,
  Locations,
  Parking,
  Equipment,
  EquipmentType,
  TourismInfo,
  Player,
  CoffeeShop,
  TaxiInfo,
  BusStop,
  BusRoute,
  BusService,
  BusStopInfo,
  BusRouteInfo,
  BusServiceInfo,
  TrafficRegulation
} from "@/model/interfaces";

import { prefixes } from "@/model/const";
import { mapToRecordStr } from "@/model/fixRecords";
import { comparatorChildren } from "@/model/sorter";
import tourismData from "./tourism.json";
import coffeeShopsData from "./coffeeshops.json";
import iconRecords from "./sports_iconinfo.json";
import taxiData from "./taxiinfo.json";
import trafficRegulations from "./trafficregulations.json";
import sportsOrderRecords from "./sports_order.json";
import parkingRecords from "./parking.json";
import PlayerData from "./players.json";
import shuttleBusData from "./shuttle_bus.json";

const sparqlEndpoint = "https://sparql.odp.jig.jp/api/v1/sparql";

export interface BindingLiteralNode {
  type: "literal";
  value: string;
  "xml:lang"?: string;
  datatype?: string;
}

export function jsonifyBinds(binds: {
  [key: string]: BindingLiteralNode;
}): { [key: string]: any } {
  return Object.keys(binds).reduce((prev, key) => {
    const v = ((node: BindingLiteralNode) => {
      if (!("datatype" in node)) {
        return node.value;
      }
      const floatType = "http://www.w3.org/2001/XMLSchema#float";
      const doubleType = "http://www.w3.org/2001/XMLSchema#double";
      if (node.datatype === floatType || node.datatype === doubleType) {
        return parseFloat(node.value);
      }
      throw new Error("not implemented");
    })(binds[key]);
    return { ...prev, [key]: v };
  }, {});
}

function isLiteral(term: RDF.Term): term is RDF.Literal {
  return term.termType === "Literal";
}

function parseN3(str: string): Promise<N3.N3Store> {
  const parser = new N3.Parser();
  return new Promise<N3.N3Store>((res, rej) => {
    const store = N3.Store();
    parser.parse(str, (err, quad, prefixed) => {
      if (err) {
        rej(err);
      }
      if (quad !== null) {
        store.addQuad(quad);
      }
      if (quad === null && prefixed) {
        res(store);
      }
    });
  });
}

function getValueFromQuads(predicate: RDF.NamedNode, datas: N3.Quad[]) {
  const quads = datas.filter(quad => quad.predicate.equals(predicate));
  if (quads.length < 1) {
    return undefined;
  }
  return quads.sort((a, b) => sortTerm(a.object, b.object))[0].object.value;
}

export function sortTerm(a: RDF.Term, b: RDF.Term) {
  if (isLiteral(a) && isLiteral(b)) {
    const langIndex = ["en", "", "ja"];
    const aLang = langIndex.indexOf(a.language);
    const bLang = langIndex.indexOf(b.language);
    const diffLang = bLang - aLang;
    return diffLang === 0 ? a.value.localeCompare(b.value) : diffLang;
  }
  return a.value.localeCompare(b.value);
}

function sortGameInfoByRecord(
  key: "福井しあわせ元気国体" | "福井しあわせ元気大会"
) {
  return (a: GameInfo, b: GameInfo) => {
    const records = sportsOrderRecords[key];
    const aRecord = Object.values(records).find(
      r => (r && r.label) === mapToRecordStr(a.label)
    );
    const bRecord = Object.values(records).find(
      r => (r && r.label) === mapToRecordStr(b.label)
    );
    if (aRecord === undefined && bRecord === undefined) {
      return a.label.localeCompare(b.label);
    } else if (aRecord === undefined) {
      return 1;
    } else if (bRecord === undefined) {
      return -1;
    }

    return aRecord.order - bRecord.order;
  };
}

/**
 * 子のsummaryがすべて同じなら親のsummaryに変えて子を消す
 */
function squashChildBySummary(sport: GameInfo): GameInfo {
  if (!(sport.children && sport.children.length)) {
    return sport;
  }
  // 親のsummaryが無くて、子のsummaryが全部同じなら、親のsummaryに格上げ
  const summary =
    sport.summary ||
    sport.children
      .map(child => child.summary)
      .filter((value, index, array) => array.indexOf(value) === index)
      .filter((_v, _i, array) => array.length === 1)
      .shift();
  const comparator = comparatorChildren(sport.type, sport.label);
  const children = sport.children
    .map(child => ({
      ...child,
      summary: child["summary"] === summary ? undefined : child["summary"]
    }))
    .sort((a, b) => comparator(a.label, b.label));
  return {
    ...sport,
    children,
    summary
  };
}

export default class Fetcher {
  public async getGameList(): Promise<GameList> {
    // RDFProps

    const rdfType = N3.DataFactory.namedNode(
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
    );
    const odpSportEvent = N3.DataFactory.namedNode(
      "http://odp.jig.jp/odp/1.0#SportEvent"
    );

    const rdf = {
      x: {
        label: N3.DataFactory.namedNode("http://happy.e-fas.net/#/vocav/label"),
        start: N3.DataFactory.namedNode("http://happy.e-fas.net/#/vocav/start"),
        venues: N3.DataFactory.namedNode(
          "http://happy.e-fas.net/#/vocav/venues"
        ),
        children: N3.DataFactory.namedNode(
          "http://happy.e-fas.net/#/vocav/children"
        ),
        parent: N3.DataFactory.namedNode(
          "http://happy.e-fas.net/#/vocav/parent"
        ),
        summary: N3.DataFactory.namedNode(
          "http://happy.e-fas.net/#/vocav/summary"
        ),
        classified: N3.DataFactory.namedNode(
          "http://happy.e-fas.net/#/vocav/classified"
        )
      }
    };

    const queryWithoutChildren = `
      ${prefixes}
      PREFIX x: <http://happy.e-fas.net/#/vocav/>

      CONSTRUCT {
        ?sportIRI a odp:SportEvent;
           x:label ?label;
           x:icon ?icon;

           x:start ?start;
           x:venues ?venueIRI;
           x:summary ?summary;
           x:parent ?parent;
           x:classified ?classified;
           x:id ?s.
        ?venueIRI a odp:SportVenue;
             x:label ?venue;
             x:start ?start.
      } WHERE {
        ?s a odp:SportEvent;
        odp:classfied/rdfs:label ?classified;
        rdfs:label ?label;
        schema:superEvent/rdfs:label ?parent;
        schema:location/rdfs:label ?venue.
        optional {
          ?s schema:startDate ?start.
        }
        OPTIONAL {
          ?s schema:image ?icon.
        }
        ?s schema:description ?summary.
        optional {
          ?s odp:type/odp:refAge/rdfs:label ?age.
        }
        optional {
          ?s odp:type/odp:refSex/rdfs:label ?sex.
        }
        MINUS {
          ?s odp:type/rdfs:label [].
        }

        BIND(IRI(CONCAT("urn:happy.e-fas.net:",$parent,":",?label)) AS ?sportIRI)
        BIND(IRI(CONCAT("urn:happy.e-fas.net:",$parent,":",?label,":",REPLACE(?venue,"[\\\\s]","_"))) AS ?venueIRI)
      }`;
    const queryWithChildren = `
      ${prefixes}
      PREFIX x: <http://happy.e-fas.net/#/vocav/>

      construct {
        ?sportIRI a odp:SportEvent;
           x:label ?label;
           x:children $childIRI ;
           x:start ?start;
           x:venues ?venueIRI;
           x:parent ?parent;
           x:classified ?classified;
           x:id ?s.
        ?venueIRI a odp:SportVenue;
             x:label ?venue;
             x:start ?start.
        ?childIRI x:label ?children;
             x:summary ?summary;
             x:age ?age;
             x:sex ?sex;
             x:start ?start;
             x:venues ?venueIRI;
             x:icon ?icon.
      } where {
        ?s a odp:SportEvent;
        odp:classfied/rdfs:label ?classified;
        rdfs:label ?label;
        schema:superEvent/rdfs:label ?parent;
        schema:location/rdfs:label ?venue.
        optional {
          ?s schema:startDate ?start.
        }
        optional {
          ?s schema:image ?icon.
        }
        optional {
          ?s schema:description ?summary.
          filter(langmatches(lang(?summary), "ja"))
        }
        ?s odp:type/rdfs:label ?children.

        optional {
          ?s odp:type/odp:refAge/rdfs:label ?age.
        }
        optional {
          ?s odp:type/odp:refSex/rdfs:label ?sex.
        }

        bind(IRI(CONCAT("urn:happy.e-fas.net:",$parent,":",?label)) as ?sportIRI)
        BIND(IRI(CONCAT("urn:happy.e-fas.net:",$parent,":",?label,":",REPLACE(?venue,"[\\\\s]","_"))) AS ?venueIRI)
        BIND(IRI(CONCAT("urn:happy.e-fas.net:",$parent,":",?label,":",REPLACE(?children,"[\\\\s]","_"),":",COALESCE(?age, ""),COALESCE(?sex, ""))) AS ?childIRI)
      }`;

    const withoutChildren = fetch(
      `${sparqlEndpoint}?query=` + encodeURIComponent(queryWithoutChildren),
      {
        headers: {
          Accept: "text/turtle"
        }
      }
    )
      .then(resp => {
        if (resp.status !== 200) {
          throw new Error("not expected response");
        }
        return resp;
      })
      .then(resp => resp.text())
      .then(parseN3)
      .then(store => {
        const sports: GameInfo[] = store
          .getSubjects(rdfType, odpSportEvent, null)
          .map(subjects => {
            const datas = store.getQuads(subjects, null, null, null);
            const label = getValueFromQuads(rdf.x.label, datas) || "競技情報";
            const icon = (() => {
              const iconLabel = mapToRecordStr(label);
              const iconRecord = (iconRecords as any)[iconLabel];
              return iconRecord ? (iconRecord.path as string) : undefined;
            })();
            const starts = datas
              .filter(quad => quad.predicate.equals(rdf.x.start))
              .map(quad => quad.object.value);
            return {
              label,
              icon,
              type: getValueFromQuads(rdf.x.parent, datas) || "不明",
              start: starts,
              venues: datas
                .filter(quad => quad.predicate.equals(rdf.x.venues))
                .map(quad => {
                  const datas = store.getQuads(quad.object, null, null, null);
                  const label =
                    getValueFromQuads(rdf.x.label, datas) || "会場名不明";
                  const starts = datas
                    .filter(quad => quad.predicate.equals(rdf.x.start))
                    .map(quad => quad.object.value);
                  return {
                    label,
                    starts
                  };
                }),
              summary: getValueFromQuads(rdf.x.summary, datas),
              classified:
                getValueFromQuads(rdf.x.classified, datas) || "区分不明"
            };
          });
        return sports;
      });

    const withChildren = fetch(
      `${sparqlEndpoint}?query=` + encodeURIComponent(queryWithChildren),
      {
        headers: {
          Accept: "text/turtle"
        }
      }
    )
      .then(resp => resp.text())
      .then(parseN3)
      .then(store => {
        const sports: GameInfo[] = store
          .getSubjects(rdfType, odpSportEvent, null)
          .filter(
            subject =>
              store.getQuads(null, rdf.x.children, subject, null).length < 1
          )
          .map(subjects => {
            const datas = store.getQuads(subjects, null, null, null);
            const label = getValueFromQuads(rdf.x.label, datas) || "競技情報";
            const type = getValueFromQuads(rdf.x.parent, datas) || "不明";
            const children = store
              .getObjects(
                subjects,
                "http://happy.e-fas.net/#/vocav/children",
                null
              )
              .map(child => {
                const datas = store.getQuads(child, null, null, null);
                const childLabel =
                  getValueFromQuads(rdf.x.label, datas) || "競技情報";
                const fixedChildLabel = mapToRecordStr(childLabel);

                const icon =
                  (iconRecords as any)[label] &&
                  (iconRecords as any)[label].children &&
                  (iconRecords as any)[label].children[fixedChildLabel]
                    ? ((iconRecords as any)[label].children[fixedChildLabel]
                        .path as string)
                    : undefined;
                const starts = datas
                  .filter(quad => quad.predicate.equals(rdf.x.start))
                  .map(quad => quad.object.value);
                const venues = datas
                  .filter(quad => quad.predicate.equals(rdf.x.venues))
                  .map(venueQuad => {
                    return (
                      getValueFromQuads(
                        rdf.x.label,
                        store.getQuads(venueQuad.object, null, null, null)
                      ) || "会場名不明"
                    );
                  });
                const summary = getValueFromQuads(rdf.x.summary, datas);
                return {
                  label: childLabel,
                  icon,
                  summary,
                  type,
                  start: starts,
                  venues: venues.map(label => ({
                    label,
                    starts
                  })),
                  classified: ""
                };
              });
            const kinds = children
              .map(child => child.label)
              .filter((value, index, array) => array.indexOf(value) === index)
              .sort(comparatorChildren(type, label));
            const icon = (() => {
              const iconLabel = mapToRecordStr(label);
              const iconRecord = (iconRecords as any)[iconLabel];
              return iconRecord ? (iconRecord.path as string) : undefined;
            })();
            const starts = datas
              .filter(quad => quad.predicate.equals(rdf.x.start))
              .map(quad => quad.object.value);

            return {
              kinds,
              children,
              label,
              icon,
              type,
              start: starts,
              venues: datas
                .filter(quad => quad.predicate.equals(rdf.x.venues))
                .map(quad => {
                  const datas = store.getQuads(quad.object, null, null, null);
                  const label =
                    getValueFromQuads(rdf.x.label, datas) || "会場名不明";
                  const starts = datas
                    .filter(quad => quad.predicate.equals(rdf.x.start))
                    .map(quad => quad.object.value);
                  return {
                    label,
                    starts
                  };
                }),
              summary: undefined,
              classified:
                getValueFromQuads(rdf.x.classified, datas) || "区分不明"
            };
          });
        return sports;
      });

    const openingCeremony = DateTime.local(2018, 9, 29);
    const openingDisabledCeremony = DateTime.local(2018, 10, 13);
    const closingCeremony = DateTime.local(2018, 10, 9);
    const closingDisabledCeremony = DateTime.local(2018, 10, 15);

    const showOpening = openingCeremony.diffNow().valueOf() >= 0;
    const showDisabledOpening =
      openingDisabledCeremony.diffNow().valueOf() >= 0;

    const ceremony: GameInfo = {
      label: showOpening ? "開会式" : "閉会式",
      icon: "/static/character/torch.png",
      type: "福井しあわせ元気国体",
      start: [(showOpening ? openingCeremony : closingCeremony).toISO()],
      venues: [
        {
          label: "9.98スタジアム",
          starts: [(showOpening ? openingCeremony : closingCeremony).toISO()]
        }
      ],
      summary:
        "タイムテーブルは https://fukui2018.pref.fukui.lg.jp/kokutai/open-closing_ceremony/ から確認できます",
      classified: "イベント"
    };

    const disabledCeremony: GameInfo = {
      label: showDisabledOpening ? "開会式" : "閉会式",
      icon: "/static/character/torch_wheelchair.png",
      type: "福井しあわせ元気大会",
      start: [
        (showDisabledOpening
          ? openingDisabledCeremony
          : closingDisabledCeremony
        ).toISO()
      ],
      venues: [
        {
          label: "9.98スタジアム",
          starts: [
            (showDisabledOpening
              ? openingDisabledCeremony
              : closingDisabledCeremony
            ).toISO()
          ]
        }
      ],
      summary:
        "タイムテーブルは https://fukui2018.pref.fukui.lg.jp/taikai/open-closing_ceremony_taikai/ から確認できます",
      classified: "イベント"
    };

    return Promise.all([withoutChildren, withChildren])
      .then(results => {
        return results.reduce((a, b) => a.concat(b));
      })
      .then(sports => ({
        sports: [ceremony].concat(
          sports
            .filter(sport => sport.type === "福井しあわせ元気国体")
            .reduce(
              (prev, current) => {
                const same = prev.findIndex(r => r.label === current.label);
                return same < 0
                  ? [...prev, current]
                  : prev.map((r, index) =>
                      same === index
                        ? {
                            ...current,
                            ...r,
                            venues: current.venues.concat(r.venues)
                          }
                        : r
                    );
              },
              [] as GameInfo[]
            ) // 同じものがあれば同一にする
            .map(squashChildBySummary)
            .map(sport => ({
              ...sport,
              venues: sport.venues.sort((a, b) =>
                a.label.localeCompare(b.label)
              )
            }))
            .sort(sortGameInfoByRecord("福井しあわせ元気国体"))
        ),
        disabledSports: [disabledCeremony].concat(
          sports
            .filter(sport => sport.type !== "福井しあわせ元気国体")
            .reduce(
              (prev, current) => {
                const same = prev.findIndex(r => r.label === current.label);
                return same < 0
                  ? [...prev, current]
                  : prev.map((r, index) =>
                      same === index
                        ? {
                            ...current,
                            ...r,
                            venues: current.venues.concat(r.venues)
                          }
                        : r
                    );
              },
              [] as GameInfo[]
            ) // 同じものがあれば同一にする
            .map(squashChildBySummary)
            .map(sport => ({
              ...sport,
              venues: sport.venues.sort((a, b) =>
                a.label.localeCompare(b.label)
              )
            }))
            .sort(sortGameInfoByRecord("福井しあわせ元気大会"))
        )
      }));
  }

  public async getSportsVenues(labels: string[]): Promise<Locations> {
    const query = `${prefixes}
    select distinct ?label ?latitude ?longitude ?access ?address {
      ?s a odp:SportVenue;
      rdfs:label ?label;
      ic:住所/ic:表記 ?address;
      geo:lat ?latitude;
      geo:long ?longitude.
      optional {
        ?s odp:trafficGuide ?access;
        filter(langMatches(lang(?access), "ja"))
      }
      # filter(?label in ("鯖江市スポーツ交流館"@ja))
      filter(?label in (${labels
        .map(v => JSON.stringify(v) + "@ja")
        .join(",")}))
    }`;

    return fetch(`${sparqlEndpoint}?query=` + encodeURIComponent(query))
      .then(resp => resp.json())
      .then(v => ({
        locations: v.results.bindings.map((w: any) => ({
          ...jsonifyBinds(w)
        }))
      }));
  }

  public async getParkings(
    _boundsParam: LatLngBoundsExpression
  ): Promise<Parking[]> {
    return parkingRecords;
  }

  public async getEquipments(
    boundsParam: LatLngBoundsExpression
  ): Promise<Equipment[]> {
    const bounds =
      boundsParam instanceof LatLngBounds
        ? boundsParam
        : new LatLngBounds(boundsParam);

    const query = (type: string) => `
      ${prefixes}
      select * {
        [] a ${type};
          rdfs:label ?label;
          geo:lat ?latitude;
          geo:long ?longitude.
        filter(
          ${bounds.getSouth()} <= ?latitude && ?latitude <= ${bounds.getNorth()}
          && ${bounds.getWest()} <= ?longitude && ?longitude <= ${bounds.getEast()})
     } limit 10000`;

    const fetchAED = fetch(
      `${sparqlEndpoint}?query=` + encodeURIComponent(query("jrrk:AED"))
    )
      .then(resp => resp.json())
      .then(v =>
        v.results.bindings.map((w: any) => ({
          ...jsonifyBinds(w),
          type: EquipmentType.AED
        }))
      );

    const fetchToilet = fetch(
      `${sparqlEndpoint}?query=` +
        encodeURIComponent(query("jrrk:PublicToilet"))
    )
      .then(resp => resp.json())
      .then(v =>
        v.results.bindings.map((w: any) => ({
          ...jsonifyBinds(w),
          type: EquipmentType.Toilet
        }))
      );
    return Promise.all([fetchAED, fetchToilet]).then(arr =>
      arr.reduce((a, b) => a.concat(b), [])
    );
  }

  // 観光情報を取得する
  public async getTourisms(): Promise<TourismInfo[]> {
    return tourismData;
  }

  public async getPlayers(): Promise<Player[]> {
    return PlayerData;
  }

  public async getCoffeeShops(): Promise<CoffeeShop[]> {
    return coffeeShopsData;
  }

  public async getTrafficRegulation(): Promise<TrafficRegulation> {
    return trafficRegulations;
  }

  public async getTaxiInfo(): Promise<TaxiInfo[]> {
    const memoInfoTable: [string, (v: any) => string][] = [
      ["url", v => `URL: ${v}`],
      ["email", v => `Eメール: ${v}`],
      ["fax", v => `FAX: ${v}`],
      ["num_all", v => `車両数: ${v}`],
      ["num_fukushi", v => `車椅子など利用可能な福祉車両数: ${v}`],
      ["num_jumbo", v => `ジャンボタクシー: ${v}`],
      ["num_kanko", v => `観光ガイド数: ${v}`],
      ["num_shindai_kurumaisu", v => `寝台・車椅子兼用: ${v}`]
    ];
    return taxiData.map(info => ({
      label: info.label,
      latitude: info.latitude,
      longitude: info.longitude,
      address: info.address,
      tel: info.tel.join(", "),
      memo: memoInfoTable.reduce(
        (str, table) =>
          table[0] in info ? table[1]((info as any)[table[0]]) : str,
        ""
      )
    }));
  }

  public async getBusStop(): Promise<BusStop[]> {
    const busStops = shuttleBusData.busstops;
    const colorMap: { [key: string]: string } = {
      会場: "green",
      駅: "blue",
      "P&BR": "cyan"
    };
    return busStops.map(busStop => {
      return {
        label: busStop.label,
        latitude: busStop.latitude,
        longitude: busStop.longitude,
        routes: shuttleBusData.routes
          .filter(
            route =>
              route.departure === busStop.stop_id ||
              route.destination === busStop.stop_id
          )
          .map(route => {
            return shuttleBusData.services.filter(
              service =>
                service.route_id === route.route_id &&
                busStop.stop_id ===
                  (service.route_reverse ? route.destination : route.departure)
            );
          })
          .reduce((a, b) => a.concat(b), [])
          .sort(
            (a, b) =>
              DateTime.fromISO(a.period.start_at).valueOf() -
              DateTime.fromISO(b.period.start_at).valueOf()
          )
          .map((service: BusServiceInfo) => {
            const route = shuttleBusData.routes.find(
              r => r.route_id === service.route_id
            ) as BusRouteInfo | undefined;
            if (!route) {
              return undefined;
            }
            const dest_id = service.route_reverse
              ? route.departure
              : route.destination;
            const dest = shuttleBusData.busstops.find(
              r => r.stop_id === dest_id
            );
            return {
              route: route,
              service: service,
              dest: dest
            } as {
              route: BusRouteInfo;
              service: BusServiceInfo;
              dest: BusStopInfo;
            };
          })
          .reduce(
            (prev, current) => {
              if (!current) {
                return prev;
              }
              const service: BusService = {
                period: current.service.period,
                interval: current.service.interval,
                date: current.service.date,
                timetable: current.service.timetable
              };
              const route = prev.find(
                route =>
                  route.event === current.service.type &&
                  route.sport === current.service.label &&
                  route.label === current.route.label &&
                  route.dest === current.dest
              );
              if (route) {
                route.services.push(service);
                return prev;
              }
              return [
                ...prev,
                {
                  event: current.service.type,
                  sport: current.service.label,
                  venues: current.service.venues,
                  label: current.route.label,
                  dest: current.dest,
                  duration: current.route.duration,
                  services: [service]
                }
              ];
            },
            [] as BusRoute[]
          ),
        color: colorMap[busStop.type],
        type: busStop.type
      };
    });
  }
}

const defaultFetcher = new Fetcher();

export { defaultFetcher };
