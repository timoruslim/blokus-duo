"use client";

import { Piece as PieceType } from "@/lib/types";
import { Piece } from "./Piece";

interface PieceTrayProps {
   pieces: PieceType[];
   activePieceId: string | null;
   onPieceRotate: (pieceId: string, player: 1 | 2) => void;
   onPieceFlip: (pieceId: string, player: 1 | 2) => void;
   dragAttempt: number;
}

export function PieceTray({
   pieces,
   activePieceId,
   onPieceRotate,
   onPieceFlip,
   dragAttempt,
}: PieceTrayProps) {
   return (
      <div className="flex flex-wrap items-center gap-2 justify-center p-2 border border-gray-600 rounded-lg w-96">
         {pieces.map((piece) => (
            <div
               key={`${piece.id}_${piece.player}_${dragAttempt}`}
               className="w-24 h-24 flex items-center justify-center p-1"
            >
               <Piece
                  piece={piece}
                  onRotate={() => onPieceRotate(piece.id, piece.player)}
                  onFlip={() => onPieceFlip(piece.id, piece.player)}
                  isDragging={activePieceId === piece.id + "_" + piece.player}
               />
            </div>
         ))}
      </div>
   );
}
