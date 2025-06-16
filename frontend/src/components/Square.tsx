"use client";

import { SquareValue } from "@/lib/types";

interface SquareProps {
   value: SquareValue;
}

export function Square({ value }: SquareProps) {
   let bgColor = "";
   let border = "";

   if (value === 1) {
      bgColor = "#151515"; // black
      border = "#222222";
   } else if (value === 2) {
      bgColor = "#e8e8e8"; // white
      border = "#cccccc";
   } else {
      bgColor = "#2A2A2A"; // empty
      border = "#3a3a3a";
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
