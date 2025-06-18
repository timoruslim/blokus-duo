"use client";

import { Piece as PieceType } from "@/lib/types";
import { COLORS } from "@/lib/constants";

interface PieceProps {
   piece: PieceType;
   onSelect: (piece: PieceType) => void;
   onRotate: () => void;
   onFlip: () => void;
   isSelected: boolean;
}

export function Piece({ piece, onSelect, onRotate, onFlip, isSelected }: PieceProps) {
   // Styling
   const pieceColor = piece.player === 1 ? COLORS.PLAYER_1 : COLORS.PLAYER_2;
   const borderColor = piece.player === 1 ? COLORS.PLAYER_1_GRID : COLORS.PLAYER_2_GRID;
   const squareSize = "w-4 h-4 md:w-5 md:h-5";
   const selectionStyle = isSelected ? { outline: "3px solid #FBBF24" } : {};

   const handleWheel = (event: React.WheelEvent) => {
      event.preventDefault();
      onRotate();
   };

   return (
      <div
         className="grid cursor-pointer"
         style={{
            gridTemplateColumns: `repeat(${piece.shape[0].length}, 1fr)`,
            ...selectionStyle,
         }}
         onClick={() => onSelect(piece)}
         onWheel={isSelected ? handleWheel : undefined}
         onDoubleClick={isSelected ? onFlip : undefined}
      >
         {piece.shape.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
               // Empty cell
               if (cell === 0) {
                  return <div key={`${rowIndex},${colIndex}`} className={squareSize} />;
               }
               // Filled cell
               return (
                  <div
                     key={`${rowIndex},${colIndex}`}
                     className={squareSize}
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
