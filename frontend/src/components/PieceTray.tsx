"use client";

import { Piece as PieceType } from "@/lib/types";
import { Piece } from "./Piece";

interface PieceTrayProps {
   pieces: PieceType[];
   onPieceRotate: (pieceId: string, player: 1 | 2) => void;
   onPieceFlip: (pieceId: string, player: 1 | 2) => void;
}

export function PieceTray({ pieces, onPieceRotate, onPieceFlip }: PieceTrayProps) {
   return (
      <div className="flex flex-wrap items-center gap-2 justify-center p-2 border border-gray-600 rounded-lg w-96">
         {pieces.map((piece) => (
            <div key={piece.id} className="w-24 h-24 flex items-center justify-center p-1">
               <Piece
                  piece={piece}
                  onRotate={() => onPieceRotate(piece.id, piece.player)}
                  onFlip={() => onPieceFlip(piece.id, piece.player)}
               />
            </div>
         ))}
      </div>
   );
}
