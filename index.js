"use strict";
class Model {
  // The state of the model and methods to modify the state
  constructor() {
    this.gameState = {
      player: {
        score: 0,
        weapon: "",
        status: "",
      },
      computer: {
        score: 0,
        weapon: "",
        status: "",
      },
      gameOver: false,
    };
  }
  // This method is different from the others
  // I pass a method from Views into callback argument
  // When the game state changes by invoking onGameStateChange
  // The View updates the displayUI with the current game state
  // I do this at the end of each round and when the game restarts

  bindGameStateChanged(callback) {
    this.onGameStateChanged = callback;
  }

  // All the methods here are to update the game state
  // Each method should just have one one job and do it well
  startRound(weapon) {
    this.setWeaponChoices(weapon);
    this.updateStatus(this.compareChoices());
    this.updateScore(this.compareChoices());
    this.checkForGameOver();
    this.onGameStateChanged(this.gameState);
  }

  setWeaponChoices(userWeapon) {
    const { player, computer } = this.gameState;
    player.weapon = userWeapon;
    computer.weapon = this.getRandomWeapon();
  }

  getRandomWeapon() {
    const randomNumber = Math.floor(Math.random() * 3);
    return ["paper", "rock", "scissors"][randomNumber];
  }

  // At first I used if statements to make comparisons
  // This took a lot of lines to write and was not scalable
  // It was easier to break it down to two functions
  // First function uses a object look for the weakness of a choice
  // Second function uses that weakness in a ternary statement
  getWeaknessOf(userChoice) {
    const weakness = {
      rock: "paper",
      paper: "scissors",
      scissors: "rock",
    };
    return weakness[userChoice];
  }
  compareChoices() {
    const { player, computer } = this.gameState;
    if (player.weapon === computer.weapon) return "TIE";
    const winner =
      computer.weapon === this.getWeaknessOf(player.weapon)
        ? "computer"
        : "player";
    return winner;
  }

  updateStatus(result) {
    ["player", "computer"].forEach((contestant) => {
      let statusResult;
      statusResult = contestant === result ? "Wins" : "Loses";
      if (result === "TIE") {
        statusResult = "Tie";
      }
      this.gameState[contestant].status = statusResult;
    });
  }

  updateScore(winner) {
    if (winner === "TIE") return;
    this.gameState[winner].score++;
  }
  checkForGameOver() {
    const { player, computer } = this.gameState;
    if (player.score >= 5 || computer.score >= 5) {
      this.gameState.gameOver = true;
    }
  }

  resetGame() {
    ["player", "computer"].forEach((item) => {
      this.gameState[item] = { score: 0, weapon: "", status: "" };
    });
    this.gameState.gameOver = false;
    this.onGameStateChanged(this.gameState);
  }
}

// Deals with the HTML and CSS
// I liked the getElement method makes it easier not to type out
// document.querySelector every time
// I wonder if there is a way to better organize my selections
class View {
  constructor() {
    this.playerScore = this.getElement("#playerScore");
    this.computerScore = this.getElement("#computerScore");
    this.weaponChoices = this.getElement(".js-weapon-choices");
    this.playerFeedback = this.getElement(".js-player-feedback");
    this.computerFeedback = this.getElement(".js-computer-feedback");
    this.imgPlayerWeapon = this.getElement("#player-weapon-img");
    this.imgComputerWeapon = this.getElement("#computer-weapon-img");
    this.resetBtn = this.getElement("#reset");
    this.gameOver = this.getElement(".gameFeedback");
    this.endResult = this.getElement(".gameover-screen__feedback");
  }
  getElement(selector) {
    const element = document.querySelector(selector);
    return element;
  }
  displayUI(state) {
    const { player, computer, gameOver } = state;
    this.updateImages(player.weapon, computer.weapon);
    this.updateScoreUI(player.score, computer.score);
    this.updateStatusUI(player.status, computer.status);
    this.updateGameoverUI(player.status, gameOver);
  }
  updateImages(playerWeapon, computerWeapon) {
    this.imgPlayerWeapon.src = `images/${playerWeapon}.png`;
    this.imgComputerWeapon.src = `images/${computerWeapon}.png`;
  }
  updateScoreUI(playerScore, computerScore) {
    this.playerScore.innerText = playerScore;
    this.computerScore.innerText = computerScore;
  }
  updateStatusUI(playerStatus, computerStatus) {
    this.playerFeedback.innerText = playerStatus;
    this.computerFeedback.innerText = computerStatus;
  }
  updateGameoverUI(player, gameOver) {
    this.endResult.innerText = player === "Wins" ? "You Won" : "You Lost";
    this.gameOver.dataset.gameover = gameOver;
  }

  bindUserChoice(handler) {
    this.weaponChoices.addEventListener("click", (e) => {
      if (e.target.nodeName === "BUTTON") {
        handler(e.target.dataset.option);
      }
    });
  }
  bindResetGame(handler) {
    this.resetBtn.addEventListener("click", (e) => {
      handler();
    });
  }
}

class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.model.bindGameStateChanged(this.onGameStateChanged);
    this.view.bindUserChoice(this.handleWeaponSelected);
    this.view.bindResetGame(this.handleResetGame);
  }
  onGameStateChanged = (state) => {
    this.view.displayUI(state);
  };

  handleWeaponSelected = (weapon) => {
    this.model.startRound(weapon);
  };
  handleResetGame = () => {
    this.model.resetGame();
  };
}

const app = new Controller(new Model(), new View());
