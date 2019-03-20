import { shallowMount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import assert from "power-assert";

import { createStore } from "@/store/store";
import { TourismInfo } from "@/model/interfaces";
import { plug } from "@/store/module/tourisms";
import List from "@/view/tourism/List.vue";

const localVue = createLocalVue();
localVue.use(Vuex);

describe("view/sports/Select.vue", () => {
  describe("コンテンツ", () => {
    const tourisms: TourismInfo[] = [
      {
        title: "テスト",
        colors: {
          light: "#9FC238",
          dark: "#63AA42"
        },
        spots: []
      },
      {
        title: "テスト2",
        colors: {
          light: "#9FC238",
          dark: "#63AA42"
        },
        spots: []
      }
    ];

    const fetchAllStub = jest.fn().mockImplementation(() => {
      return tourisms;
    });
    plug.dispatch.getAll = fetchAllStub;

    beforeEach(() => {
      fetchAllStub.mockClear();
    });

    it("観光情報があれば一覧を表示する", () => {
      const store = createStore();
      plug.commit.setAll(store, tourisms);

      const wrapper = shallowMount(List, {
        localVue,
        store,
        stubs: ["router-link"]
      });

      const ul = wrapper.find("ul.menu") as any;
      const items: string[] = ul
        .findAll("li")
        .wrappers.map((w: any) => w.text());
      assert(items.length === 2);
      assert(items[0] === "テスト");
      assert(items[1] === "テスト2");
    });

    it("観光情報がなければdiv.not-foundを表示する", () => {
      const store = createStore();
      plug.commit.setAll(store, []);

      const wrapper = shallowMount(List, {
        localVue,
        store,
        stubs: ["router-link"]
      });

      assert(wrapper.find("div.not-found").exists());
      assert(!wrapper.find("ul.menu").exists());
    });
  });
});
