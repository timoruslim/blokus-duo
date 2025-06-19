"use client";

import { Piece as PieceType } from "@/lib/types";
import { COLORS } from "@/lib/constants";
import { useDraggable } from "@dnd-kit/core";

interface PieceProps {
   piece: PieceType;
   onRotate: () => void;
   onFlip: () => void;
}

export function Piece({ piece, onRotate, onFlip }: PieceProps) {
   // Styling
   const pieceColor = piece.player === 1 ? COLORS.PLAYER_1 : COLORS.PLAYER_2;
   const borderColor = piece.player === 1 ? COLORS.PLAYER_1_GRID : COLORS.PLAYER_2_GRID;
   const squareSize = "w-4 h-4 md:w-5 md:h-5";

   const shapeKey = piece.baseShape.map((r) => r.join("")).join(",");

   const handleWheel = (event: React.WheelEvent) => {
      event.preventDefault();
      onRotate();
   };

   const handleRightClick = (event: React.MouseEvent) => {
      event.preventDefault();
      onFlip();
   };

   const handleDragStart = (event: React.DragEvent) => {
      event.dataTransfer.setData("application/json", JSON.stringify(piece));
   };

   return (
      <div
         key={shapeKey}
         draggable="true"
         onDragStart={handleDragStart}
         className="grid cursor-pointer animate-fade-in"
         style={{
            gridTemplateColumns: `repeat(${piece.baseShape[0].length}, 1fr)`,
            transform: `rotate(${piece.rotation}deg) scaleX(${piece.isFlipped ? -1 : 1})`,
            transition: "transform 0.2s ease-out",
         }}
         onClick={onRotate} // Left click rotates
         onContextMenu={handleRightClick} // Right click flips
         onWheel={handleWheel} // Scrolling rotates
      >
         {piece.baseShape.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
               if (cell === 0) {
                  return <div key={`${rowIndex},${colIndex}`} className={squareSize} />;
               }
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
