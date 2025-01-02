import {
  DominoPickerProps,
  DominoState,
  PlayerInfo,
} from "@/src/components/Interfaces";
import React, { useEffect, useState } from "react";
import { usePlayerStore } from "@/src/components/useStore";
import { projectDatabase } from "../../../../firebase/config";
import { onValue, ref, set, update } from "firebase/database";
import { DominoSetter } from "./boardcomponents/DominoSetter";

const DominoPicker = ({
  uniqueId,
  hostId,
  room,
  setDonePicking,
  countDown,
  setDomino,
  readBoards,
  arcaneType,
  playerArcanes,
  setPlayerArcanes,
  setIsDominoPicked,
}: DominoPickerProps) => {
  type ArcaneList = {
    [key: string]: string;
  };

  const arcaneList: ArcaneList = {
    Dungeon: "#9000BD",
    Lagoon: "#FF40B1",
    Mt: "#35CB8F",
    Village: "#184BC2",
    Field: "#E29D6B",
  };
  const { playerCount } = usePlayerStore();
  const [dominoes, setDominoes] = useState<DominoState[]>([]);

  const [playerDominoes, setPlayerDominoes] = useState<{
    [key: string]: [name: string, domino: DominoState];
  }>({});
  const [pickingCountDown, setPickingCountDown] = useState(16);
  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  const [dominoIndex, setDominoIndex] = useState<number>(30);
  async function endPicking() {
    await sleep(2000);
    const playersRef = ref(projectDatabase, `/${room}/doneWithDomino`);
    const dominoesRef = ref(projectDatabase, `/${room}/Dominoes`);
    // Delete the dominoes and player domino data.
    // or last picker's round ends
    const pickerRef = ref(projectDatabase, `/${room}/pickerPlayer`);
    if (uniqueId === hostId) {
      set(playersRef, null);
      set(dominoesRef, null);
      set(pickerRef, null);
    }
    setCurrentPicker(0);
    setDonePicking(true);
  }
  useEffect(() => {
    if (Object.keys(playerDominoes).length === playerCount || countDown == 34) {
      endPicking();
    }
  }, [playerDominoes]);
  useEffect(() => {
    const dominoesRef = ref(projectDatabase, `/${room}/Dominoes`);
    // Make dominoes to pick
    if (hostId === uniqueId) {
      for (let i = 0; i < playerCount; i++) {
        const Domino = DominoSetter();
        update(dominoesRef, { [i]: Domino });
      }
    }

    onValue(dominoesRef, (snapshot) => {
      const data: DominoState[] | DominoState = snapshot.val();
      let dataArray: DominoState[];
      if (Array.isArray(data)) {
        dataArray = data;
      } else if (data) {
        const keys = Object.keys(data);
        const values = Object.values(data);

        dataArray = new Array(keys.length);

        for (let i = 0; i < keys.length; i++) {
          const index = parseInt(keys[i]);
          dataArray[index] = values[i];
        }
      } else {
        dataArray = [];
      }
      setDominoes(dataArray);
    });
  }, [uniqueId, room, hostId]);

  useEffect(() => {
    readBoards &&
      Object.entries(readBoards).forEach((board) => {
        let arcane: number = 0;
        // console.log(board)
        board[1][0].forEach((square) => {
          if (square.lastDroppedItem?.firstname === arcaneType) {
            arcane++;
          }
        });
        setPlayerArcanes((prevPlayerInfos) => {
          const updatedPlayerInfos: { [key: string]: PlayerInfo } = {
            ...prevPlayerInfos,
            [board[0]]: {
              name: board[1][1],
              score: arcane,
              avatar: board[1][2],
            },
          };
          const sortedPlayerInfosArray: [string, PlayerInfo][] = Object.entries(
            updatedPlayerInfos
          ).sort(([_, a], [__, b]) => b.score - a.score);
          const sortedPlayerInfos: { [key: string]: PlayerInfo } =
            Object.fromEntries(sortedPlayerInfosArray);

          return sortedPlayerInfos;
        });
      });
  }, [readBoards]);

  const [canPick, setCanPick] = useState<boolean>(false);
  const [picker, setPicker] = useState<string>("");
  const [currentPicker, setCurrentPicker] = useState<number>(0);

  const chooseDomino = (Domino: DominoState, index: number) => {
    if (dominoIndex === 30 && canPick) {
      setPickingCountDown(30);
      setDominoIndex(index);
      setDomino(Domino);
      setIsDominoPicked(true);
      const playersRef = ref(projectDatabase, `/${room}/doneWithDomino`);

      if (uniqueId) {
        const updateObject = { [uniqueId]: [index, Domino] };
        update(playersRef, updateObject);
      }
    }
  };
  useEffect(() => {
    if (canPick && pickingCountDown < 30) {
      let timer: number;

      if (pickingCountDown) {
        timer = window.setInterval(() => {
          setPickingCountDown((prevCountdown) => prevCountdown - 1);
        }, 1000);
      }
      if (pickingCountDown === 0) {
        const tempdominoes = dominoes.filter(Boolean);
        setDominoIndex(0);
        setDomino(tempdominoes[0]);
        setIsDominoPicked(true);
        setCanPick(false);
        const playersRef = ref(projectDatabase, `/${room}/doneWithDomino`);
        console.log(tempdominoes);
        if (uniqueId) {
          const updateObject = { [uniqueId]: [0, tempdominoes[0]] };
          console.log(updateObject);
          update(playersRef, updateObject);
        }
        setPickingCountDown(30);
      }
      return () => {
        clearInterval(timer);
      };
    }
    return;
  }, [canPick, pickingCountDown]);
  useEffect(() => {
    const roomRef = ref(projectDatabase, `/${room}/pickerPlayer`);
    const doneRef = ref(projectDatabase, `/${room}/doneWithDomino`);
    onValue(doneRef, (snapshot) => {
      const data = snapshot.val();
      const playersDone = snapshot.size;
      if (
        uniqueId === hostId &&
        Object.values(playerArcanes).length > 1 &&
        currentPicker < playerCount
      ) {
        if (Object.keys(playerDominoes).length !== playerCount) {
          set(roomRef, Object.keys(playerArcanes)[currentPicker]);
        }
      }
      if (data) {
        setCurrentPicker(playersDone);
      }
      if (data) {
        snapshot.forEach((userSnapshot) => {
          const playerId: string = userSnapshot.key ?? "";
          const num: number = userSnapshot.child("0").val();
          const domino: DominoState = userSnapshot.child("1").val();
          let name = "";
          Object.entries(playerArcanes).forEach((player) => {
            if (playerId === player[0]) name = player[1].name;
          });
          setPlayerDominoes((prevDominoes) => ({
            ...prevDominoes,
            [playerId]: [name, domino],
          }));
          if (uniqueId === hostId) {
            const dominoRef = ref(projectDatabase, `/${room}/Dominoes/${num}`);
            set(dominoRef, null);
          }
        });
      }
    });
    return onValue(roomRef, (snapshot) => {
      const data: string = snapshot.val();
      if (data) setPicker(data);
      if (data && data === uniqueId) {
        setCanPick(true);
      } else setCanPick(false);
    });
  }, [playerArcanes]);

  const getColor = (type: string): string => {
    return arcaneList[type] || "#000000";
  };
  const color = getColor(arcaneType);
  return (
    <div
      className="absolute top-0 left-0 h-full w-full lg:top-14 lg:left-16 lg:w-[567px] bg-lightpurple lg:h-[564px] z-50 flex flex-col gap-4 justify-start
     items-center"
      id="fade-in-faster"
    >
      <div
        className={`${
          playerCount < 4 ? "mt-12" : "mt-6"
        } flex flex-col justify-start items-center`}
      >
        {Object.entries(playerArcanes).map(([playerId, { name }]) => (
          <div key={playerId}>
            {playerId === picker && (
              <h1 id="fade-in-fast" className="text-2xl md:text-3xl">
                {playerId === uniqueId
                  ? "Choose a domino!"
                  : name + " is picking a domino"}
              </h1>
            )}
          </div>
        ))}
        {pickingCountDown < 16 && (
          <p id="fade-in-fast" className="mt-2">
            {pickingCountDown} seconds left
          </p>
        )}
      </div>

      <div className="flex flex-col justify-center items-center gap-4">
        <div className="flex flex-col justify-center items-center bg-grey w-[100vw] md:w-[567px] h-auto py-4">
          <p className="mb-4 text-2xl">Pickable dominos</p>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-10 mb-4 ">
            {dominoes.map((Domino, index) =>
              index === 30 ? (
                <div>None</div>
              ) : (
                <div
                  id="fade-in-fast"
                  className={`${
                    dominoIndex === index && "hidden"
                  } flex cursor-pointer`}
                  key={index}
                  onClick={() => chooseDomino(Domino, index)}
                >
                  <div
                    className={` ring-2 bg-grey ring-gray-200 shadow-lg z-20 dominosmall`}
                    data-testid="Domino"
                  >
                    <img
                      src={Domino.img}
                      alt="kep"
                      width={40}
                      height={40}
                      className={`w-full h-full`}
                      draggable="false"
                    />
                  </div>
                  <div
                    className={` ring-2 bg-grey ring-gray-200 shadow-lg z-20 dominosmall`}
                    data-testid="Domino"
                  >
                    <img
                      src={Domino.secondimg}
                      alt="kep"
                      width={40}
                      height={40}
                      className={`w-full h-full`}
                      draggable="false"
                    />
                  </div>
                </div>
              )
            )}
          </div>
        </div>
        <h2 className="text-2xl">Chosen dominos</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-6">
          {Object.entries(playerDominoes).map(([playerId, [name, domino]]) => (
            <div
              className="flex flex-col justify-center items-center "
              key={playerId}
              id="fade-in-fast"
            >
              <p className="text-xl mb-2">{name}:</p>
              <div className="flex">
                <div
                  className={` ring-2 bg-grey ring-gray-200 shadow-lg z-20 dominosmall`}
                  data-testid="Domino"
                >
                  <img
                    src={domino.img}
                    alt="kep"
                    width={80}
                    height={80}
                    className={`w-full h-full`}
                    draggable="false"
                  />
                </div>
                <div
                  className={` ring-2 bg-grey ring-gray-200 shadow-lg z-20 dominosmall`}
                  data-testid="Domino"
                >
                  <img
                    src={domino.secondimg}
                    alt="kep"
                    width={80}
                    height={80}
                    className={`w-full h-full`}
                    draggable="false"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div
        id="fade-in-fast"
        className={`${"top-60 -right-[399px] hidden md:flex z-50"} absolute  w-[335px] h-[45px] flex
       flex-col gap-10 justify-start items-center`}
      >
        <div
          className={`${
            playerCount < 6 ? "flex" : "hidden"
          } absolute w-full h-12 gap-1 bottom-0 left-0 flex justify-center items-center bg-grey`}
        >
          Current arcane:
          <svg
            width="24"
            height="30"
            viewBox="0 0 11 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M0 8L5.5 16L11 8L5.5 4.04797e-07L0 8Z" fill={color} />
          </svg>
          ({arcaneType})
        </div>
      </div>
    </div>
  );
};

export default DominoPicker;
