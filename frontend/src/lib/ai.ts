import { GameState, Move, BoardState } from "./types";
import { getTransformedShape, isMoveValid, calculatePlacedScore } from "./pieceUtils";

type TranspositionTable = Map<string, { score: number; depth: number }>;

// Heuristic
function evaluate(state: GameState, player: 1 | 2): number {
   const opponent = player === 1 ? 2 : 1;

   // --- Heuristic 1: Score Difference (Material Advantage) ---
   const myScore = calculatePlacedScore(state.board, player);
   const opponentScore = calculatePlacedScore(state.board, opponent);
   const scoreComponent = myScore - opponentScore;

   // --- Heuristic 2: Mobility (Corner Control) ---
   const myMobility = findValidCorners(state.board, player).length;
   const opponentMobility = findValidCorners(state.board, opponent).length;
   const mobilityComponent = myMobility - opponentMobility;

   // -- Heurstic 3: Centrilization (Center Control) ---
   const playerCentralization = evaluateCentralization(state.board, player);
   const opponentCentralization = evaluateCentralization(state.board, opponent);
   const centralizationScore = playerCentralization - opponentCentralization;

   // --- Final Weighted Evaluation ---
   const scoreWeight = 1.0;
   const mobilityWeight = 0.9;
   const centralizationWeight = 0.5;
   const finalEvaluation =
      scoreWeight * scoreComponent +
      mobilityWeight * mobilityComponent +
      centralizationWeight * centralizationScore;

   return finalEvaluation;
}

// Calculate how centralized the pieces are
function evaluateCentralization(board: BoardState, player: number): number {
   let centralizationScore = 0;
   const centerI = Math.floor(board.length / 2);
   const centerJ = Math.floor(board[0].length / 2);

   for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
         if (board[i][j] === player) {
            const distFromCenter = Math.max(Math.abs(i - centerI), Math.abs(j - centerJ));
            centralizationScore += Math.max(centerI, centerJ) - distFromCenter;
         }
      }
   }
   return centralizationScore;
}

// Get all valid corners
export const findValidCorners = (
   board: BoardState,
   player: 1 | 2
): { row: number; col: number }[] => {
   const corners = new Set<string>();
   const boardSize = 14;

   for (let r = 0; r < boardSize; r++) {
      for (let c = 0; c < boardSize; c++) {
         // A potential corner must be an empty square
         if (board[r][c] !== 3) {
            continue;
         }

         let hasDiagonalFriend = false;
         let hasOrthogonalFriend = false;

         // Check all 8 neighbors
         for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
               if (dr === 0 && dc === 0) continue;

               const nr = r + dr;
               const nc = c + dc;

               if (nr >= 0 && nr < boardSize && nc >= 0 && nc < boardSize) {
                  if (board[nr][nc] === player) {
                     if (dr === 0 || dc === 0) {
                        // Is it an orthogonal neighbor?
                        hasOrthogonalFriend = true;
                     } else {
                        // It must be a diagonal neighbor
                        hasDiagonalFriend = true;
                     }
                  }
               }
            }
         }

         // A valid corner has a diagonal friendly piece, but NO orthogonal friendly pieces.
         if (hasDiagonalFriend && !hasOrthogonalFriend) {
            corners.add(`${r},${c}`);
         }
      }
   }

   return Array.from(corners).map((s) => {
      const [row, col] = s.split(",").map(Number);
      return { row, col };
   });
};

// Get all valid moves
export function generateMoves(state: GameState): Move[] {
   const possibleMoves = new Map<string, Move>(); // Use a Map to prevent duplicate moves
   const player = state.currentPlayer;
   const pieces = player === 1 ? state.player1Pieces : state.player2Pieces;
   const isFirstMove = pieces.length === 21;

   // Determine the set of squares to try placing pieces on
   let anchorPoints: { row: number; col: number }[];
   if (isFirstMove) {
      // The official starting points for Blokus Duo
      anchorPoints = player === 1 ? [{ row: 4, col: 4 }] : [{ row: 9, col: 9 }];
   } else {
      anchorPoints = findValidCorners(state.board, player);
   }

   // Set of unique shapes already processed to avoid redundant checks for symmetrical pieces
   const uniqueShapes = new Set<string>();

   for (const piece of pieces) {
      for (let flipCount = 0; flipCount < 2; flipCount++) {
         for (let rotationCount = 0; rotationCount < 4; rotationCount++) {
            const finalPiece = {
               ...piece,
               isFlipped: flipCount === 1,
               rotation: rotationCount * 90,
            };
            const shape = getTransformedShape(finalPiece);
            const shapeKey = JSON.stringify(shape);

            if (uniqueShapes.has(shapeKey)) continue;
            uniqueShapes.add(shapeKey);

            // For each valid anchor point on the board...
            for (const anchor of anchorPoints) {
               // ...try to align every part of the piece with that anchor
               for (let r_offset = 0; r_offset < shape.length; r_offset++) {
                  for (let c_offset = 0; c_offset < shape[r_offset].length; c_offset++) {
                     if (shape[r_offset][c_offset] === 1) {
                        const placeRow = anchor.row - r_offset;
                        const placeCol = anchor.col - c_offset;

                        if (
                           isMoveValid(state.board, shape, placeRow, placeCol, player, isFirstMove)
                        ) {
                           const move: Move = {
                              piece: finalPiece,
                              position: { row: placeRow, col: placeCol },
                           };
                           // Use a key to ensure we don't add the exact same move multiple times
                           const moveKey = `${finalPiece.id}-${finalPiece.rotation}-${finalPiece.isFlipped}-${placeRow}-${placeCol}`;
                           possibleMoves.set(moveKey, move);
                        }
                     }
                  }
               }
            }
         }
      }
   }
   return Array.from(possibleMoves.values());
}

// Apply move to state
function applyMove(state: GameState, move: Move): GameState {
   const newState: GameState = {
      ...state,
      board: state.board.map((row) => [...row]),
      player1Pieces: [...state.player1Pieces],
      player2Pieces: [...state.player2Pieces],
      scores: { ...state.scores },
      lastPiecePlaced: { ...state.lastPiecePlaced },
   };

   const { piece, position } = move;
   const shape = getTransformedShape(piece);
   for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
         if (shape[r][c] === 1) {
            const boardRow = position.row + r;
            const boardCol = position.col + c;
            if (newState.board[boardRow]?.[boardCol] !== undefined) {
               newState.board[boardRow][boardCol] = piece.player;
            }
         }
      }
   }
   const playerKey = `player${piece.player}Pieces` as const;
   newState[playerKey] = newState[playerKey].filter((p) => p.id !== piece.id);
   newState.scores = {
      player1: calculatePlacedScore(newState.board, 1),
      player2: calculatePlacedScore(newState.board, 2),
   };
   newState.currentPlayer = piece.player === 1 ? 2 : 1;
   return newState;
}

// Hash a board state
function getBoardKey(board: BoardState): string {
   return board.map((row) => row.join("")).join("");
}

// Calculate cost of a state (node) by recursive minimax
function minimax(
   state: GameState,
   depth: number,
   alpha: number,
   beta: number,
   isMaximizingPlayer: boolean,
   aiPlayer: 1 | 2,
   transpositionTable: TranspositionTable
): number {
   // Hash board state
   const boardKey = getBoardKey(state.board);
   const tableEntry = transpositionTable.get(boardKey);
   if (tableEntry && tableEntry.depth >= depth) {
      return tableEntry.score;
   }

   // Base case 1: reached max depth
   if (depth === 0 || state.gameOver) {
      return evaluate(state, aiPlayer);
   }

   const possibleMoves = generateMoves(state);

   // Base case 2: no more valid moves
   if (possibleMoves.length === 0) {
      return evaluate(state, aiPlayer);
   }

   const sortedMoves = possibleMoves.slice().sort((a, b) => {
      const pieceASize = a.piece.baseShape.reduce((total, row) => {
         const rowSum = row.reduce<number>((sum, cell) => sum + cell, 0);
         return total + rowSum;
      }, 0);

      const pieceBSize = b.piece.baseShape.reduce((total, row) => {
         const rowSum = row.reduce<number>((sum, cell) => sum + cell, 0);
         return total + rowSum;
      }, 0);

      return pieceBSize - pieceASize;
   });

   let bestEval;
   // Maximizing player: alpha
   if (isMaximizingPlayer) {
      bestEval = -Infinity;
      for (const move of sortedMoves) {
         const childState = applyMove(state, move);
         const evalScore = minimax(
            childState,
            depth - 1,
            alpha,
            beta,
            false,
            aiPlayer,
            transpositionTable
         );
         bestEval = Math.max(bestEval, evalScore);
         alpha = Math.max(alpha, evalScore);
         // Prune
         if (beta <= alpha) {
            break;
         }
      }
   }

   // Minimizing player: beta
   else {
      bestEval = Infinity;
      for (const move of sortedMoves) {
         const childState = applyMove(state, move);
         const evalScore = minimax(
            childState,
            depth - 1,
            alpha,
            beta,
            true,
            aiPlayer,
            transpositionTable
         );
         bestEval = Math.min(bestEval, evalScore);
         beta = Math.min(beta, evalScore);
         // Prune
         if (beta <= alpha) {
            break;
         }
      }
   }

   transpositionTable.set(boardKey, { score: bestEval, depth: depth });
   return bestEval;
}

// Find best move from certain state (node)
export async function findBestMove(state: GameState, depth: number): Promise<Move | null> {
   const aiPlayer = state.currentPlayer;
   let possibleMoves = generateMoves(state);

   if (possibleMoves.length === 0) {
      return null;
   }

   const transpositionTable: TranspositionTable = new Map();

   const sortedMoves = possibleMoves.slice().sort((a, b) => {
      const pieceASize = a.piece.baseShape.reduce((total, row) => {
         const rowSum = row.reduce<number>((sum, cell) => sum + cell, 0);
         return total + rowSum;
      }, 0);

      const pieceBSize = b.piece.baseShape.reduce((total, row) => {
         const rowSum = row.reduce<number>((sum, cell) => sum + cell, 0);
         return total + rowSum;
      }, 0);

      return pieceBSize - pieceASize;
   });

   let bestMove: Move | null = sortedMoves[0];
   let maxEval = -Infinity;

   // Iterate through every move
   for (const move of sortedMoves) {
      const childState = applyMove(state, move);
      const evalScore = minimax(
         childState,
         depth - 1,
         -Infinity,
         Infinity,
         false,
         aiPlayer,
         transpositionTable
      );

      // Found better move
      if (evalScore > maxEval) {
         maxEval = evalScore;
         bestMove = move;
      }

      await new Promise((resolve) => setTimeout(resolve, 0));
   }

   return bestMove;
}
