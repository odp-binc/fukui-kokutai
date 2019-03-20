import { GameInfo } from "@/model/interfaces";
import { comparatorChildren } from "@/model/sorter";

interface GameDateInfo {
  label: string;
  starts: string[];
}

export function getSportsFromVenue(
  sport: GameInfo,
  venueId: string
): GameDateInfo[] {
  if (!sport.children) {
    return [
      {
        label: "",
        starts: sport.venues
          .filter(venue => venue.label === venueId)
          .map(v => v.starts)
          .reduce((a, b) => a.concat(b), [])
      }
    ];
  }

  const children = sport.children
    .filter(child => child.venues.find(venue => venue.label === venueId))
    .reduce(
      (prev, child) => {
        const toUpdateIndex = prev.findIndex(
          elem => elem.label === child.label
        );
        if (toUpdateIndex < 0) {
          return prev.concat({
            label: child.label,
            starts: child.venues
              .find(venue => venue.label === venueId)!
              .starts.slice()
          });
        }
        const newElem = {
          label: prev[toUpdateIndex].label,
          starts: prev[toUpdateIndex].starts
            .concat(child.venues.find(venue => venue.label === venueId)!.starts)
            .filter((v, i, a) => a.indexOf(v) === i)
        };
        prev[toUpdateIndex] = newElem;
        return prev;
      },
      [] as Array<{ label: string; starts: string[] }>
    );
  const childrenNum = children.length;
  if (childrenNum === 0) {
    // 種目情報がない場合は競技名で開催期間を表示する
    return [{ label: sport.label, starts: sport.start }];
  } else if (childrenNum === 1) {
    // 種目情報が１個の場合は統合しない
  } else if (sport.kinds && sport.kinds.length === childrenNum) {
    const uniqueDateRange = children
      .map(child => child.starts.sort())
      .filter(
        (value, index, array) =>
          array.findIndex(arrVal => {
            return arrVal
              .sort()
              .reduce(
                (prev, current, arrIndex) =>
                  prev && current === value[arrIndex],
                true
              );
          }) === index
      )
      .filter((_v, _i, array) => array.length === 1)
      .shift();
    if (uniqueDateRange) {
      // 全種目の情報が存在し、全て同じ開催期間なら全種目に統合する
      return [{ label: "全種目", starts: uniqueDateRange }];
    }
  }
  return children
    .sort((a, b) =>
      comparatorChildren(sport.type, sport.label)(a.label, b.label)
    )
    .reduce(
      (arr, current) => {
        const lastIndex = arr.length - 1;
        const toAdd =
          arr.length < 1 || arr[arr.length - 1].label !== current.label;
        return toAdd
          ? arr.concat(current)
          : arr.slice(0, -1).concat({
              label: arr[lastIndex].label,
              starts: arr[lastIndex].starts.concat(current.starts)
            });
      },
      [] as GameDateInfo[]
    )
    .map(sport => ({
      ...sport,
      starts: sport.starts.filter(
        (value, index, array) => array.indexOf(value) === index
      )
    }));
}
