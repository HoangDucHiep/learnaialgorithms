import MinimaxSolver from "./AIMinimaxSolver.js";
import Piece from "./Piece.js";

import Player from "./Player.js";

export const PLAYER1 = 0;
export const PLAYER2 = 1;
export const PLAYER1_COLOR = "red";
export const PLAYER2_COLOR = "blue";

export default class Game {
  static AI_MOVES = [
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
  ];

  static PLAYER_MOVES = [
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];

  constructor(size) {
    this.id = `game-${Date.now()}`;
    this.gameSize = size;
    this.boardSize = size + 1;
    this.players = [];
    this.board = Array.from({ length: this.boardSize }, () =>
      Array(this.boardSize).fill(null)
    );
    this.currentPlayer = PLAYER1;
    this.winner = null;
    this.isOver = false;
  }

  start(player1, player2) {
    this.players = [player1, player2];
    this.#initializeBoard();
    if (player2.isAI) {
      this.aiSolver = new MinimaxSolver(this, 5);
    }
  }

  playTurn(pieceId, newPosition) {
    if (this.isOver) return false;

    if (!this.validateMove(pieceId, newPosition)) return false;

    const piece = this.players[this.currentPlayer].pieces.find(
      (p) => p.id === pieceId
    );

    this.board[piece.position.x][piece.position.y] = null;
    piece.position = newPosition;
    this.board[piece.position.x][piece.position.y] = piece;

    if (this.#isInDestinationTile(piece)) {
      this.players[this.currentPlayer].pieces = this.players[
        this.currentPlayer
      ].pieces.filter((p) => p.id !== pieceId);
      this.board[piece.position.x][piece.position.y] = null;
    }

    if (this.players[this.currentPlayer].pieces.length === 0) {
      this.isOver = true;
      this.winner = this.currentPlayer;
    }

    this.currentPlayer = this.currentPlayer === PLAYER1 ? PLAYER2 : PLAYER1;
    return true;
  }

  aiMove() {
    return new Promise((resolve) => {
      if (this.isOver) return resolve(false);

      const randomMove = this.aiSolver.getBestMove();
      setTimeout(() => {
        this.playTurn(randomMove.pieceId, randomMove.move);
        resolve(true);
      }, 100); // Delay 100ms for AI move
    });
  }

  validateMove(pieceId, newPosition) {
    const piece = this.players[this.currentPlayer].pieces.find(
      (p) => p.id === pieceId
    );
    if (!piece) {
      return false;
    }

    const { x, y } = piece.position;
    const { x: newX, y: newY } = newPosition;

    // check if the new position is within the board
    if (
      newX < 0 ||
      newX >= this.boardSize ||
      newY < 0 ||
      newY >= this.boardSize
    ) {
      return false;
    }

    // check if the new position is empty
    if (this.board[newX][newY]) {
      return false;
    }

    // move only one step
    if (Math.abs(x - newX) > 1 || Math.abs(y - newY) > 1) {
      return false;
    }

    // check to ensure no cross move
    if (Math.abs(x - newX) * Math.abs(y - newY) !== 0) {
      return false;
    }

    // check if the new position is not the other player's destination
    const otherPlayerDes =
      this.currentPlayer === PLAYER1 ? this.player2Des : this.player1Des;
    if (otherPlayerDes.some((des) => des.x === newX && des.y === newY)) {
      return false;
    }

    // for player1, can only move up, left, right
    if (this.currentPlayer === PLAYER1) {
      if (newX > x) {
        return false;
      }
    }

    // for player2, can only move right, up, down
    if (this.currentPlayer === PLAYER2) {
      if (newY < y) {
        return false;
      }
    }

    return true;
  }

  #isInDestinationTile(piece) {
    const playerId = piece.player;
    const destination =
      this.players[PLAYER1].id === playerId ? this.player1Des : this.player2Des;
    return destination.some(
      (des) => des.x === piece.position.x && des.y === piece.position.y
    );
  }

  #initializeBoard() {
    const player1 = this.players[PLAYER1];
    const player2 = this.players[PLAYER2];

    for (let i = 1; i < this.gameSize; i++) {
      const p1_piece = new Piece(PLAYER1_COLOR, player1.id, {
        x: this.gameSize,
        y: i,
      });
      const p2_piece = new Piece(PLAYER2_COLOR, player2.id, { x: i, y: 0 });

      this.board[this.gameSize][i] = p1_piece;
      this.board[i][0] = p2_piece;

      player1.pieces.push(p1_piece);
      player2.pieces.push(p2_piece);
    }

    this.player1Des = Array.from({ length: this.gameSize }, (_, i) => ({
      x: 0,
      y: i,
    }));
    this.player2Des = Array.from({ length: this.gameSize }, (_, i) => ({
      x: i + 1,
      y: this.gameSize,
    }));
  }

  _displayBoard() {
    console.log(
      this.board
        .map((row) => row.map((cell) => (cell ? cell.color : "_")).join(" | "))
        .join("\n")
    );
  }

  clone() {
    const newGame = new Game(this.gameSize);
    newGame.players = this.players.map((player) => player.clone());
    
    newGame.board = this.board.map((
      row => {
        return row.map((cell) => {
          if (cell) {
            return cell.clone();
          }
          return null;
        });
      }
    ));

    return newGame;


  }

  sameIdClone() {
    const newGame = new Game(this.gameSize);
    newGame.players = this.players.map((player) => player.sameIdClone());
    newGame.board = this.board.map((row) => {
      return row.map((cell) => {
        if (cell) {
          return cell.sameIdClone();
        }
        return null;
      });
    });

    newGame.id = this.id;
    newGame.currentPlayer = this.currentPlayer;
    newGame.winner = this.winner;
    newGame.isOver = this.isOver;
    newGame.player1Des = this.player1Des;
    newGame.player2Des = this.player2Des;
    return newGame;
  }
}

/* let game = new Game(3);
let player1 = new Player("player1");
let player2 = new Player("player2");

game.start(player1, player2);
console.log("\n------------------\n");
game._displayBoard();

game.playTurn(player1.pieces[0].id, { x: 2, y: 1 });
console.log("\n------------------\n");
game._displayBoard();

game.playTurn(player2.pieces[0].id, { x: 1, y: 1 });
console.log("\n------------------\n");
game._displayBoard();


game.playTurn(player1.pieces[1].id, { x: 2, y: 2 });
console.log("\n------------------\n");
game._displayBoard();

game.playTurn(player2.pieces[0].id, { x: 1, y: 2 });
console.log("\n------------------\n");
game._displayBoard();


game.playTurn(player1.pieces[0].id, { x: 1, y: 1 });
console.log("\n------------------\n");
game._displayBoard();

game.playTurn(player2.pieces[0].id, { x: 1, y: 3 });
console.log("\n------------------\n");
game._displayBoard();

game.playTurn(player1.pieces[0].id, { x: 0, y: 1 });
console.log("\n------------------\n");
game._displayBoard();

game.playTurn(player2.pieces[0].id, { x: 2, y: 1 });
console.log("\n------------------\n");
game._displayBoard();

game.playTurn(player1.pieces[0].id, { x: 1, y: 2 });
console.log("\n------------------\n");
game._displayBoard();

game.playTurn(player2.pieces[0].id, { x: 2, y: 2 });
console.log("\n------------------\n");
game._displayBoard();

game.playTurn(player1.pieces[0].id, { x: 0, y: 2 });
console.log("\n------------------\n");
game._displayBoard(); */
