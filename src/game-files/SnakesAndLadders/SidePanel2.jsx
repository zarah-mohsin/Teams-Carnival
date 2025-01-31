import { inTeams } from "../../utils/inTeams.js";
import { meeting, app } from "@microsoft/teams-js";
import { useState, useEffect } from "react";
import FluidService from "./fluidLiveShare2.js";
import "./snakes.css";

export const SidePanel2 = ({ user }) => {
  const [activeUsers, setActiveUsers] = useState([]);
  //const [message, setMessage] = useState("");
  const [fluidWorks, setFluidWorks] = useState(null);
  const [correctPlayers, setCorrectPlayers] = useState(true);
  const [turn, setTurn] = useState("");
  const [gameStarted, setGameStarted] = useState(false);

  /////////////////////////////////////////////////////
  const [gameOver, setGameOver] = useState(false);
  //const [currentPlayer, setCurrentPlayer] = useState("");
  ///////////////////////////////////////////////////////

  const myName = user;
  const [playText, setPlayText] = useState("I want to play!");

  //This function will allow a meeting participant to add/ remove themselves to/from the players list.
  const buttonClicked = () => {
    if (!activeUsers.includes(myName)) {
      setActiveUsers((prevActiveUsers) => [...prevActiveUsers, myName]);
      FluidService.updateNames(myName);
      setPlayText("Actually, I changed my mind");
    } else {
      setActiveUsers(activeUsers.filter((elem) => elem !== myName));
      FluidService.removeName(myName);
      setPlayText("I want to play");
    }
  };

  /////////////////////////////////////////////////////

  const shareToStage = () => {
    meeting.shareAppContentToStage((error, result) => {
      if (!error) {
        console.log("Started sharing to stage");
      } else {
        console.warn("shareAppContentToStage failed", error);
      }
    }, window.location.origin + "?inTeams=1&view=stage");
  };

  /////////////////////////////////////FLUID///////////////////////////////////////////
  useEffect(() => {
    app.initialize().then(async () => {
      try {
        await FluidService.connect();
        FluidService.resetMap();

        FluidService.onNewData((array) => {
          setActiveUsers(array);

          if (typeof array[0] === "number") {
            if (array[0] === -1) {
              //This means that the game session in Unity has ended. Let's re-render the side panel accordingly.
              setGameOver(true);
            } else {
              if (!gameStarted) {
                //This is triggered when one of the players clicks the button to start the game in the meeting stage.
                //In this particular case the number indicates the number of players rather than the dice value.
                //Let's change the screen to indicate that the game is now in motion and tell players whose turn it is.
                setTimeout(() => {
                  setGameStarted(true);
                }, 5000);
              }

              if (array[0] !== 6) {
                //A player has made his move and did not roll a 6. Let's move to the next person.
                setTimeout(() => {
                  setTurn(`It's your turn, ${array[1]}`);
                }, 2000);
              }
              //A player rolled a 6 and so they are entitled to make another move.
              else {
                setTimeout(() => {
                  setTurn(`Keep rolling, ${array[1]}`);
                }, 2000);
              }
            }
          }
        });

        setFluidWorks(true);
      } catch (error) {
        setFluidWorks(false);
      }
    });
  }, []);

  const startGame = async () => {
    if (activeUsers.length > 0 && activeUsers.length < 5) {
      //If the number of declared players matches the WebGL build's requirements, let's start the game.
      FluidService.updateValues(activeUsers.length);
      shareToStage();
    } else {
      setCorrectPlayers(false);
      setActiveUsers([]);
      FluidService.resetMap();
    }
  };

  ///////////////STYLING/////////////////////////////

  const panelStyle = {
    textAlign: "center",
    display: "flex",
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-around",
    height: "100vh",
    alignItems: "center",
  };

  const buttonStyle = {
    marginBottom: "5px",
    padding: "10px",
    backgroundColor: "grey",
    color: "white",
    border: "none",
    cursor: "pointer",
    width: "100%",
    height: "50px",
  };

  const activeButtonStyle = {
    ...buttonStyle,
    backgroundColor: "green",
  };

  const verticalButtons = {
    display: "flex",
    flexDirection: "column",
  };

  const readyButton = {
    ...buttonStyle,
    backgroundColor: "red",
  };

  const endGame = () => {
    // setGameOver(true);
    FluidService.updateValues(-1);
  };

  return (
    <div className="sidePanel">
      {fluidWorks === null && <p>Loading...</p>}
      {fluidWorks === false && (
        <p>
          There is an issue with your connection. Please restart the
          application.
        </p>
      )}
      {!correctPlayers && !gameStarted && (
        <p>This game requires between 1 and 4 players.</p>
      )}

      {fluidWorks === true && !gameStarted && (
        <div style={verticalButtons}>
          <p>
            Welcome to the treacherousss land of many, many snakes and some
            ladders!
          </p>
          <button onClick={buttonClicked}>{playText}</button>
          {activeUsers.length > 0 && (
            <div className="playertitle">
              <p>Players</p>
            </div>
          )}
          {activeUsers.length > 0 && (
            <div className="players">
              {" "}
              {activeUsers.map((name, index) =>
                typeof name === "string" ? <div key={index}>{name}</div> : null
              )}
            </div>
          )}

          <button className="ready" onClick={startGame}>
            Everyone ready?
          </button>
        </div>
      )}

      {gameStarted && !gameOver && <p>{turn}</p>}

      {/* {gameStarted && !gameOver && <button onClick={endGame}>Game Over</button>} */}

      {gameOver && <p>Congratulations, {activeUsers[1]}!</p>}

      {/* <p>ACTIVE USERS LENGTH: {activeUsers.length}</p>
          {activeUsers.map((name, index) => (
             <div key={index}>{name}</div> 
            ))} */}
      {/* <p>DEBUG LOGS:</p>
        <p>Active users: {activeUsers}</p> */}
      {/* <p>SIDEPANEL MESSAGE: {message}</p> */}
    </div>
  );
};
