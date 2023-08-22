import React from "react";
import { meeting } from "@microsoft/teams-js";

export default function GameCard({ games, handleTabDisplay }) {
  return (
    <>
      <div className="gameCard">
        <div className="iconColumn">
          <div className="gameIcon"></div>
          <img alt="game icon" className="gameIcon" src={games.Icon} />
        </div>
        <div className="detailsColumn">
          <h6>{games.Title}</h6>
          <p>{games.Description}</p>
          {games.MaxPlayers == "None" ? (
            <h6>Players: {games.MinPlayers}+</h6>
          ) : (
            <h6>
              Players: {games.MinPlayers}-{games.MaxPlayers}
            </h6>
          )}
        </div>
        <br />
      </div>
      <button className="playButton" onClick={() => handleTabDisplay("Game")}>
        Play
      </button>
      <br />
    </>
  );
}
