"use client";

import { useState } from "react";
import { Board } from "@/components/Board";
import { PieceTray } from "@/components/PieceTray";
import { BoardState, Piece as PieceType, PieceTemplate } from "@/lib/types";
import { PIECE_LIBRARY } from "@/lib/pieces";
import { rotateMatrix, flipMatrix } from "@/lib/pieceUtils";

interface GameState {
   board: BoardState;
   player1Pieces: PieceType[];
   player2Pieces: PieceType[];
   currentPlayer: 1 | 2;
   selectedPiece: PieceType | null;
}

const createInitialBoard = (): BoardState => {
   return Array(14)
      .fill(null)
      .map(() => Array(14).fill(0));
};

const createPlayerSet = (player: 1 | 2): PieceType[] => {
   return PIECE_LIBRARY.map((template: PieceTemplate) => ({
      ...template,
      player: player,
   }));
};

export default function GamePage() {
   const [gameState, setGameState] = useState<GameState>({
      board: createInitialBoard(),
      player1Pieces: createPlayerSet(1),
      player2Pieces: createPlayerSet(2),
      currentPlayer: 1,
      selectedPiece: null,
   });

   const handleSelectPiece = (piece: PieceType) => {
      setGameState((prev) => ({
         ...prev,
         selectedPiece: prev.selectedPiece?.id === piece.id ? null : piece,
      }));
   };

   // These handlers now operate on the selectedPiece in the state
   const handleRotate = () => {
      if (!gameState.selectedPiece) return;
      const rotatedShape = rotateMatrix(gameState.selectedPiece.shape);
      setGameState((prev) => ({
         ...prev,
         selectedPiece: { ...prev.selectedPiece!, shape: rotatedShape },
      }));
   };

   const handleFlip = () => {
      if (!gameState.selectedPiece) return;
      const flippedShape = flipMatrix(gameState.selectedPiece.shape);
      setGameState((prev) => ({
         ...prev,
         selectedPiece: { ...prev.selectedPiece!, shape: flippedShape },
      }));
   };

   return (
      <main className="flex flex-row items-start justify-center h-screen min-h-screen p-5 bg-[#121212] gap-8">
         {/* Player 1 (White) Piece Tray */}
         <div className="basis-1/3 flex flex-col items-center justify-center h-full">
            <h2 className="text-white text-xl mb-4 font-semibold">Player 1 (White)</h2>
            <PieceTray
               pieces={gameState.player1Pieces}
               onPieceSelect={handleSelectPiece}
               onPieceRotate={handleRotate}
               onPieceFlip={handleFlip}
               selectedPiece={gameState.selectedPiece}
            />
         </div>

         {/* Center Column with the Board */}
         <div className="basis-1/3 flex flex-col items-center justify-center h-full">
            <h1 className="text-4xl font-bold mb-4 text-white">Blokus Duo</h1>
            <div className="w-full max-w-lg">
               <Board boardState={gameState.board} />
            </div>
         </div>

         {/* Player 2 (Black) Piece Tray */}
         <div className="basis-1/3 flex flex-col items-center justify-center h-full">
            <h2 className="text-white text-xl mb-4 font-semibold">Player 2 (Black)</h2>
            <PieceTray
               pieces={gameState.player2Pieces}
               onPieceSelect={handleSelectPiece}
               onPieceRotate={handleRotate}
               onPieceFlip={handleFlip}
               selectedPiece={gameState.selectedPiece}
            />
         </div>
      </main>
   );
}
