"use client";

import { Piece as PieceType } from "@/lib/types";
import { COLORS } from "@/lib/constants";
import { useDraggable } from "@dnd-kit/core";

interface PieceProps {
   piece: PieceType;
   isDragging?: boolean;
   squareSize?: number;
   onRotate?: () => void;
   onFlip?: () => void;
   disabled?: boolean;
}

export function Piece({
   piece,
   isDragging,
   squareSize = 20,
   onRotate,
   onFlip,
   disabled = false,
}: PieceProps) {
   const { attributes, listeners, setNodeRef } = useDraggable({
      id: piece.id + "_" + piece.player, // Each draggable item needs a unique ID
      data: { piece }, // We pass the full piece data with the drag event
      disabled: disabled,
   });

   // Styling
   const pieceColor = piece.player === 1 ? COLORS.PLAYER_1 : COLORS.PLAYER_2;
   const borderColor = piece.player === 1 ? COLORS.PLAYER_1_GRID : COLORS.PLAYER_2_GRID;

   const handleWheel = (event: React.WheelEvent) => {
      event.preventDefault();
      onRotate?.();
   };

   const handleRightClick = (event: React.MouseEvent) => {
      event.preventDefault();
      onFlip?.();
   };

   return (
      <div
         ref={setNodeRef} // Attaches the hook to this DOM element
         {...listeners} // Attaches event listeners for dragging (like onPointerDown)
         {...attributes} // Attaches accessibility attributes
         className={`grid ${disabled ? "cursor-not-allowed" : "cursor-pointer"} animate-fade-in`}
         style={{
            gridTemplateColumns: `repeat(${piece.baseShape[0].length}, 1fr)`,
            transform: `rotate(${piece.rotation}deg) scaleX(${piece.isFlipped ? -1 : 1})`,
            transition: "transform 0.2s ease-out",
            opacity: disabled ? 0.6 : isDragging ? 0.5 : 1,
         }}
         onClick={disabled ? undefined : onRotate} // Left click rotates
         onContextMenu={disabled ? undefined : handleRightClick} // Right click flips
         onWheel={disabled ? undefined : handleWheel} // Scrolling rotates
      >
         {piece.baseShape.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
               if (cell === 0) {
                  return <div key={`${rowIndex},${colIndex}`} />;
               }
               return (
                  <div
                     key={`${rowIndex},${colIndex}`}
                     style={{
                        width: `${squareSize}px`,
                        height: `${squareSize}px`,
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
