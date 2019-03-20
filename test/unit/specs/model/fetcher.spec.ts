import { BindingLiteralNode, jsonifyBinds } from "@/model/fetcher";

describe("jsonifyBinds", () => {
  it("普通のリテラルならvalueにする", () => {
    const subject: { [key: string]: BindingLiteralNode } = {
      a: {
        type: "literal",
        value: "NormalValue"
      }
    };
    const actual = jsonifyBinds(subject);
    const actualKeys = Object.keys(actual);
    expect(actualKeys.length).toEqual(1);
    expect(actualKeys).toEqual(expect.arrayContaining(["a"]));
    if (!("a" in actual)) {
      return;
    }
    expect(actual["a"]).toEqual("NormalValue");
  });
  it("xml:langタグをつけているなら無視してvalueを返す", () => {
    const subject: { [key: string]: BindingLiteralNode } = {
      a: {
        type: "literal",
        value: "ValueWithLang",
        "xml:lang": "ja"
      }
    };
    const actual = jsonifyBinds(subject);
    const actualKeys = Object.keys(actual);
    expect(actualKeys.length).toEqual(1);
    expect(actualKeys).toEqual(expect.arrayContaining(["a"]));
    if (!("a" in actual)) {
      return;
    }
    expect(actual["a"]).toEqual("ValueWithLang");
  });
  it("xsd:floatなら数値に変換する", () => {
    const subject: { [key: string]: BindingLiteralNode } = {
      a: {
        type: "literal",
        value: "4.2",
        datatype: "http://www.w3.org/2001/XMLSchema#float"
      }
    };
    const actual = jsonifyBinds(subject);
    const actualKeys = Object.keys(actual);
    expect(actualKeys.length).toEqual(1);
    expect(actualKeys).toEqual(expect.arrayContaining(["a"]));
    if (!("a" in actual)) {
      return;
    }
    expect(actual["a"]).toEqual(4.2);
  });
  it("xsd:doubleなら数値に変換する", () => {
    const subject: { [key: string]: BindingLiteralNode } = {
      a: {
        type: "literal",
        value: "4.2",
        datatype: "http://www.w3.org/2001/XMLSchema#double"
      }
    };
    const actual = jsonifyBinds(subject);
    const actualKeys = Object.keys(actual);
    expect(actualKeys.length).toEqual(1);
    expect(actualKeys).toEqual(expect.arrayContaining(["a"]));
    if (!("a" in actual)) {
      return;
    }
    expect(actual["a"]).toEqual(4.2);
  });
  it("xsd:float/doubleでないならエラーを送出する", () => {
    const subject: { [key: string]: BindingLiteralNode } = {
      a: {
        type: "literal",
        value: "https://www.w3.org/TR/xmlschema11-2/#anyURI",
        datatype: "http://www.w3.org/2001/XMLSchema#anyURI"
      }
    };
    expect(() => jsonifyBinds(subject)).toThrow();
  });
});
