// 駐車場の表示有無など副次的な情報

interface GameSideInfo {
  gameId: string;
  allowShowParking: boolean;
  allowShowPlayer: boolean;
}

const gameSideInfo: GameSideInfo[] = [
  {
    gameId: "開会式",
    allowShowParking: false,
    allowShowPlayer: false
  },
  {
    gameId: "閉会式",
    allowShowParking: false,
    allowShowPlayer: false
  }
];

export function getGameSideInfo(gameId: string): GameSideInfo {
  const target = gameSideInfo.find(info => info.gameId === gameId);
  return (
    target || {
      gameId,
      allowShowParking: true,
      allowShowPlayer: true
    }
  );
}
