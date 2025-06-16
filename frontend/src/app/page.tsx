"use client";

import { useState } from "react";
import { Board } from "@/components/Board";
import { BoardState } from "@/lib/types";

const createInitialBoard = (): BoardState => {
   return Array(14)
      .fill(null)
      .map(() => Array(14).fill(0));
};

export default function GamePage() {
   const [board, setBoard] = useState<BoardState>(createInitialBoard());

   return (
      <main className="flex flex-col items-center justify-center min-h-screen p-5 bg-[#121212]">
         <h1 className="text-4xl font-bold mb-6 text-white">Blokus Duo</h1>

         {/* Render the Board component, passing the current board state to it */}
         <div className="w-full max-w-lg">
            <Board boardState={board} />
         </div>
      </main>
   );
}
