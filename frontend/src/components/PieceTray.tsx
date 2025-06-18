"use client";

import { Piece as PieceType } from "@/lib/types";
import { Piece } from "./Piece";

interface PieceTrayProps {
   pieces: PieceType[];
}

export function PieceTray({ pieces }: PieceTrayProps) {
   return (
      <div className="flex flex-wrap gap-4 items-center justify-center p-4 border border-gray-600 rounded-lg w-1/2">
         {pieces.map((piece) => (
            <Piece key={piece.id} piece={piece} />
         ))}
      </div>
   );
}
