import { shallowMount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import assert from "power-assert";

import Navbar from "@/components/layout/Navbar.vue";

const localVue = createLocalVue();
localVue.use(Vuex);

describe("components/layout/Navbar", () => {
  describe("title", () => {
    it("ルーターにタイトルが設定されているならそれを表示する", () => {
      const $route = {
        path: "/some/path",
        name: "HasTitle",
        meta: {
          title: "タイトル"
        }
      };
      const wrapper = shallowMount(Navbar, {
        localVue,
        mocks: {
          $route
        }
      });
      assert((wrapper.vm as any).title === "タイトル");
    });
    it("ルーターのタイトル設定が関数ならその結果を表示する", () => {
      const state = {
        title: "Title From Store"
      };
      const store = new Vuex.Store({ state });

      const $route = {
        path: "/some/path",
        name: "HasFuncTitle",
        meta: {
          title: (_: any, store: any) => store.state.title
        }
      };

      const wrapper = shallowMount(Navbar, {
        localVue,
        store,
        mocks: {
          $route
        }
      });
      assert((wrapper.vm as any).title === "Title From Store");
    });
    it("ルーターにタイトルが設定されていないならデフォルトの文言を表示する", () => {
      const $route = {
        path: "/",
        name: "Main"
      };
      const wrapper = shallowMount(Navbar, {
        localVue,
        mocks: {
          $route
        }
      });
      assert((wrapper.vm as any).title === "しあわせ元気 お役立ち情報アプリ");
    });
  });
});
