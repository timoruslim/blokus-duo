"use client";

import { useState, useRef, useEffect } from "react";
import { Board } from "@/components/Board";
import { PieceTray } from "@/components/PieceTray";
import { BoardState, Piece as PieceType, PieceTemplate } from "@/lib/types";
import { PIECE_LIBRARY } from "@/lib/pieces";
import { getTransformedShape, isMoveValid } from "@/lib/pieceUtils";

interface GameState {
   board: BoardState;
   player1Pieces: PieceType[];
   player2Pieces: PieceType[];
   currentPlayer: 1 | 2;
}

const createInitialBoard = (): BoardState => {
   return Array(14)
      .fill(null)
      .map(() => Array(14).fill(0));
};

const createPlayerSet = (player: 1 | 2): PieceType[] => {
   return PIECE_LIBRARY.map((template: PieceTemplate) => ({
      id: template.id,
      baseShape: template.shape,
      rotation: 0,
      isFlipped: false,
      player: player,
   }));
};

export default function GamePage() {
   const [gameState, setGameState] = useState<GameState>({
      board: createInitialBoard(),
      player1Pieces: createPlayerSet(1),
      player2Pieces: createPlayerSet(2),
      currentPlayer: 1,
   });

   const [boardSquareSize, setBoardSquareSize] = useState(0);
   const boardContainerRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      const calculateSquareSize = () => {
         if (boardContainerRef.current) {
            const boardWidth = boardContainerRef.current.offsetWidth;
            // Assuming 14 columns, we calculate the size of one square
            setBoardSquareSize(boardWidth / 14);
         }
      };

      calculateSquareSize(); // Calculate initial size

      // Recalculate on window resize
      window.addEventListener("resize", calculateSquareSize);
      // Cleanup function to remove the listener when the component unmounts
      return () => window.removeEventListener("resize", calculateSquareSize);
   }, []); // Empty dependency array means this effect runs only once on mount

   const handleRotate = (pieceId: string, player: 1 | 2) => {
      const piecesToUpdate = player === 1 ? gameState.player1Pieces : gameState.player2Pieces;

      const newPieces = piecesToUpdate.map((p) => {
         if (p.id === pieceId) {
            return { ...p, rotation: p.rotation + 90 };
         }
         return p;
      });

      setGameState((prev) => ({
         ...prev,
         ...(player === 1 && { player1Pieces: newPieces }),
         ...(player === 2 && { player2Pieces: newPieces }),
      }));
   };

   const handleFlip = (pieceId: string, player: 1 | 2) => {
      const piecesToUpdate = player === 1 ? gameState.player1Pieces : gameState.player2Pieces;

      const newPieces = piecesToUpdate.map((p) => {
         if (p.id === pieceId) {
            return { ...p, isFlipped: !p.isFlipped };
         }
         return p;
      });

      setGameState((prev) => ({
         ...prev,
         ...(player === 1 && { player1Pieces: newPieces }),
         ...(player === 2 && { player2Pieces: newPieces }),
      }));
   };

   const handleDrop = (piece: PieceType, row: number, col: number) => {
      const finalShape = getTransformedShape(piece);

      if (!isMoveValid(gameState.board, finalShape, row, col)) {
         console.log("Invalid move!");
         return; // Exit if the move is not valid
      }

      // Create a new board state to modify (immutability)
      const newBoard = JSON.parse(JSON.stringify(gameState.board));

      // "Stamp" the piece onto the new board
      for (let r = 0; r < finalShape.length; r++) {
         for (let c = 0; c < finalShape[r].length; c++) {
            if (finalShape[r][c] === 1) {
               newBoard[row + r][col + c] = piece.player;
            }
         }
      }

      // Remove the placed piece from the correct player's tray
      const newPlayerPieces = (
         piece.player === 1 ? gameState.player1Pieces : gameState.player2Pieces
      ).filter((p) => p.id !== piece.id);

      // Update the game state
      setGameState((prev) => ({
         ...prev,
         board: newBoard,
         ...(piece.player === 1 && { player1Pieces: newPlayerPieces }),
         ...(piece.player === 2 && { player2Pieces: newPlayerPieces }),
         currentPlayer: prev.currentPlayer === 1 ? 2 : 1, // Switch turns
      }));
   };

   return (
      <main className="flex flex-row items-start justify-center h-screen min-h-screen p-5 bg-[#121212] gap-8">
         {/* Player 1 (White) Piece Tray */}
         <div className="basis-1/3 flex flex-col items-center justify-center h-full">
            <h2 className="text-white text-xl mb-4 font-semibold">Player 1 (White)</h2>
            <PieceTray
               pieces={gameState.player1Pieces}
               onPieceRotate={handleRotate}
               onPieceFlip={handleFlip}
            />
         </div>

         {/* Center Column with the Board */}
         <div className="basis-1/3 flex flex-col items-center justify-center h-full">
            <h1 className="text-4xl font-bold mb-4 text-white">Blokus Duo</h1>
            <div ref={boardContainerRef} className="w-full max-w-lg">
               <Board boardState={gameState.board} onDrop={handleDrop} />
            </div>
            <p className="text-white mt-4">
               Calculated Square Size: {boardSquareSize.toFixed(2)}px
            </p>
         </div>

         {/* Player 2 (Black) Piece Tray */}
         <div className="basis-1/3 flex flex-col items-center justify-center h-full">
            <h2 className="text-white text-xl mb-4 font-semibold">Player 2 (Black)</h2>
            <PieceTray
               pieces={gameState.player2Pieces}
               onPieceRotate={handleRotate}
               onPieceFlip={handleFlip}
            />
         </div>
      </main>
   );
}
