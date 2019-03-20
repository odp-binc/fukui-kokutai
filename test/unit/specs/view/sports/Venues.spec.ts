import { shallowMount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";

import { createStore } from "@/store/store";
import { plug } from "@/store/module/sports";
import Venues from "@/view/sports/Venues.vue";

const localVue = createLocalVue();
localVue.use(Vuex);

const image =
  "data:image/bmp;base64,Qk2OAAAAAAAAAIoAAAB8AAAAAQAAAAEAAAABABgAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAD/AAD/AAAAAAAA/0JHUnOAwvUoYLgeFSCF6wFAMzMTgGZmJkBmZgagmZkJPArXAyRcjzIAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAApqWVAA==";

describe("view/sports/Venues.vue", () => {
  const sports = {
    sports: [
      {
        label: `競技1`,
        icon: image,
        type: "福井しあわせ元気国体",
        start: [`2018-01-01`, `2018-01-01`],
        venues: [
          {
            label: "会場1",
            starts: []
          }
        ],
        summary: "競技1概要",
        rule: "競技1ルール",
        classified: "正式競技"
      }
    ],
    disabledSports: [
      {
        icon: image,
        type: "福井しあわせ元気大会",
        label: `障スポ競技1`,
        start: [`2018-01-02`, `2018-01-02`],
        venues: [
          {
            label: "会場1",
            starts: []
          }
        ],
        summary: "障スポ競技1概要",
        rule: "障スポ競技1ルール",
        classified: "正式競技"
      }
    ]
  };
  describe("getDateRange", () => {
    it("開始日と終了日を特定の書式で返す", () => {
      const store = createStore();
      plug.commit.setSports(store, sports);

      const wrapper = shallowMount(Venues, {
        localVue,
        store,
        stubs: ["router-link"],
        propsData: {
          index: 0
        }
      });

      const vm = wrapper.vm as any;
      expect(vm.getDateRange(["2018-01-01", "2018-01-02"])).toEqual(
        "2018/01/01 - 2018/01/02"
      );
      expect(
        vm.getDateRange(["2018-01-01", "2018-01-02", "2018-01-03"])
      ).toEqual("2018/01/01 - 2018/01/03");
    });
    it("1日だけならその日のみ返す", () => {
      const store = createStore();
      plug.commit.setSports(store, sports);

      const wrapper = shallowMount(Venues, {
        localVue,
        store,
        stubs: ["router-link"],
        propsData: {
          index: 0
        }
      });

      const vm = wrapper.vm as any;
      expect(vm.getDateRange(["2018-01-01"])).toEqual("2018/01/01");
      expect(
        vm.getDateRange(["2018-01-01T00:00:00", "2018-01-01T09:00:00"])
      ).toEqual("2018/01/01");
      expect(
        vm.getDateRange([
          "2018-01-01T00:00:00",
          "2018-01-01T09:00:00",
          "2018-01-01T22:00:00"
        ])
      ).toEqual("2018/01/01");
    });
    it("1日以上間隔を開けたなら、分割して表示する", () => {
      const store = createStore();
      plug.commit.setSports(store, sports);

      const wrapper = shallowMount(Venues, {
        localVue,
        store,
        stubs: ["router-link"],
        propsData: {
          index: 0
        }
      });

      const vm = wrapper.vm as any;
      expect(
        vm.getDateRange([
          "2018-01-01T00:00:00",
          "2018-01-02T09:00:00",
          "2018-01-04T00:00:00",
          "2018-01-05T00:00:00"
        ])
      ).toEqual("2018/01/01 - 2018/01/02, 2018/01/04 - 2018/01/05");
    });
  });
});
