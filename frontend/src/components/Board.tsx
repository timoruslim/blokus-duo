"use client";

import { BoardState, Piece as PieceType, SquareValue } from "@/lib/types";
import { Square } from "./Square";
import { getTransformedShape } from "@/lib/pieceUtils";

interface BoardProps {
   boardState: BoardState;
   ghostPiece: { piece: PieceType; row: number; col: number; isValid: boolean } | null;
   activePlayer: 1 | 2 | null;
}

export function Board({ boardState, ghostPiece, activePlayer }: BoardProps) {
   const displayBoard: BoardState = JSON.parse(JSON.stringify(boardState));

   if (ghostPiece) {
      const ghostShape = getTransformedShape(ghostPiece.piece);
      const ghostValue: SquareValue = ghostPiece.isValid ? -2 : -1; // -2 for valid, -1 for invalid

      for (let r = 0; r < ghostShape.length; r++) {
         for (let c = 0; c < ghostShape[r].length; c++) {
            if (ghostShape[r][c] === 1) {
               const boardRow = ghostPiece.row + r;
               const boardCol = ghostPiece.col + c;

               // Paint the ghost piece only if it's within the board bounds
               if (boardRow >= 0 && boardRow < 14 && boardCol >= 0 && boardCol < 14) {
                  displayBoard[boardRow][boardCol] = ghostValue;
               }
            }
         }
      }
   }

   return (
      <div className={`p-1 rounded-sm shadow-lg`}>
         <div className="grid grid-cols-14">
            {/* Render the grid using the new displayBoard */}
            {displayBoard.map((row, rowIndex) =>
               row.map((squareValue, colIndex) => (
                  <Square
                     key={`${rowIndex},${colIndex}`}
                     value={squareValue} // This value now includes ghost piece information
                     row={rowIndex}
                     col={colIndex}
                     activePlayerForGhost={activePlayer}
                  />
               ))
            )}
         </div>
         {/* The old, absolutely positioned ghost piece is no longer needed! */}
      </div>
   );
}
