import { shallowMount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import assert from "power-assert";

import { createStore } from "@/store/store";
import { TourismInfo } from "@/model/interfaces";
import { plug } from "@/store/module/tourisms";
import Detail from "@/view/tourism/Detail.vue";

const localVue = createLocalVue();
localVue.use(Vuex);

const image =
  "data:image/bmp;base64,Qk2OAAAAAAAAAIoAAAB8AAAAAQAAAAEAAAABABgAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAD/AAD/AAAAAAAA/0JHUnOAwvUoYLgeFSCF6wFAMzMTgGZmJkBmZgagmZkJPArXAyRcjzIAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAApqWVAA==";

describe("view/tourism/Detail.vue", () => {
  describe("コンテンツ", () => {
    const tourisms: TourismInfo[] = [
      {
        title: "テスト",
        colors: {
          light: "#9FC238",
          dark: "#63AA42"
        },
        spots: [
          {
            label: {
              value: "テスト",
              ruby: "テスト"
            },
            introduction: "テスト",
            description: "テスト",
            businessHours: ["10:00～19:00", "（12月～2月は18:00まで）"],
            subImages: [image]
          }
        ]
      }
    ];

    const fetchAllStub = jest.fn().mockImplementation(() => {
      return tourisms;
    });
    plug.dispatch.getAll = fetchAllStub;

    beforeEach(() => {
      fetchAllStub.mockClear();
    });

    it("省略されていない情報は表示され、省略されている情報は表示されない", () => {
      const store = createStore();
      plug.commit.setAll(store, tourisms);

      const wrapper = shallowMount(Detail, {
        localVue,
        store,
        stubs: ["router-link"],
        propsData: {
          title: "テスト"
        }
      });

      const dl = wrapper.find(".spot-detail dl") as any;
      const items: string[] = dl
        .findAll("dt")
        .wrappers.map((w: any) => w.text());
      assert(items.length === 1);
      assert(items[0] === "営業時間");
    });
  });
  describe("zwsp2list", () => {
    const tourisms: TourismInfo[] = [
      {
        title: "テスト",
        colors: {
          light: "#9FC238",
          dark: "#63AA42"
        },
        spots: [
          {
            label: {
              value: "テスト",
              ruby: "テスト"
            },
            introduction: "テスト",
            description: "テスト",
            businessHours: ["10:00～19:00", "（12月～2月は18:00まで）"],
            subImages: [image]
          }
        ]
      }
    ];
    const fetchAllStub = jest.fn().mockImplementation(() => {
      return tourisms;
    });
    plug.dispatch.getAll = fetchAllStub;

    beforeEach(() => {
      fetchAllStub.mockClear();
    });

    it("省略されていない情報は表示され、省略されている情報は表示されない", () => {
      const store = createStore();
      plug.commit.setAll(store, tourisms);

      const wrapper = shallowMount(Detail, {
        localVue,
        store,
        stubs: ["router-link"],
        propsData: {
          title: "テスト"
        }
      }) as any;

      const list = wrapper.vm.zwsp2list("abcd\u200befgh");
      expect(list).toEqual(["abcd", "efgh"]);
    });
  });
});
