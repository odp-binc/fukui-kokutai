import { shallowMount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";

import { Parking } from "@/model/interfaces";
import MapComponent from "@/components/Map.vue";
import { createStore } from "@/store/store";
import { plug } from "@/store/module/parks";
import Detail from "@/view/parkings/Detail.vue";

const localVue = createLocalVue();
localVue.use(Vuex);

describe("view/parkigns/Detail.vue", () => {
  describe("Map", () => {
    describe("位置情報データがあれば地図を表示する", () => {
      const subjects: Parking[] = [
        {
          event: "福井しあわせ元気国体",
          sport: "競技",
          venue: "競技会場",
          label: "駐車場1",
          address: "駐車場住所1",
          capacity: [],
          latitude: 135,
          longitude: 50
        },
        {
          event: "福井しあわせ元気国体",
          sport: "競技",
          venue: "競技会場",
          label: "駐車場2",
          address: "駐車場住所2",
          capacity: [],
          latitude: 0,
          longitude: 0
        }
      ];

      const store = createStore();
      plug.commit.setAll(store, subjects);
      const fetchAllStub = jest.fn().mockImplementation(() => {
        return subjects;
      });
      plug.dispatch.getAll = fetchAllStub;

      subjects.forEach(subject => {
        it(`緯度${subject.latitude}, 経度${
          subject.longitude
        }のときに地図を表示する`, () => {
          const wrapper = shallowMount(Detail, {
            localVue,
            store,
            propsData: {
              id: subject.label
            },
            mocks: {
              $route: {
                query: {
                  sport: subject.sport,
                  disabled: subject.event === "福井しあわせ元気大会"
                }
              }
            }
          });
          return localVue.nextTick().then(() => {
            expect(wrapper.find(MapComponent).exists()).toBeTruthy();
          });
        });
      });
    });
    it("位置情報データがなければ表示しない", () => {
      const subjects: Parking[] = [
        {
          event: "福井しあわせ元気国体",
          sport: "競技",
          venue: "競技会場",
          label: "駐車場1",
          address: "駐車場住所1",
          capacity: []
        }
      ];
      const subject = subjects[0];

      const store = createStore();
      plug.commit.setAll(store, subjects);

      const wrapper = shallowMount(Detail, {
        localVue,
        store,
        propsData: {
          id: subject.label
        },
        mocks: {
          $route: {
            query: {
              sport: subject.sport,
              disabled: subject.event === "福井しあわせ元気大会"
            }
          }
        }
      });
      expect(wrapper.find(MapComponent).exists()).toBeFalsy();
    });
  });
});
