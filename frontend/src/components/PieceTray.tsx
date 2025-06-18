"use client";

import { Piece as PieceType } from "@/lib/types";
import { Piece } from "./Piece";

interface PieceTrayProps {
   pieces: PieceType[];
   onPieceSelect: (piece: PieceType) => void;
   onPieceRotate: () => void;
   onPieceFlip: () => void;
   selectedPiece: PieceType | null;
}

export function PieceTray({
   pieces,
   onPieceSelect,
   onPieceRotate,
   onPieceFlip,
   selectedPiece,
}: PieceTrayProps) {
   return (
      <div className="flex flex-wrap items-center gap-4 justify-center p-4 border border-gray-600 rounded-lg w-80">
         {pieces.map((piece) => (
            <Piece
               key={piece.id}
               piece={piece}
               onSelect={onPieceSelect}
               onRotate={onPieceRotate} // Pass down rotate handler
               onFlip={onPieceFlip} // Pass down flip handler
               isSelected={selectedPiece?.id === piece.id}
            />
         ))}
      </div>
   );
}
