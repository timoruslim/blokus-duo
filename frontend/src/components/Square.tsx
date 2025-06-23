"use client";

import { SquareValue } from "@/lib/types";
import { COLORS } from "@/lib/constants";
import { useDroppable } from "@dnd-kit/core";

interface SquareProps {
   value: SquareValue;
   row: number;
   col: number;
   ghost: number;
   activePlayerForGhost: 1 | 2 | null;
}

function blendColors(baseHex: string, overlayHex: string, percent: number): string {
   // Clamp percent to [0, 100]
   percent = Math.max(0, Math.min(100, percent));
   const alpha = percent / 100;

   // Convert hex to RGB
   const hexToRgb = (hex: string) => {
      hex = hex.replace("#", "");
      if (hex.length === 3)
         hex = hex
            .split("")
            .map((c) => c + c)
            .join("");
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return { r, g, b };
   };

   // Blend the two colors
   const base = hexToRgb(baseHex);
   const overlay = hexToRgb(overlayHex);

   const blend = (c1: number, c2: number) => Math.round(c1 + (c2 - c1) * alpha);

   const r = blend(base.r, overlay.r);
   const g = blend(base.g, overlay.g);
   const b = blend(base.b, overlay.b);

   // Convert back to hex
   const toHex = (c: number) => c.toString(16).padStart(2, "0");

   return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function Square({ value, row, col, ghost, activePlayerForGhost }: SquareProps) {
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
   } else {
      bgColor = COLORS.EMPTY_SQUARE; // empty
      border = COLORS.GRID_LINES;
   }

   if (activePlayerForGhost === 1) {
      if (ghost == 1) {
         bgColor = blendColors(bgColor, "#ffffff", 60);
         border = blendColors(border, "#ffffff", 40);
      } else if (ghost == -1) {
         bgColor = blendColors(bgColor, "#ffffff", 30);
         border = blendColors(border, "#ffffff", 10);
      }
   } else if (activePlayerForGhost === 2) {
      if (ghost == 1) {
         bgColor = blendColors(bgColor, "#000000", 60);
         border = blendColors(border, "#000000", 40);
      } else if (ghost == -1) {
         bgColor = blendColors(bgColor, "#000000", 30);
         border = blendColors(border, "#000000", 10);
      }
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
         {value === 3 && (isP1Start || isP2Start) && (
            <div
               className={`w-1/3 h-1/3 rounded-full`}
               style={{ border: `2px solid ${COLORS.GRID_LINES}` }}
            ></div>
         )}
      </div>
   );
}
