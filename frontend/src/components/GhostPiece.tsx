import React from "react";
import { Piece as PieceType } from "@/lib/types";
import { getTransformedShape } from "@/lib/pieceUtils";
import { COLORS } from "@/lib/constants";

interface GhostPieceProps {
   piece: PieceType;
   squareSize: number;
   isValid: boolean;
}

export function GhostPiece({ piece, squareSize, isValid }: GhostPieceProps) {
   if (!squareSize) {
      return null;
   }
   // piece.player
   const shape = getTransformedShape(piece);
   const color = isValid ? COLORS.PLAYER_1_VALID : COLORS.PLAYER_1_INVALID;

   return (
      <div
         className="grid pointer-events-none"
         style={{
            gridTemplateRows: `repeat(${shape.length}, ${squareSize}px)`,
            gridTemplateColumns: `repeat(${shape[0].length}, ${squareSize}px)`,
         }}
      >
         {shape.map((row, r) =>
            row.map((cell, c) => {
               if (cell === 0) {
                  return <div key={`${r}-${c}`} />;
               }
               return (
                  <div
                     key={`${r}-${c}`}
                     style={{
                        width: squareSize,
                        height: squareSize,
                        backgroundColor: color,
                        // Add a subtle border to distinguish squares
                        border: `1px solid rgba(255, 255, 255, 0.2)`,
                     }}
                  />
               );
            })
         )}
      </div>
   );
}
