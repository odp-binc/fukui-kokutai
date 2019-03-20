import { sortNumeric } from "@/model/sorter";

describe("sortNumeric", () => {
  it("同一ならば0を返す", () => {
    expect(sortNumeric("abc", "abc")).toEqual(0);
    expect(sortNumeric("123", "123")).toEqual(0);
    expect(sortNumeric("１２３", "１２３")).toEqual(0);
    expect(sortNumeric("abc", "abc")).toEqual(0);
    expect(sortNumeric("あいう", "あいう")).toEqual(0);
  });
  it("辞書順なら負数を返す", () => {
    expect(sortNumeric("a", "b")).toBeLessThan(0);
    expect(sortNumeric("あ", "い")).toBeLessThan(0);
  });
  it("辞書順の逆なら正数を返す", () => {
    expect(sortNumeric("b", "a")).toBeGreaterThan(0);
    expect(sortNumeric("い", "あ")).toBeGreaterThan(0);
  });
  describe("半角数字", () => {
    it("数値として比較して前が小さいなら負数を返す", () => {
      expect(sortNumeric("1", "2")).toBeLessThan(0);
      expect(sortNumeric("9", "10")).toBeLessThan(0);
      expect(sortNumeric("2000m", "5000m")).toBeLessThan(0);
    });
    it("数値として比較して前が大きいなら正数を返す", () => {
      expect(sortNumeric("2", "1")).toBeGreaterThan(0);
      expect(sortNumeric("10", "9")).toBeGreaterThan(0);
      expect(sortNumeric("5000m", "2000m")).toBeGreaterThan(0);
    });
  });
  describe("全角数字", () => {
    it("数値として比較して前が小さいなら負数を返す", () => {
      expect(sortNumeric("１", "２")).toBeLessThan(0);
      expect(sortNumeric("９", "１０")).toBeLessThan(0);
      expect(sortNumeric("２０００m", "５０００m")).toBeLessThan(0);
    });
    it("数値として比較して前が大きいなら正数を返す", () => {
      expect(sortNumeric("２", "１")).toBeGreaterThan(0);
      expect(sortNumeric("１０", "９")).toBeGreaterThan(0);
      expect(sortNumeric("５０００m", "２０００m")).toBeGreaterThan(0);
    });
  });
  describe("数字が同一のとき", () => {
    it("文字列の辞書順でソートされる", () => {
      expect(sortNumeric("100m", "100mハードル")).toBeLessThan(0);
      expect(sortNumeric("100mハードル", "100mハードル")).toEqual(0);
      expect(sortNumeric("100mハードル", "100m")).toBeGreaterThan(0);
    });
  });
});
