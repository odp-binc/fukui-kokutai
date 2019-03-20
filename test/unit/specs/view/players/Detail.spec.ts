import { shallowMount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import assert from "assert";

import { Player } from "@/model/interfaces";
import { createStore } from "@/store/store";
import { plug } from "@/store/module/players";
import Detail from "@/view/players/Detail.vue";

const localVue = createLocalVue();
localVue.use(Vuex);

describe("view/players/Detail.vue", () => {
  describe("コンテンツ", () => {
    const players: Player[] = [
      {
        type: "福井しあわせ元気国体",
        sport: {
          type: "福井しあわせ元気国体",
          label: "スポーツ",
          parent: "スポーツ"
        },
        role: "選手",
        name: "氏名1",
        kana: "シメイ1",
        toCommute: "勤務先",
        isHomePlayer: true,
        performance: ["実績1-1", "実績1-2"]
      },
      {
        type: "福井しあわせ元気国体",
        sport: {
          type: "福井しあわせ元気国体",
          label: "スポーツ2",
          parent: "スポーツ2"
        },
        role: "選手兼監督",
        name: "氏名2",
        kana: "シメイ2",
        toCommute: "勤務先2",
        isHomePlayer: false,
        performance: ["実績2-1", "実績2-2"]
      }
    ];

    const getAll = jest.fn(ctx => {
      plug.commit.setAll(ctx, players);
      return Promise.resolve();
    });
    plug.dispatch.getAll = getAll;

    beforeEach(() => {
      getAll.mockClear();
    });

    it("選手情報があれば対象の情報を表示する", () => {
      const store = createStore();
      plug.commit.setAll(store, players);

      const wrapper = shallowMount(Detail, {
        localVue,
        store,
        propsData: {
          name: "氏名1",
          sport: "スポーツ"
        }
      });

      const text = wrapper.text();
      assert(text.includes("氏名1"));
      assert(text.includes("スポーツ"));
      assert(text.includes("勤務先"));
      assert(text.includes("実績1-1"));
      assert(text.includes("実績1-2"));
    });
    it("情報が見つからなければ404コンテンツを表示", () => {
      const store = createStore();
      plug.commit.setAll(store, players);

      const wrapper = shallowMount(Detail, {
        localVue,
        store,
        propsData: {
          name: ""
        }
      });

      assert(wrapper.contains(".not-found"));
    });
  });
});
