"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Board } from "@/components/Board";
import { PieceTray } from "@/components/PieceTray";
import { Piece as PieceComponent } from "@/components/Piece";
import { GameState, BoardState, Piece as PieceType, PieceTemplate } from "@/lib/types";
import { PIECE_LIBRARY } from "@/lib/pieces";
import { getTransformedShape, isMoveValid, playerHasValidMoves } from "@/lib/pieceUtils";
import {
   DndContext,
   DragOverlay,
   DragStartEvent,
   DragEndEvent,
   DragOverEvent,
   useSensor,
   useSensors,
   PointerSensor,
} from "@dnd-kit/core";
import { ClientOnly } from "@/components/ClientOnly";

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

interface GhostPiece {
   piece: PieceType;
   row: number;
   col: number;
   isValid: boolean;
}

function BlokusGame() {
   const [gameState, setGameState] = useState<GameState & { dragAttempt: number }>({
      board: createInitialBoard(),
      player1Pieces: createPlayerSet(1),
      player2Pieces: createPlayerSet(2),
      currentPlayer: 1,
      scores: { player1: 0, player2: 0 },
      gameOver: false,
      winner: null,
      dragAttempt: 0,
   });

   const [activePiece, setActivePiece] = useState<PieceType | null>(null);
   const [ghostPiece, setGhostPiece] = useState<GhostPiece | null>(null);
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

      calculateSquareSize();

      window.addEventListener("resize", calculateSquareSize);
      return () => window.removeEventListener("resize", calculateSquareSize);
   }, []);

   useEffect(() => {
      if (gameState.gameOver) return;

      const activePlayerPieces =
         gameState.currentPlayer === 1 ? gameState.player1Pieces : gameState.player2Pieces;
      const hasMoves = playerHasValidMoves(
         gameState.currentPlayer,
         gameState.board,
         activePlayerPieces
      );

      if (!hasMoves) {
         const otherPlayer = gameState.currentPlayer === 1 ? 2 : 1;
         const otherPlayerPieces =
            otherPlayer === 1 ? gameState.player1Pieces : gameState.player2Pieces;
         const otherPlayerHasMoves = playerHasValidMoves(
            otherPlayer,
            gameState.board,
            otherPlayerPieces
         );

         if (!otherPlayerHasMoves) {
            // GAME OVER: Neither player can move.
            const score1 = gameState.player1Pieces.reduce(
               (sum, p) => sum + p.baseShape.flat().filter((c) => c === 1).length,
               0
            );
            const score2 = gameState.player2Pieces.reduce(
               (sum, p) => sum + p.baseShape.flat().filter((c) => c === 1).length,
               0
            );

            setGameState((prev) => ({
               ...prev,
               gameOver: true,
               scores: { player1: score1, player2: score2 },
               winner: score1 < score2 ? 1 : score2 < score1 ? 2 : "draw",
            }));
         } else {
            // Auto-pass turn
            setGameState((prev) => ({ ...prev, currentPlayer: otherPlayer }));
         }
      }
   }, [gameState.currentPlayer, gameState.board]); // Dependencies that trigger a game flow check

   const sensors = useSensors(
      useSensor(PointerSensor, {
         activationConstraint: {
            distance: 2,
         },
      })
   );

   const handleRotate = useCallback((pieceId: string, player: 1 | 2) => {
      setGameState((prev) => {
         if (prev.gameOver) return prev;
         const piecesToUpdate = player === 1 ? prev.player1Pieces : prev.player2Pieces;
         const newPieces = piecesToUpdate.map((p) =>
            p.id === pieceId ? { ...p, rotation: (p.rotation + 90) % 360 } : p
         );
         return {
            ...prev,
            ...(player === 1 ? { player1Pieces: newPieces } : { player2Pieces: newPieces }),
         };
      });
   }, []);

   const handleFlip = useCallback((pieceId: string, player: 1 | 2) => {
      setGameState((prev) => {
         if (prev.gameOver) return prev;
         const piecesToUpdate = player === 1 ? prev.player1Pieces : prev.player2Pieces;
         const newPieces = piecesToUpdate.map((p) =>
            p.id === pieceId ? { ...p, isFlipped: !p.isFlipped } : p
         );
         return {
            ...prev,
            ...(player === 1 ? { player1Pieces: newPieces } : { player2Pieces: newPieces }),
         };
      });
   }, []);

   const handleDragStart = useCallback(
      (event: DragStartEvent) => {
         if (gameState.gameOver) return;
         const piece = event.active.data.current?.piece as PieceType;
         if (piece.player === gameState.currentPlayer) {
            setActivePiece(piece);
         }
      },
      [gameState.currentPlayer, gameState.gameOver]
   );

   const handleDragOver = useCallback(
      (event: DragOverEvent) => {
         if (!activePiece) return;
         const { over } = event;
         if (!over) {
            setGhostPiece(null);
            return;
         }
         const overId = over.id as string;
         if (!overId.startsWith("cell-")) {
            setGhostPiece(null);
            return;
         }

         const [, rowStr, colStr] = overId.split("-");
         const row = parseInt(rowStr, 10);
         const col = parseInt(colStr, 10);
         const finalShape = getTransformedShape(activePiece);
         const isFirstMove =
            (activePiece.player === 1 && gameState.player1Pieces.length === 21) ||
            (activePiece.player === 2 && gameState.player2Pieces.length === 21);
         const isValid = isMoveValid(
            gameState.board,
            finalShape,
            row,
            col,
            activePiece.player,
            isFirstMove
         );
         setGhostPiece({ piece: activePiece, row, col, isValid });
      },
      [activePiece, gameState.board]
   );

   const handleDragEnd = useCallback(
      (event: DragEndEvent) => {
         if (ghostPiece && ghostPiece.isValid) {
            const { piece, row, col } = ghostPiece;
            const finalShape = getTransformedShape(piece);
            setGameState((prev) => {
               const newBoard = JSON.parse(JSON.stringify(prev.board));
               for (let r = 0; r < finalShape.length; r++) {
                  for (let c = 0; c < finalShape[r].length; c++) {
                     if (finalShape[r][c] === 1) {
                        newBoard[row + r][col + c] = piece.player;
                     }
                  }
               }
               const originalPieces = piece.player === 1 ? prev.player1Pieces : prev.player2Pieces;
               const newPlayerPieces = originalPieces.filter((p) => p.id !== piece.id);
               return {
                  ...prev,
                  board: newBoard,
                  ...(piece.player === 1
                     ? { player1Pieces: newPlayerPieces }
                     : { player2Pieces: newPlayerPieces }),
                  currentPlayer: prev.currentPlayer === 1 ? 2 : 1,
                  dragAttempt: prev.dragAttempt + 1,
               };
            });
         } else {
            setGameState((prev) => ({ ...prev, dragAttempt: prev.dragAttempt + 1 }));
         }
         setActivePiece(null);
         setGhostPiece(null);
      },
      [ghostPiece]
   );

   return (
      <DndContext
         sensors={sensors}
         onDragStart={handleDragStart}
         onDragOver={handleDragOver}
         onDragEnd={handleDragEnd}
      >
         <main className="flex flex-row items-start justify-center h-screen min-h-screen p-5 bg-[#121212] gap-8">
            <div className="basis-1/3 flex flex-col items-center justify-center h-full">
               <h2 className="text-white text-xl mb-4 font-semibold">Player 1 (White)</h2>
               {/* NEW: Score display */}
               <p className="text-white mb-2">Score: {gameState.scores.player1}</p>
               <PieceTray
                  pieces={gameState.player1Pieces}
                  onPieceRotate={handleRotate}
                  onPieceFlip={handleFlip}
                  activePieceId={activePiece ? activePiece.id + "_" + activePiece.player : null}
                  dragAttempt={gameState.dragAttempt}
                  disabled={gameState.currentPlayer !== 1 || gameState.gameOver}
               />
            </div>
            <div className="basis-1/3 flex flex-col items-center justify-center h-full">
               <h1 className="text-4xl font-bold mb-4 text-white">Blokus Duo</h1>
               {/* NEW: Display for game status */}
               <div className="h-12 text-center">
                  {gameState.gameOver ? (
                     <div className="text-green-400 text-2xl animate-fade-in">
                        <h2>Game Over!</h2>
                        <p className="text-lg">
                           {gameState.winner === "draw"
                              ? "It's a draw!"
                              : `Player ${gameState.winner} wins!`}
                        </p>
                     </div>
                  ) : (
                     <h2 className="text-white text-xl">Player {gameState.currentPlayer}'s Turn</h2>
                  )}
               </div>
               <div ref={boardContainerRef} className="w-full max-w-lg">
                  <Board
                     boardState={gameState.board}
                     ghostPiece={ghostPiece}
                     activePlayer={activePiece ? activePiece.player : null}
                  />
               </div>
            </div>
            <div className="basis-1/3 flex flex-col items-center justify-center h-full">
               <h2 className="text-white text-xl mb-4 font-semibold">Player 2 (Black)</h2>
               {/* NEW: Score display */}
               <p className="text-white mb-2">Score: {gameState.scores.player2}</p>
               <PieceTray
                  pieces={gameState.player2Pieces}
                  onPieceRotate={handleRotate}
                  onPieceFlip={handleFlip}
                  activePieceId={activePiece ? activePiece.id + "_" + activePiece.player : null}
                  dragAttempt={gameState.dragAttempt}
                  disabled={gameState.currentPlayer !== 2 || gameState.gameOver}
               />
            </div>
         </main>
         <DragOverlay dropAnimation={null}>
            {activePiece && boardSquareSize > 0 ? (
               <PieceComponent piece={activePiece} squareSize={boardSquareSize} />
            ) : null}
         </DragOverlay>
      </DndContext>
   );
}

export default function GamePage() {
   return (
      <ClientOnly>
         <BlokusGame />
      </ClientOnly>
   );
}
