"use client";

import { BoardState } from "@/lib/types";
import { Square } from "./Square";

interface BoardProps {
   boardState: BoardState;
}

export function Board({ boardState }: BoardProps) {
   return (
      <div className="bg-neutral-900 p-2 rounded-lg shadow-lg">
         <div className="grid grid-cols-14 gap-px bg-neutral-500">
            {boardState.map((row, rowIndex) =>
               row.map((squareValue, colIndex) => (
                  <Square key={`${rowIndex}-${colIndex}`} value={squareValue} />
               ))
            )}
         </div>
      </div>
   );
}
