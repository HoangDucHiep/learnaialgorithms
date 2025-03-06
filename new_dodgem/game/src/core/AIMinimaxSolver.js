export class MinimaxSolver {
  constructor(gameSize, depth) {
    this.gameSize = gameSize;
    this.depth = depth;

    this.AIEvalMatrix = aiMatrixGenerator(gameSize);
    this.personEvalMatrix = personEvalMatrix(gameSize);
  }

  _currentValidMovesEvaled(game) {
    const moves = game.getCurrentValidMoves();
    moves.sort((a, b) => {
      const cloneA = game.getSameIdClone();
      cloneA.move(a.pieceId, a.move);
      const evalA = this.evaluate(cloneA);

      const cloneB = game.getSameIdClone();
      cloneB.move(b.pieceId, b.move);
      const evalB = this.evaluate(cloneB);

      return evalB - evalA;
    });

    return moves;
  }

  getBestMove(game) {
    let bestMove = null;
    let bestVal = -Infinity;

    const moves = this._currentValidMovesEvaled(game);

    let alpha = -Infinity;
    let beta = Infinity;
    moves.forEach((move) => {
      const clone = game.getSameIdClone();
      clone.move(move.pieceId, move.move);

      const val = this.minVal(clone, this.depth - 1, alpha, beta);

      if (val > bestVal) {
        bestVal = val;
        bestMove = move;
      }

      alpha = Math.max(alpha, bestVal);
    });

    if (!bestMove) {
      return null;
    }

    return bestMove;
  }

  maxVal(game, depth, alpha = -Infinity, beta = Infinity) {
    if (depth === 0 || game.isOver) {
      return this.evaluate(game);
    }

    let val = -Infinity;
    const moves = this._currentValidMovesEvaled(game);

    for (const move of moves) {
      const clone = game.getSameIdClone();
      clone.move(move.pieceId, move.move);
      val = Math.max(val, this.minVal(clone, depth - 1, alpha, beta));
      alpha = Math.max(alpha, val);

      if (alpha >= beta) {
        break;
      }
    }
    return val;
  }

  minVal(game, depth, alpha = -Infinity, beta = Infinity) {
    if (depth === 0 || game.isOver) {
      return this.evaluate(game);
    }

    let val = Infinity;

    const moves = this._currentValidMovesEvaled(game);

    for (const move of moves) {
      const clone = game.getSameIdClone();
      clone.move(move.pieceId, move.move);
      val = Math.min(val, this.maxVal(clone, depth - 1, alpha, beta));
      beta = Math.min(beta, val);

      if (alpha >= beta) {
        break;
      }
    }
    return val;
  }

  evaluate(game) {
    let score = 0;

    if (game.isOver) {
      if (game.winner === game.player2) {
        return Infinity;
      } else if (game.winner === game.player1) {
        return -Infinity;
      }
    }

    const BLOCK_BONUS = 5 * this.gameSize * (this.gameSize - 2); // so for 4x4 board (or 3x3 game), 5 * 4 * 2 = 40
    const INDIRECT_BLOCK_BONUS = 5 * (this.gameSize - 1) * (this.gameSize - 2); // so for 4x4 board (or 3x3 game), 5 * 3 * 2 = 30

    game.player2.pieces.forEach((piece) => {
      score += this.AIEvalMatrix[piece.position.x][piece.position.y];
    });

    game.player1.pieces.forEach((piece) => {
      score += this.personEvalMatrix[piece.position.x][piece.position.y];
    });

    game.player1.pieces.forEach((personPiece) => {
      const { x: xP, y: yP } = personPiece.position;

      const playerBlockAi = { x: xP, y: yP - 1 };
      const playerIndirectBlockAi = { x: xP, y: yP - 2 };

      const AiBlockPlayer = { x: xP - 1, y: yP };
      const AiIndirectBlockPlayer = { x: xP - 2, y: yP };

      if (game._isInBoard({ x: playerBlockAi.x, y: playerBlockAi.y })) {
        game.player2.pieces.find((piece) => {
          if (
            piece.position.x === playerBlockAi.x &&
            piece.position.y === playerBlockAi.y
          ) {
            score -= BLOCK_BONUS;
          }
        });
      }

      if (
        game._isInBoard({
          x: playerIndirectBlockAi.x,
          y: playerIndirectBlockAi.y,
        })
      ) {
        game.player2.pieces.find((piece) => {
          if (
            piece.position.x === playerIndirectBlockAi.x &&
            piece.position.y === playerIndirectBlockAi.y
          ) {
            score -= INDIRECT_BLOCK_BONUS;
          }
        });
      }

      if (game._isInBoard({ x: AiBlockPlayer.x, y: AiBlockPlayer.y })) {
        game.player1.pieces.find((piece) => {
          if (
            piece.position.x === AiBlockPlayer.x &&
            piece.position.y === AiBlockPlayer.y
          ) {
            score += BLOCK_BONUS;
          }
        });
      }

      if (
        game._isInBoard({
          x: AiIndirectBlockPlayer.x,
          y: AiIndirectBlockPlayer.y,
        })
      ) {
        game.player1.pieces.find((piece) => {
          if (
            piece.position.x === AiIndirectBlockPlayer.x &&
            piece.position.y === AiIndirectBlockPlayer.y
          ) {
            score += INDIRECT_BLOCK_BONUS;
          }
        });
      }
    });
    return score;
  }
}

export function aiMatrixGenerator(size) {
  const matrix = Array(size)
    .fill(null)
    .map(() => Array(size).fill(5 * (size - 1) * size));
  const buffer = 5 * (size - 1);

  for (let i = 1; i < size; i++) {
    const baseNumber = (size - i - 1) * 5;
    for (let j = 0; j < size - 1; j++) {
      matrix[i][j] = baseNumber + j * buffer;
    }
  }
  return matrix;
}

export function personEvalMatrix(size) {
  const matrix = Array(size)
    .fill(null)
    .map(() => Array(size).fill(-5 * (size - 1) * size));
  const buffer = 5 * (size - 1);

  for (let i = 1; i < size; i++) {
    const baseNumber = (size - i - 1) * buffer;
    for (let j = 0; j < size - 1; j++) {
      matrix[i][j] = -baseNumber - j * 5;
    }
  }

  return matrix;
}

console.log(personEvalMatrix(4));
console.log(aiMatrixGenerator(4));

console.log(personEvalMatrix(5));
console.log(aiMatrixGenerator(5));
