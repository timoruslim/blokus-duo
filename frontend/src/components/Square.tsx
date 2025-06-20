"use client";

import { SquareValue } from "@/lib/types";
import { COLORS } from "@/lib/constants";
import { useDroppable } from "@dnd-kit/core";

interface SquareProps {
   value: SquareValue;
   row: number;
   col: number;
   activePlayerForGhost: 1 | 2 | null;
}

export function Square({ value, row, col, activePlayerForGhost }: SquareProps) {
   const { setNodeRef } = useDroppable({
      id: `cell-${row}-${col}`,
   });

   let bgColor = "";
   let border = "";

   if (value === 1) {
      bgColor = COLORS.PLAYER_1; // black
      border = COLORS.PLAYER_1_GRID;
   } else if (value === 2) {
      bgColor = COLORS.PLAYER_2; // white
      border = COLORS.PLAYER_2_GRID;
   } else if (value === 0) {
      bgColor = COLORS.EMPTY_SQUARE; // empty
      border = COLORS.GRID_LINES;
   } else {
      let ghostColor;
      const isInvalid = value === -1;

      if (activePlayerForGhost === 1) {
         ghostColor = isInvalid ? COLORS.PLAYER_1_INVALID : COLORS.PLAYER_1_VALID;
      } else if (activePlayerForGhost === 2) {
         ghostColor = isInvalid ? COLORS.PLAYER_2_INVALID : COLORS.PLAYER_2_VALID;
      } else {
         // Fallback case, though a ghost shouldn't appear if there's no active player
         ghostColor = "transparent";
      }

      bgColor = ghostColor;
      border = COLORS.GRID_LINES;
   }

   const isP1Start = row === 4 && col === 4;
   const isP2Start = row === 9 && col === 9;

   return (
      <div
         ref={setNodeRef}
         className={`aspect-square w-full flex items-center justify-center`}
         style={{
            backgroundColor: bgColor,
            border: `1px solid ${border}`,
         }}
      >
         {value === 0 && (isP1Start || isP2Start) && (
            <div
               className={`w-1/3 h-1/3 rounded-full`}
               style={{ border: `2px solid ${COLORS.GRID_LINES}` }}
            ></div>
         )}
      </div>
   );
}
