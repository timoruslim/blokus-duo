"use client";

import { SquareValue } from "@/lib/types";
import { COLORS } from "@/lib/constants";

interface SquareProps {
   value: SquareValue;
}

export function Square({ value }: SquareProps) {
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

   return (
      <div
         className={`aspect-square w-full`}
         style={{
            backgroundColor: bgColor,
            border: `1px solid ${border}`,
         }}
      ></div>
   );
}
