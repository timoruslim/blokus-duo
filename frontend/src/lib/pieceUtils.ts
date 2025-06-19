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
   let shape = piece.baseShape;
   const rotationCount = (piece.rotation / 90) % 4;

   for (let i = 0; i < rotationCount; i++) {
      shape = rotateMatrix(shape);
   }

   if (piece.isFlipped) {
      shape = flipMatrix(shape);
   }

   return shape;
}

export function isMoveValid(
   board: BoardState,
   shape: PieceShape,
   row: number,
   col: number
): boolean {
   const boardHeight = board.length;
   const boardWidth = board[0].length;

   for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
         if (shape[r][c] === 1) {
            const boardRow = row + r;
            const boardCol = col + c;

            // 1. Bounds Check: Is the piece within the board?
            if (boardRow < 0 || boardRow >= boardHeight || boardCol < 0 || boardCol >= boardWidth) {
               return false; // Out of bounds
            }

            // 2. Overlap Check: Is the square on the board already occupied?
            if (board[boardRow][boardCol] !== 0) {
               return false; // Overlaps with another piece
            }
         }
      }
   }

   // Note: We will add the corner-touching rules later.
   // For now, any valid placement is allowed.
   return true;
}
