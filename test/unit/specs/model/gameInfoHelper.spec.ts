import { getSportsFromVenue } from "@/model/gameInfoHelper";
import { GameInfo } from "@/model/interfaces";
import { testcases } from "./gameInfoHelperTestCases";

import { comparatorChildren } from "@/model/sorter";

describe("getSportsFromVenue", () => {
  describe("childrenなし", () => {
    it("会場1つのみで空キーで今ある日付を返す", () => {
      const subject: GameInfo = {
        label: "競技",
        type: "福井しあわせ元気国体",
        start: ["2018-01-01T09:00:00"],
        venues: [
          {
            label: "会場1",
            starts: ["2018-01-01T09:00:00"]
          }
        ],
        classified: "毎年実施競技"
      };
      const actual = getSportsFromVenue(subject, "会場1");
      expect(actual).toEqual([
        {
          label: "",
          starts: ["2018-01-01T09:00:00"]
        }
      ]);
    });
    it("会場が複数ある場合対応する日付のみ返す", () => {
      const venues = [
        {
          label: "会場1",
          starts: ["2018-01-01T09:00:00", "2018-01-02T09:00:00"]
        },
        {
          label: "会場2",
          starts: ["2018-01-03T09:00:00", "2018-01-04T09:00:00"]
        }
      ];

      const subject: GameInfo = {
        label: "競技",
        type: "福井しあわせ元気国体",
        start: [
          "2018-01-01T09:00:00",
          "2018-01-02T09:00:00",
          "2018-01-03T09:00:00",
          "2018-01-04T09:00:00"
        ],
        venues,
        classified: "毎年実施競技"
      };
      venues.forEach(venue => {
        const actual = getSportsFromVenue(subject, venue.label);
        expect(actual).toEqual([
          {
            label: "",
            starts: venue.starts
          }
        ]);
      });
    });
  });
  describe("childrenあり", () => {
    it("要素が0なら競技名で返す", () => {
      const subject: GameInfo = {
        label: "競技",
        type: "福井しあわせ元気国体",
        start: ["2018-01-01T09:00:00"],
        venues: [
          {
            label: "会場1",
            starts: ["2018-01-01T09:00:00"]
          }
        ],
        classified: "毎年実施競技",
        children: []
      };
      const actual = getSportsFromVenue(subject, "会場1");
      expect(actual).toEqual([
        {
          label: "競技",
          starts: ["2018-01-01T09:00:00"]
        }
      ]);
    });
    it("競技会場がバラバラならそれぞれを返す", () => {
      const subject: GameInfo = {
        label: "競技",
        type: "福井しあわせ元気国体",
        start: ["2018-01-01T09:00:00", "2018-01-02T09:00:00"],
        venues: [
          {
            label: "会場1",
            starts: ["2018-01-01T09:00:00"]
          },
          {
            label: "会場2",
            starts: ["2018-01-02T09:00:00"]
          }
        ],
        classified: "毎年実施競技",
        children: [
          {
            label: "子要素1",
            type: "福井しあわせ元気国体",
            start: ["2018-01-01T09:00:00"],
            venues: [
              {
                label: "会場1",
                starts: ["2018-01-01T09:00:00"]
              }
            ],
            classified: ""
          },
          {
            label: "子要素2",
            type: "福井しあわせ元気国体",
            start: ["2018-01-02T09:00:00"],
            venues: [
              {
                label: "会場2",
                starts: ["2018-01-02T09:00:00"]
              }
            ],
            classified: ""
          }
        ]
      };

      const testcases = [
        {
          venue: "会場1",
          expected: [
            {
              label: "子要素1",
              starts: ["2018-01-01T09:00:00"]
            }
          ]
        },
        {
          venue: "会場2",
          expected: [
            {
              label: "子要素2",
              starts: ["2018-01-02T09:00:00"]
            }
          ]
        }
      ];

      testcases.forEach(testCase => {
        const actual = getSportsFromVenue(subject, testCase.venue);
        expect(actual).toEqual(testCase.expected);
      });
    });
    it("競技会場同じの物があればでまとめる", () => {
      const subject: GameInfo = {
        label: "競技",
        type: "福井しあわせ元気国体",
        start: [
          "2018-01-01T09:00:00",
          "2018-01-02T09:00:00",
          "2018-01-03T09:00:00"
        ],
        venues: [
          {
            label: "会場1",
            starts: ["2018-01-01T09:00:00", "2018-01-02T09:00:00"]
          },
          {
            label: "会場2",
            starts: ["2018-01-03T09:00:00"]
          }
        ],
        classified: "毎年実施競技",
        children: [
          {
            label: "子要素1",
            type: "福井しあわせ元気国体",
            start: ["2018-01-01T09:00:00"],
            venues: [
              {
                label: "会場1",
                starts: ["2018-01-01T09:00:00"]
              }
            ],
            classified: ""
          },
          {
            label: "子要素2",
            type: "福井しあわせ元気国体",
            start: ["2018-01-02T09:00:00"],
            venues: [
              {
                label: "会場1",
                starts: ["2018-01-02T09:00:00"]
              }
            ],
            classified: ""
          },
          {
            label: "子要素3",
            type: "福井しあわせ元気国体",
            start: ["2018-01-03T09:00:00"],
            venues: [
              {
                label: "会場2",
                starts: ["2018-01-03T09:00:00"]
              }
            ],
            classified: ""
          }
        ]
      };

      const testcases = [
        {
          venue: "会場1",
          expected: [
            {
              label: "子要素1",
              starts: ["2018-01-01T09:00:00"]
            },
            {
              label: "子要素2",
              starts: ["2018-01-02T09:00:00"]
            }
          ]
        },
        {
          venue: "会場2",
          expected: [
            {
              label: "子要素3",
              starts: ["2018-01-03T09:00:00"]
            }
          ]
        }
      ];
      testcases.forEach(testCase => {
        const actual = getSportsFromVenue(subject, testCase.venue);
        expect(actual).toEqual(testCase.expected);
      });
    });
    describe("重複する子要素があるとき", () => {
      it("まとめて返す", () => {
        const subject: GameInfo = {
          label: "競技",
          type: "福井しあわせ元気国体",
          start: [
            "2018-01-01T09:00:00",
            "2018-01-02T09:00:00",
            "2018-01-03T09:00:00",
            "2018-01-04T09:00:00"
          ],
          venues: [
            {
              label: "会場1",
              starts: ["2018-01-01T09:00:00", "2018-01-02T09:00:00"]
            },
            {
              label: "会場2",
              starts: ["2018-01-03T09:00:00", "2018-01-04T09:00:00"]
            }
          ],
          classified: "毎年実施競技",
          kinds: ["子要素1", "子要素2"],
          children: [
            {
              label: "子要素1",
              type: "福井しあわせ元気国体",
              start: ["2018-01-01T09:00:00"],
              venues: [
                {
                  label: "会場1",
                  starts: ["2018-01-01T09:00:00"]
                }
              ],
              classified: ""
            },
            {
              label: "子要素1",
              type: "福井しあわせ元気国体",
              start: ["2018-01-02T09:00:00"],
              venues: [
                {
                  label: "会場1",
                  starts: ["2018-01-02T09:00:00"]
                }
              ],
              classified: ""
            },
            {
              label: "子要素2",
              type: "福井しあわせ元気国体",
              start: ["2018-01-03T09:00:00"],
              venues: [
                {
                  label: "会場2",
                  starts: ["2018-01-03T09:00:00"]
                }
              ],
              classified: ""
            },
            {
              label: "子要素2",
              type: "福井しあわせ元気国体",
              start: ["2018-01-04T09:00:00"],
              venues: [
                {
                  label: "会場2",
                  starts: ["2018-01-04T09:00:00"]
                }
              ],
              classified: ""
            }
          ]
        };
        const actual = getSportsFromVenue(subject, "会場1");
        expect(actual).toEqual([
          {
            label: "子要素1",
            starts: ["2018-01-01T09:00:00", "2018-01-02T09:00:00"]
          }
        ]);
        expect(getSportsFromVenue(subject, "会場2")).toEqual([
          {
            label: "子要素2",
            starts: ["2018-01-03T09:00:00", "2018-01-04T09:00:00"]
          }
        ]);
      });
      it("すべての子要素が同じ会場、同じ日付でやるなら全種目と返す", () => {
        const subject: GameInfo = {
          label: "競技",
          type: "福井しあわせ元気国体",
          start: ["2018-01-01T09:00:00", "2018-01-02T09:00:00"],
          venues: [
            {
              label: "会場1",
              starts: ["2018-01-01T09:00:00", "2018-01-02T09:00:00"]
            }
          ],
          classified: "毎年実施競技",
          kinds: ["子要素1", "子要素2"],
          children: [
            {
              label: "子要素1",
              type: "福井しあわせ元気国体",
              start: ["2018-01-01T09:00:00"],
              venues: [
                {
                  label: "会場1",
                  starts: ["2018-01-01T09:00:00"]
                }
              ],
              classified: ""
            },
            {
              label: "子要素1",
              type: "福井しあわせ元気国体",
              start: ["2018-01-02T09:00:00"],
              venues: [
                {
                  label: "会場1",
                  starts: ["2018-01-02T09:00:00"]
                }
              ],
              classified: ""
            },
            {
              label: "子要素2",
              type: "福井しあわせ元気国体",
              start: ["2018-01-01T09:00:00"],
              venues: [
                {
                  label: "会場1",
                  starts: ["2018-01-01T09:00:00"]
                }
              ],
              classified: ""
            },
            {
              label: "子要素2",
              type: "福井しあわせ元気国体",
              start: ["2018-01-02T09:00:00"],
              venues: [
                {
                  label: "会場1",
                  starts: ["2018-01-02T09:00:00"]
                }
              ],
              classified: ""
            }
          ]
        };
        debugger;
        const actual = getSportsFromVenue(subject, "会場1");
        expect(actual).toEqual([
          {
            label: "全種目",
            starts: ["2018-01-01T09:00:00", "2018-01-02T09:00:00"]
          }
        ]);
      });
      it("同じ日付の子要素があっても正常に全種目にまとめる", () => {
        const subject: GameInfo = {
          label: "競技",
          type: "福井しあわせ元気国体",
          start: ["2018-01-01T09:00:00", "2018-01-02T09:00:00"],
          venues: [
            {
              label: "会場1",
              starts: ["2018-01-01T09:00:00", "2018-01-02T09:00:00"]
            }
          ],
          classified: "毎年実施競技",
          kinds: ["子要素1", "子要素2"],
          children: [
            {
              label: "子要素1",
              type: "福井しあわせ元気国体",
              start: ["2018-01-01T09:00:00"],
              venues: [
                {
                  label: "会場1",
                  starts: ["2018-01-01T09:00:00"]
                }
              ],
              classified: ""
            },
            {
              label: "子要素1",
              type: "福井しあわせ元気国体",
              start: ["2018-01-02T09:00:00"],
              venues: [
                {
                  label: "会場1",
                  starts: ["2018-01-02T09:00:00"]
                }
              ],
              classified: ""
            },
            {
              label: "子要素1",
              type: "福井しあわせ元気国体",
              start: ["2018-01-01T09:00:00"],
              venues: [
                {
                  label: "会場1",
                  starts: ["2018-01-01T09:00:00"]
                }
              ],
              classified: ""
            },
            {
              label: "子要素2",
              type: "福井しあわせ元気国体",
              start: ["2018-01-01T09:00:00"],
              venues: [
                {
                  label: "会場1",
                  starts: ["2018-01-01T09:00:00"]
                }
              ],
              classified: ""
            },
            {
              label: "子要素2",
              type: "福井しあわせ元気国体",
              start: ["2018-01-02T09:00:00"],
              venues: [
                {
                  label: "会場1",
                  starts: ["2018-01-02T09:00:00"]
                }
              ],
              classified: ""
            }
          ]
        };
        debugger;
        const actual = getSportsFromVenue(subject, "会場1");
        expect(actual).toEqual([
          {
            label: "全種目",
            starts: ["2018-01-01T09:00:00", "2018-01-02T09:00:00"]
          }
        ]);
      });
    });
  });

  describe("報告されたもの", () => {
    testcases.forEach(testcase => {
      describe(testcase.subject.label, () => {
        testcase.expected.forEach(expected => {
          it(`${expected.venueId}が正しく取得できる`, () => {
            const actual = getSportsFromVenue(
              testcase.subject,
              expected.venueId
            );
            const actualSports = actual.map(a => a.label);
            const expectedResult = expected.result.sort((a, b) =>
              comparatorChildren(testcase.subject.type, testcase.subject.label)(
                a.label,
                b.label
              )
            );
            expect(expectedResult.map(a => a.label)).toEqual(actualSports);
            expectedResult.forEach((e, i) => {
              expect(e.starts.sort()).toEqual(actual[i].starts.sort());
            });
          });
        });
      });
    });
  });
});
