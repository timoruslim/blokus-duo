import { BoardState, Piece, PieceShape } from "./types";

// Rotates 90 degrees clockwise.
export function rotateMatrix(matrix: PieceShape): PieceShape {
   const rows = matrix.length;
   const cols = matrix[0].length;

   const newMatrix: PieceShape = Array(cols)
      .fill(0)
      .map(() => Array(rows).fill(0));

   for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
         newMatrix[j][rows - 1 - i] = matrix[i][j];
      }
   }
   return newMatrix;
}

// Flip horizontally.
export function flipMatrix(matrix: PieceShape): PieceShape {
   const newMatrix = JSON.parse(JSON.stringify(matrix));
   newMatrix.forEach((row: number[]) => row.reverse());
   return newMatrix;
}

// Transform based on display
export function getTransformedShape(piece: Piece): PieceShape {
   let shape = piece.baseShape.map((row) => [...row]);
   const rotationCount = (piece.rotation / 90) % 4;

   if (piece.isFlipped) {
      shape = flipMatrix(shape);
   }

   for (let i = 0; i < rotationCount; i++) {
      shape = rotateMatrix(shape);
   }

   return shape;
}

// Count score
export function calculatePlacedScore(board: BoardState, player: 1 | 2): number {
   let score = 0;
   for (let r = 0; r < board.length; r++) {
      for (let c = 0; c < board[r].length; c++) {
         if (board[r][c] === player) {
            score++;
         }
      }
   }
   return score;
}

// Check if move is valid
export function isMoveValid(
   board: BoardState,
   shape: PieceShape,
   row: number,
   col: number,
   player: 1 | 2,
   isFirstMove: boolean
): boolean {
   const boardHeight = board.length;
   const boardWidth = board[0].length;
   let touchesCorner = false;
   let coversStartPoint = false;

   for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
         if (shape[r][c] === 1) {
            const boardRow = row + r;
            const boardCol = col + c;

            // 1. Bounds Check
            if (boardRow < 0 || boardRow >= boardHeight || boardCol < 0 || boardCol >= boardWidth) {
               return false; // Out of bounds
            }

            // 2. Overlap Check
            if (board[boardRow][boardCol] !== 3) {
               return false; // Overlaps with another piece
            }

            // 3. Adjacency Check (Edges of same color cannot touch)
            const neighbors = [
               [boardRow - 1, boardCol],
               [boardRow + 1, boardCol],
               [boardRow, boardCol - 1],
               [boardRow, boardCol + 1],
            ];
            for (const [nr, nc] of neighbors) {
               if (
                  nr >= 0 &&
                  nr < boardHeight &&
                  nc >= 0 &&
                  nc < boardWidth &&
                  board[nr][nc] === player
               ) {
                  return false;
               }
            }

            // For the first move, one square of the piece must cover the player's starting point
            if (isFirstMove) {
               const startRow = player === 1 ? 4 : 9;
               const startCol = player === 1 ? 4 : 9;
               if (boardRow === startRow && boardCol === startCol) {
                  coversStartPoint = true;
               }
            } else {
               // For subsequent moves, it must touch at least one corner of a same-colored piece
               const corners = [
                  [boardRow - 1, boardCol - 1],
                  [boardRow - 1, boardCol + 1],
                  [boardRow + 1, boardCol - 1],
                  [boardRow + 1, boardCol + 1],
               ];
               for (const [nr, nc] of corners) {
                  if (
                     nr >= 0 &&
                     nr < boardHeight &&
                     nc >= 0 &&
                     nc < boardWidth &&
                     board[nr][nc] === player
                  ) {
                     touchesCorner = true;
                  }
               }
            }
         }
      }
   }

   if (isFirstMove) {
      return coversStartPoint;
   }

   return touchesCorner;
}

// Check if there are playable moves
export function playerHasValidMoves(player: 1 | 2, board: BoardState, pieces: Piece[]): boolean {
   const boardHeight = board.length;
   const boardWidth = board[0].length;
   const isFirstMove = pieces.length === 21;

   // Check every remaining piece
   for (const piece of pieces) {
      // Check every possible orientation (4 rotations, 2 flips)
      for (let flipCount = 0; flipCount < 2; flipCount++) {
         const flippedPiece = { ...piece, isFlipped: flipCount === 1 };
         for (let rotationCount = 0; rotationCount < 4; rotationCount++) {
            const finalPiece = {
               ...flippedPiece,
               rotation: rotationCount * 90,
            };
            const shape = getTransformedShape(finalPiece);

            // Check every possible position on the board
            for (let row = -shape.length + 1; row < boardHeight; row++) {
               for (let col = -shape[0].length + 1; col < boardWidth; col++) {
                  if (isMoveValid(board, shape, row, col, player, isFirstMove)) {
                     return true; // Found a valid move!
                  }
               }
            }
         }
      }
   }

   return false; // No valid moves found for any piece in any orientation
}
