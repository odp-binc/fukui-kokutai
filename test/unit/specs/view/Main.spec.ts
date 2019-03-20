import { shallowMount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import assert from "assert";

import { createStore } from "@/store/store";
import { plug } from "@/store/module/sports";
import Main from "@/view/Main.vue";

const localVue = createLocalVue();
localVue.use(Vuex);

const image =
  "data:image/bmp;base64,Qk2OAAAAAAAAAIoAAAB8AAAAAQAAAAEAAAABABgAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAD/AAD/AAAAAAAA/0JHUnOAwvUoYLgeFSCF6wFAMzMTgGZmJkBmZgagmZkJPArXAyRcjzIAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAApqWVAA==";

describe("Main.vue", () => {
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
  const getAll = jest.fn(ctx => {
    plug.commit.setSports(ctx, sports);
    return Promise.resolve();
  });
  plug.dispatch.getAll = getAll;

  it("スポーツ一覧が表示されている", () => {
    const store = createStore();
    plug.commit.setSports(store, sports);

    const wrapper = shallowMount(Main, {
      localVue,
      store,
      stubs: ["router-link"]
    });
    const li = wrapper.findAll("ul.game-list > li") as any;
    expect(li.length).toEqual(1);
    assert(
      li
        .at(0)
        .text()
        .includes("競技1")
    );
  });
  it("障害者スポーツ一覧が表示されている", () => {
    const store = createStore();
    plug.commit.setSports(store, sports);

    const wrapper = shallowMount(Main, {
      localVue,
      store,
      stubs: ["router-link"]
    });
    const button = wrapper.find("ul.header-switch > li:nth-child(2) > button");
    button.trigger("click");
    const li = wrapper.findAll("ul.game-list > li") as any;
    expect(li.length).toEqual(1);
    assert(
      li
        .at(0)
        .text()
        .includes("障スポ競技1")
    );
  });
});
