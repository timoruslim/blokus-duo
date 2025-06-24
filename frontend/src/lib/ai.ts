import { GameState, Move } from "./types";
import { BOARD_SIZE } from "./constants";
import { getTransformedShape, isMoveValid, calculatePlacedScore } from "./pieceUtils";

// Heuristic
export function evaluate(state: GameState, player: 1 | 2): number {
   const opponent: 1 | 2 = player === 1 ? 2 : 1;

   const myScore = state.scores[`player${player}`];
   const opponentScore = state.scores[`player${opponent}`];

   return myScore - opponentScore;
}

// Get all valid moves
export function generateMoves(state: GameState): Move[] {
   const allPossibleMoves: Move[] = [];
   const player = state.currentPlayer;
   const pieces = player === 1 ? state.player1Pieces : state.player2Pieces;
   const isFirstMove = pieces.length === 21;

   for (const piece of pieces) {
      for (let flipCount = 0; flipCount < 2; flipCount++) {
         const flippedPiece = { ...piece, isFlipped: flipCount === 1 };
         for (let rotationCount = 0; rotationCount < 4; rotationCount++) {
            const finalPiece = {
               ...flippedPiece,
               rotation: rotationCount * 90,
            };
            const shape = getTransformedShape(finalPiece);

            // Check every possible position on the board
            for (let row = -shape.length + 1; row < BOARD_SIZE; row++) {
               for (let col = -shape[0].length + 1; col < BOARD_SIZE; col++) {
                  if (isMoveValid(state.board, shape, row, col, player, isFirstMove)) {
                     const move: Move = {
                        piece: finalPiece,
                        position: {
                           row: row,
                           col: col,
                        },
                     };
                     allPossibleMoves.push(move);
                  }
               }
            }
         }
      }
   }

   return allPossibleMoves;
}

// Apply move to state
function applyMove(state: GameState, move: Move): GameState {
   const newState: GameState = JSON.parse(JSON.stringify(state));
   const { piece, position } = move;

   const shape = getTransformedShape(piece);
   for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
         if (shape[r][c] === 1) {
            const boardRow = position.row + r;
            const boardCol = position.col + c;
            if (newState.board[boardRow] && newState.board[boardRow][boardCol] !== undefined) {
               newState.board[boardRow][boardCol] = piece.player;
            }
         }
      }
   }

   const playerKey = `player${piece.player}Pieces` as const;
   newState[playerKey] = newState[playerKey].filter((p) => p.id !== piece.id);

   const lastPiecePlayerKey = `player${piece.player}` as const;
   newState.lastPiecePlaced[lastPiecePlayerKey] = piece.id;

   newState.scores = {
      player1: calculatePlacedScore(state.board, 1),
      player2: calculatePlacedScore(state.board, 2),
   };

   newState.currentPlayer = piece.player === 1 ? 2 : 1;

   return newState;
}

// Calculate cost of a state (node) by recursive minimax
function minimax(
   state: GameState,
   depth: number,
   alpha: number,
   beta: number,
   isMaximizingPlayer: boolean,
   aiPlayer: 1 | 2
): number {
   // Base case 1: reached max depth
   if (depth === 0 || state.gameOver) {
      return evaluate(state, aiPlayer);
   }

   const possibleMoves = generateMoves(state);

   // Base case 2: no more valid moves
   if (possibleMoves.length === 0) {
      return evaluate(state, aiPlayer);
   }

   // Maximizing player: alpha
   if (isMaximizingPlayer) {
      let maxEval = -Infinity;
      for (const move of possibleMoves) {
         const childState = applyMove(state, move);
         const evalScore = minimax(childState, depth - 1, alpha, beta, false, aiPlayer);
         maxEval = Math.max(maxEval, evalScore);
         alpha = Math.max(alpha, evalScore);
         // Prune
         if (beta <= alpha) {
            break;
         }
      }
      return maxEval;
   }

   // Minimizing player: beta
   else {
      let minEval = Infinity;
      for (const move of possibleMoves) {
         const childState = applyMove(state, move);
         const evalScore = minimax(childState, depth - 1, alpha, beta, true, aiPlayer);
         minEval = Math.min(minEval, evalScore);
         beta = Math.min(beta, evalScore);
         // Prune
         if (beta <= alpha) {
            break;
         }
      }
      return minEval;
   }
}

// Find best move from certain state (node)
export function findBestMove(state: GameState, depth: number): Move | null {
   const aiPlayer = state.currentPlayer;
   const possibleMoves = generateMoves(state);

   if (possibleMoves.length === 0) {
      return null;
   }

   let bestMove: Move | null = possibleMoves[0];
   let maxEval = -Infinity;

   // Iterate through every move
   for (const move of possibleMoves) {
      const childState = applyMove(state, move);
      const evalScore = minimax(childState, depth - 1, -Infinity, Infinity, false, aiPlayer);

      // Found better move
      if (evalScore > maxEval) {
         maxEval = evalScore;
         bestMove = move;
      }
   }

   return bestMove;
}
