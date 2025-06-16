"use client";

import { BoardState } from "@/lib/types";
import { Square } from "./Square";

interface BoardProps {
   boardState: BoardState;
}

export function Board({ boardState }: BoardProps) {
   return (
      <div className="bg-[#3A3A3A] p-1 rounded-sm shadow-lg">
         <div className="grid grid-cols-14">
            {boardState.map((row, rowIndex) =>
               row.map((squareValue, colIndex) => (
                  <Square key={`${rowIndex}-${colIndex}`} value={squareValue} />
               ))
            )}
         </div>
      </div>
   );
}
