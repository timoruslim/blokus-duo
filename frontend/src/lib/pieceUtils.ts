import { PieceShape } from "./types";

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
