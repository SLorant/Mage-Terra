import { useEffect, useState } from "react";
import { VictoryScreenProps } from "../../../components/Interfaces";
import { useNavigate } from "react-router";

const VictoryScreen = ({ playerInfos, uniqueId }: VictoryScreenProps) => {
  const navigate = useNavigate();
  const [rankedPlayers, setRankedPlayers] = useState<
    { playerId: string; rank: number; name: string; avatar: string }[]
  >([]);
  useEffect(() => {
    // Calculate the rank for each player
    const rankedPlayersData = Object.entries(playerInfos).map(
      ([playerId, { score, name, avatar }]) => ({
        playerId,
        score,
        name,
        avatar,
      })
    );

    rankedPlayersData.sort((a, b) => b.score - a.score);

    setRankedPlayers(
      rankedPlayersData.map((player, index) => ({
        playerId: player.playerId,
        name: player.name,
        avatar: player.avatar,
        rank: index + 1,
      }))
    );
  }, [playerInfos]);

  const handleGoBack = () => {
    navigate(`/`);
  };

  const getRankByPlayerId = (playerId: string): number => {
    const playerData = rankedPlayers.find(
      (player) => player.playerId === playerId
    );
    if (playerData) return playerData.rank;
    else return 0;
  };
  const emptyRows = new Array(6 - Object.keys(playerInfos).length).fill(null);
  return (
    <div
      id="fade-in"
      className="absolute mx-auto h-[700px] w-[500px] bg-lightpurple z-30"
    >
      <div className="flex flex-col text-xl text-white w-full items-center text-center">
        {Object.entries(playerInfos).map(
          ([playerId, { name, avatar }]) =>
            getRankByPlayerId(playerId) === 1 && (
              <div
                className="flex flex-col justify-center items-center"
                key={playerId}
              >
                <h1 className="text-3xl mt-8 text-darkblue">
                  <div>The winner is: {name}!</div>
                </h1>
                <div className=" relative z-20 h-[200px] w-[200px] ml-2">
                  <img
                    className=""
                    height={200}
                    width={200}
                    src={`/dominoes/star.svg`}
                    alt="star"
                  ></img>
                  <img
                    className="absolute left-[34px] top-7"
                    height={120}
                    width={120}
                    src={`/avatars/avatar-${avatar}.webp`}
                    alt="playeravatar"
                  ></img>
                </div>
              </div>
            )
        )}
        <div className="w-2/3 largeshadow relative">
          {Object.entries(playerInfos).map(
            ([playerId, { name, score, avatar }]) => (
              <div
                key={playerId}
                id="row"
                className={`${
                  getRankByPlayerId(playerId) % 2 === 0
                    ? "bg-lightpurple"
                    : "bg-grey"
                } text-darkblue w-full h-12 justify-start items-center flex `}
              >
                <div className="ml-4 text-2xl">
                  {getRankByPlayerId(playerId)}.
                </div>
                <div className="ml-4">
                  <img
                    className="w-9"
                    height={40}
                    width={40}
                    src={`/avatars/avatar_small-${avatar}.webp`}
                    alt="playeravatar"
                  ></img>
                </div>
                <div className="ml-4 text-lg">
                  {playerId === uniqueId ? name + " (you)" : name}
                </div>
                <div className="text-2xl mr-4 absolute right-2">{score} p</div>
              </div>
            )
          )}
          {Object.entries(emptyRows).map((_, index) => (
            <div
              key={index}
              className={`${
                emptyRows.length % 2 === 0
                  ? index % 2 === 0
                    ? "bg-grey"
                    : "bg-lightpurple"
                  : (index + 1) % 2 === 0
                  ? "bg-grey"
                  : "bg-lightpurple"
              }
             text-darkblue w-full h-12 justify-start items-center flex `}
            ></div>
          ))}
        </div>
        <button
          className="darkbutton w-[275px] rounded-sm h-14 mb-6 mt-6 md:mt-12 text-2xl  text-white 
        transition ease-in-out duration-300 hover:scale-[102%]"
          onClick={handleGoBack}
        >
          back to home
        </button>
      </div>
    </div>
  );
};

export default VictoryScreen;
