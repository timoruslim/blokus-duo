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
   const ghostOverlay = boardState.map((row) => Array(row.length).fill(0));

   if (ghostPiece) {
      const ghostShape = getTransformedShape(ghostPiece.piece);
      const ghostMultiplier = ghostPiece.isValid ? 1 : -1; // 1 for valid, -1 for invalid

      for (let r = 0; r < ghostShape.length; r++) {
         for (let c = 0; c < ghostShape[r].length; c++) {
            if (ghostShape[r][c] === 1) {
               const boardRow = ghostPiece.row + r;
               const boardCol = ghostPiece.col + c;

               // Paint the ghost piece only if it's within the board bounds
               if (boardRow >= 0 && boardRow < 14 && boardCol >= 0 && boardCol < 14) {
                  ghostOverlay[boardRow][boardCol] = ghostMultiplier;
               }
            }
         }
      }
   }

   return (
      <div className={`p-1 rounded-sm shadow-lg`}>
         <div className="grid grid-cols-14">
            {displayBoard.map((row, rowIndex) =>
               row.map((squareValue, colIndex) => (
                  <Square
                     key={`${rowIndex},${colIndex}`}
                     value={squareValue}
                     row={rowIndex}
                     col={colIndex}
                     ghost={ghostOverlay[rowIndex][colIndex]}
                     activePlayerForGhost={activePlayer}
                  />
               ))
            )}
         </div>
      </div>
   );
}
