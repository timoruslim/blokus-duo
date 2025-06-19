"use client";

import { SquareValue, Piece } from "@/lib/types";
import { COLORS } from "@/lib/constants";

interface SquareProps {
   value: SquareValue;
   row: number;
   col: number;
   onDrop: (piece: Piece, row: number, col: number) => void;
}

export function Square({ value, row, col, onDrop }: SquareProps) {
   let bgColor = "";
   let border = "";

   if (value === 1) {
      bgColor = COLORS.PLAYER_1; // black
      border = COLORS.PLAYER_1_GRID;
   } else if (value === 2) {
      bgColor = COLORS.PLAYER_2; // white
      border = COLORS.PLAYER_2_GRID;
   } else {
      bgColor = COLORS.EMPTY_SQUARE; // empty
      border = COLORS.GRID_LINES;
   }

   const squareSize = "w-4 h-4 md:w-5 md:h-5";

   const handleDragOver = (event: React.DragEvent) => {
      // This is necessary to allow the drop event to fire.
      event.preventDefault();
   };

   const handleDrop = (event: React.DragEvent) => {
      event.preventDefault();
      const piece = JSON.parse(event.dataTransfer.getData("application/json"));
      onDrop(piece, row, col);
   };

   return (
      <div
         onDragOver={handleDragOver}
         onDrop={handleDrop}
         className={`aspect-square w-full`}
         style={{
            backgroundColor: bgColor,
            border: `1px solid ${border}`,
         }}
      ></div>
   );
}
