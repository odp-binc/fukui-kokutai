import { shallowMount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import assert from "assert";

import { createStore } from "@/store/store";
import { plug } from "@/store/module/sports";
import Select from "@/view/sports/Select.vue";

const localVue = createLocalVue();
localVue.use(Vuex);

const image =
  "data:image/bmp;base64,Qk2OAAAAAAAAAIoAAAB8AAAAAQAAAAEAAAABABgAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAD/AAD/AAAAAAAA/0JHUnOAwvUoYLgeFSCF6wFAMzMTgGZmJkBmZgagmZkJPArXAyRcjzIAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAApqWVAA==";

describe("view/sports/Select.vue", () => {
  describe("コンテンツ", () => {
    const sports = {
      sports: [
        {
          label: `競技1`,
          icon: image,
          type: "福井しあわせ元気国体",
          start: [`2018/1/X`, `2018/1/XX`],
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
          start: [`2018/1/X`, `2018/1/XX`],
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
    it("競技情報があれば対象の情報を表示する", () => {
      const store = createStore();
      plug.commit.setSports(store, sports);

      const wrapper = shallowMount(Select, {
        localVue,
        store,
        stubs: ["router-link"],
        propsData: {
          index: 0
        }
      });

      const img = wrapper.find(".content > img") as any;
      assert(img.attributes().src === image);
      assert(wrapper.text().includes("競技1"));
    });
    it("障害スポーツ競技情報があれば対象の情報を表示する", () => {
      const store = createStore();
      plug.commit.setSports(store, sports);

      const wrapper = shallowMount(Select, {
        localVue,
        store,
        stubs: ["router-link"],
        propsData: {
          index: 0,
          disabledSports: true
        }
      });

      const img = wrapper.find(".content > img") as any;
      assert(img.attributes().src === image);
      assert(wrapper.text().includes("障スポ競技1"));
    });
    it("情報が見つからなければ404コンテンツを表示", () => {
      const store = createStore();
      plug.commit.setSports(store, sports);

      const wrapper = shallowMount(Select, {
        localVue,
        store,
        stubs: ["router-link"],
        propsData: {
          index: 1
        }
      });

      assert(wrapper.contains(".missing-sports"));
    });
  });
});
