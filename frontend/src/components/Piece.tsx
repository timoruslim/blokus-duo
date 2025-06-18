"use client";

import { Piece as PieceType } from "@/lib/types";
import { COLORS } from "@/lib/constants";

interface PieceProps {
   piece: PieceType;
}

export function Piece({ piece }: PieceProps) {
   // Colors
   const pieceColor = piece.player === 1 ? COLORS.PLAYER_1 : COLORS.PLAYER_2;
   const borderColor = piece.player === 1 ? COLORS.PLAYER_1_GRID : COLORS.PLAYER_2_GRID;

   return (
      <div
         className="grid"
         style={{
            gridTemplateColumns: `repeat(${piece.shape[0].length}, 1fr)`,
         }}
      >
         {piece.shape.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
               if (cell === 0) {
                  return <div key={`${rowIndex},${colIndex}`} />;
               }
               return (
                  <div
                     key={`${rowIndex},${colIndex}`}
                     className="w-4 h-4 md:w-5 md:h-5"
                     style={{
                        backgroundColor: pieceColor,
                        border: `1px solid ${borderColor}`,
                     }}
                  />
               );
            })
         )}
      </div>
   );
}
