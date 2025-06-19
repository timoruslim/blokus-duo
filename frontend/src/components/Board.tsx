"use client";

import { BoardState, Piece } from "@/lib/types";
import { COLORS } from "@/lib/constants";
import { Square } from "./Square";

interface BoardProps {
   boardState: BoardState;
   onDrop: (piece: Piece, row: number, col: number) => void;
}

export function Board({ boardState, onDrop }: BoardProps) {
   return (
      <div className={`bg-[${COLORS.GRID_LINES}] p-1 rounded-sm shadow-lg`}>
         <div className="grid grid-cols-14">
            {boardState.map((row, rowIndex) =>
               row.map((squareValue, colIndex) => (
                  <Square
                     key={`${rowIndex},${colIndex}`}
                     value={squareValue}
                     row={rowIndex} // Pass down the row index
                     col={colIndex} // Pass down the column index
                     onDrop={onDrop} // Pass down the drop handler
                  />
               ))
            )}
         </div>
      </div>
   );
}
