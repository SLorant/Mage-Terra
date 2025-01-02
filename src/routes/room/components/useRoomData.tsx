import { set, ref, onValue, DataSnapshot } from "firebase/database";
import { useEffect, useRef, useState } from "react";
import { projectDatabase } from "../../../../firebase/config";
import { useNavigate } from "react-router";

export const useRoomData = (
  room: string,
  uniqueId: string,
  wentBack: boolean
) => {
  const [hostId, setHostId] = useState("");
  const navigate = useNavigate();
  const [currentPlayers, setCurrentPlayers] = useState(100);
  const [readNames, setReadNames] = useState<{
    [key: string]: { Name: string; Avatar: number };
  }>({});
  const firstRender = useRef(true);
  const [quickPlay, setQuickPlay] = useState<boolean>(false);
  useEffect(() => {
    const roomRef = ref(projectDatabase, `/${room}`);
    const handleRoomData = (snapshot: DataSnapshot) => {
      const data = snapshot.val();
      if (data) {
        const {
          gameStarted,
          Host,
          doneWithAction,
          quickPlay,
          countDown,
          Map,
          round,
          DisconnectedPlayers,
          Dominoes,
          pickerPlayer,
          arcanes,
          ...playersData
        } = data;
        if (!wentBack) {
          setHostId(Host || uniqueId);
          const dataRef = ref(projectDatabase, `/${room}/Host`);
          set(dataRef, Host || uniqueId);
        } else {
          const dataRef = ref(projectDatabase, `/${room}/Host`);
          set(dataRef, null);
        }
        if (firstRender.current) {
          setReadNames(playersData);
          firstRender.current = false;
        }
        if (quickPlay) setQuickPlay(true);
        if (Host) {
          //Make the host always the first player in the grid
          const sortedNamesArray = Object.entries(playersData).sort((a, b) => {
            if (a[0] === Host) return -1; // Move host player to the beginning
            if (b[0] === Host) return 1;
            return 0;
          });
          const sortedReadNames = sortedNamesArray.reduce(
            (obj: any, [key, value]) => {
              obj[key] = value;
              return obj;
            },
            {}
          );
          setReadNames(sortedReadNames);
        }
        if (currentPlayers !== Object.keys(playersData).length)
          setCurrentPlayers(Object.keys(playersData).length);
        if (uniqueId) {
          if (gameStarted === true) {
            navigate(`/game?roomId=${room}`);
          }
        }
      }
    };

    return onValue(roomRef, handleRoomData);
  }, [room, uniqueId, currentPlayers]);

  return { hostId, readNames, setReadNames, currentPlayers, quickPlay };
};
