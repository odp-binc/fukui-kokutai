import { mapToRecordStr } from "@/model/fixRecords";
import sportsOrderRecords from "./sports_order.json";

/**
 * 数値順、辞書順にソートする
 *
 * 数値は半角/全角アラビア数字のみ
 */
const pattern = /^([\+\-＋]?)([0-9０-９]+)/;
export function sortNumeric(a: string, b: string): number {
  const aNumeric = pattern.exec(a);
  const bNumeric = pattern.exec(b);
  if (aNumeric && bNumeric) {
    const aNumber = parseInt(
      aNumeric[2].replace(
        /[０-９]/g,
        c => `${c.charCodeAt(0) - "０".charCodeAt(0)}`
      )
    );
    const bNumber = parseInt(
      bNumeric[2].replace(
        /[０-９]/g,
        c => `${c.charCodeAt(0) - "０".charCodeAt(0)}`
      )
    );
    return (
      aNumber - bNumber ||
      compareSign(aNumeric[1], bNumeric[1]) ||
      a.localeCompare(b)
    );
  }
  return a.localeCompare(b);
}

function compareSign(a: string, b: string): number {
  const signs = ["-", "", "+", "＋"];
  return signs.indexOf(a) - signs.indexOf(b);
}

export function comparatorChildren(
  event: string,
  label: string
): (a: string, b: string) => number {
  const records =
    event === "福井しあわせ元気大会"
      ? sportsOrderRecords["福井しあわせ元気大会"]
      : sportsOrderRecords["福井しあわせ元気国体"];
  const record = Object.values(records).find(
    r => r !== undefined && r.label === mapToRecordStr(label)
  );
  if (record === undefined || !("children" in record)) {
    return sortNumeric;
  }
  const children = Object.values((record as any).children);
  return (a, b) => {
    const aRecord: any = children.find((r: any) => r.label === a);
    const bRecord: any = children.find((r: any) => r.label === b);

    if (aRecord === undefined && bRecord === undefined) {
      return sortNumeric(a, b);
    } else if (aRecord === undefined) {
      return 1;
    } else if (bRecord === undefined) {
      return -1;
    }
    return aRecord.order - bRecord.order || a.localeCompare(b);
  };
}
