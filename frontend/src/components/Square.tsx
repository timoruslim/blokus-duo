"use client";

import { SquareValue } from "@/lib/types";

interface SquareProps {
   value: SquareValue;
}

export function Square({ value }: SquareProps) {
   let bgColor = "";

   if (value === 1) {
      bgColor = "bg-neutral-800"; // black
   } else if (value === 2) {
      bgColor = "bg-neutral-100"; // white
   } else {
      bgColor = "bg-neutral-700"; // empty
   }

   return <div className={`aspect-square w-full ${bgColor}`}></div>;
}
