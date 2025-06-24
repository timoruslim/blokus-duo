"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Board } from "@/components/Board";
import { PieceTray } from "@/components/PieceTray";
import { Piece as PieceComponent } from "@/components/Piece";
import { GameState, BoardState, Piece as PieceType, PieceTemplate } from "@/lib/types";
import { PIECE_LIBRARY } from "@/lib/pieces";
import {
   getTransformedShape,
   isMoveValid,
   playerHasValidMoves,
   calculatePlacedScore,
} from "@/lib/pieceUtils";
import {
   DndContext,
   DragOverlay,
   DragStartEvent,
   DragEndEvent,
   DragOverEvent,
   useSensor,
   useSensors,
   MouseSensor,
   TouchSensor,
} from "@dnd-kit/core";
import { ClientOnly } from "@/components/ClientOnly";
import { findBestMove } from "@/lib/ai";

const createInitialBoard = (): BoardState => {
   return Array(14)
      .fill(null)
      .map(() => Array(14).fill(3));
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
   const [gameMode, setGameMode] = useState<"pvp" | "pva">("pvp");
   const [playerSide, setPlayerSide] = useState<1 | 2>(1);
   const [aiDifficulty, setAiDifficulty] = useState<number>(2);
   const [aiThinkingTime, setAiThinkingTime] = useState<number | null>(null);
   const [gameStarted, setGameStarted] = useState<boolean>(false);

   const [gameState, setGameState] = useState<GameState & { dragAttempt: number }>({
      board: createInitialBoard(),
      player1Pieces: createPlayerSet(1),
      player2Pieces: createPlayerSet(2),
      currentPlayer: 1,
      scores: { player1: 0, player2: 0 },
      gameOver: false,
      winner: null,
      lastPiecePlaced: { player1: null, player2: null },
      dragAttempt: 0,
   });

   const [activePiece, setActivePiece] = useState<PieceType | null>(null);
   const [ghostPiece, setGhostPiece] = useState<GhostPiece | null>(null);
   const [boardSquareSize, setBoardSquareSize] = useState(0);
   const boardContainerRef = useRef<HTMLDivElement>(null);

   // Dynamic square sizes
   useEffect(() => {
      const calculateSquareSize = () => {
         if (boardContainerRef.current) {
            const boardWidth = boardContainerRef.current.offsetWidth;
            setBoardSquareSize(boardWidth / 14);
         }
      };

      calculateSquareSize();

      window.addEventListener("resize", calculateSquareSize);
      return () => window.removeEventListener("resize", calculateSquareSize);
   }, [gameStarted]);

   // Game Logic: scoring and game end
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
            let score1 = 0;
            let score2 = 0;

            const penalty1 = gameState.player1Pieces.reduce(
               (sum, p) => sum + p.baseShape.flat().filter((c) => c === 1).length,
               0
            );
            const penalty2 = gameState.player2Pieces.reduce(
               (sum, p) => sum + p.baseShape.flat().filter((c) => c === 1).length,
               0
            );

            score1 -= penalty1;
            score2 -= penalty2;

            if (gameState.player1Pieces.length === 0) {
               score1 += 15;
               if (gameState.lastPiecePlaced.player1 === "I1") {
                  score1 += 5;
               }
            }
            if (gameState.player2Pieces.length === 0) {
               score2 += 15;
               if (gameState.lastPiecePlaced.player2 === "I1") {
                  score2 += 5;
               }
            }

            setGameState((prev) => ({
               ...prev,
               gameOver: true,
               scores: { player1: score1, player2: score2 },
               winner: score1 > score2 ? 1 : score2 > score1 ? 2 : "draw",
            }));
         } else {
            setGameState((prev) => ({ ...prev, currentPlayer: otherPlayer }));
         }
      }
   }, [gameState.currentPlayer, gameState.board]);

   // AI move
   useEffect(() => {
      const isAITurn =
         gameMode === "pva" && !gameState.gameOver && gameState.currentPlayer !== playerSide;

      if (isAITurn) {
         const timer = setTimeout(() => {
            const startTime = performance.now();
            const bestMove = findBestMove(gameState, aiDifficulty);
            const endTime = performance.now();
            setAiThinkingTime(endTime - startTime);

            if (bestMove) {
               handlePlacePiece(bestMove.piece, bestMove.position);
            } else {
               setGameState((prev) => ({
                  ...prev,
                  currentPlayer: prev.currentPlayer === 1 ? 2 : 1,
               }));
            }
         }, 0); // delay if needed

         return () => clearTimeout(timer);
      }
   }, [gameState.currentPlayer, gameState.gameOver, gameMode, playerSide, aiDifficulty]);

   const sensors = useSensors(
      useSensor(MouseSensor, {
         activationConstraint: {
            distance: 3,
         },
      }),
      useSensor(TouchSensor, {
         activationConstraint: {
            delay: 100,
            tolerance: 3,
         },
      })
   );

   const handlePlacePiece = useCallback(
      (piece: PieceType, position: { row: number; col: number }) => {
         setGameState((prev) => {
            const finalShape = getTransformedShape(piece);
            const newBoard = JSON.parse(JSON.stringify(prev.board));
            for (let r = 0; r < finalShape.length; r++) {
               for (let c = 0; c < finalShape[r].length; c++) {
                  if (finalShape[r][c] === 1) {
                     newBoard[position.row + r][position.col + c] = piece.player;
                  }
               }
            }

            const playerKey = `player${piece.player}` as const;
            const playerPiecesKey = `${playerKey}Pieces` as const;
            const newPlayerPieces = prev[playerPiecesKey].filter((p) => p.id !== piece.id);

            const newScores = {
               player1: calculatePlacedScore(newBoard, 1),
               player2: calculatePlacedScore(newBoard, 2),
            };

            return {
               ...prev,
               board: newBoard,
               scores: newScores,
               [playerPiecesKey]: newPlayerPieces,
               currentPlayer: prev.currentPlayer === 1 ? 2 : 1,
            };
         });
      },
      []
   );

   const handleRotate = useCallback((pieceId: string, player: 1 | 2) => {
      setGameState((prev) => {
         if (prev.gameOver) return prev;
         const piecesToUpdate = player === 1 ? prev.player1Pieces : prev.player2Pieces;
         const newPieces = piecesToUpdate.map((p) =>
            p.id === pieceId ? { ...p, rotation: p.rotation + 90 } : p
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

         const { id: activeId } = event.active;
         const [pieceId, playerStr] = (activeId as string).split("_");
         const player = parseInt(playerStr, 10) as 1 | 2;

         if (player === gameState.currentPlayer) {
            const playerPieces = player === 1 ? gameState.player1Pieces : gameState.player2Pieces;
            const pieceToActivate = playerPieces.find((p) => p.id === pieceId);

            if (pieceToActivate) {
               setActivePiece(pieceToActivate);
            }
         }
      },
      [gameState]
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
            handlePlacePiece(ghostPiece.piece, { row: ghostPiece.row, col: ghostPiece.col });
         }
         setActivePiece(null);
         setGhostPiece(null);
      },
      [ghostPiece, handlePlacePiece]
   );

   // Settings screen
   if (!gameStarted) {
      return (
         <div className="flex flex-col items-center justify-center h-screen bg-[#121212] text-white">
            <h1 className="text-5xl font-bold mb-8">Blokus Duo</h1>
            <div className="flex flex-col items-center justify-center p-8 rounded-lg bg-[#1e1e1e] w-full max-w-md">
               {/* Game Mode Selection */}
               <h2 className="text-2xl mb-4">Game Mode</h2>
               <div className="flex items-center justify-center gap-4 mb-6">
                  <button
                     onClick={() => setGameMode("pvp")}
                     className={`px-4 py-2 rounded cursor-pointer ${
                        gameMode === "pvp" ? "bg-green-600" : "bg-gray-600"
                     }`}
                  >
                     Player vs. Player
                  </button>
                  <button
                     onClick={() => setGameMode("pva")}
                     className={`px-4 py-2 rounded cursor-pointer ${
                        gameMode === "pva" ? "bg-green-600" : "bg-gray-600"
                     }`}
                  >
                     Player vs. AI
                  </button>
               </div>

               {/* AI Settings - only show if gameMode is 'pva' */}
               {gameMode === "pva" && (
                  <>
                     <h2 className="text-2xl mb-4">Play As</h2>
                     <div className="flex items-center justify-center gap-4 mb-6">
                        <button
                           onClick={() => setPlayerSide(1)}
                           className={`px-4 py-2 rounded cursor-pointer ${
                              playerSide === 1 ? "bg-blue-600" : "bg-gray-600"
                           }`}
                        >
                           White (Player 1)
                        </button>
                        <button
                           onClick={() => setPlayerSide(2)}
                           className={`px-4 py-2 rounded cursor-pointer ${
                              playerSide === 2 ? "bg-blue-600" : "bg-gray-600"
                           }`}
                        >
                           Black (Player 2)
                        </button>
                     </div>
                     <h2 className="text-2xl mb-2">AI Difficulty</h2>
                     <div className="flex items-center gap-4 mb-6">
                        <span className="text-sm">Easy</span>
                        <input
                           type="range"
                           min="1"
                           max="5" // A depth of 4 can be very slow. Start with 3.
                           value={aiDifficulty}
                           onChange={(e) => setAiDifficulty(Number(e.target.value))}
                           className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-sm">Hard</span>
                        <span className="font-bold w-4 text-center">{aiDifficulty}</span>
                     </div>
                  </>
               )}

               {/* Start Button */}
               <button
                  onClick={() => setGameStarted(true)}
                  className="w-full px-6 py-3 text-xl font-bold bg-green-700 hover:bg-green-800 rounded-lg cursor-pointer"
               >
                  Start Game
               </button>
            </div>
         </div>
      );
   }

   // Game screen
   return (
      <DndContext
         sensors={sensors}
         onDragStart={handleDragStart}
         onDragOver={handleDragOver}
         onDragEnd={handleDragEnd}
      >
         <main className="flex flex-row items-start justify-center h-screen min-h-screen p-5 bg-[#121212] gap-8">
            <div className="basis-1/3 flex flex-col items-center justify-center h-full">
               <h2 className="text-white text-xl mb-1 font-semibold">Player 1 (White)</h2>
               {gameMode === "pva" && playerSide === 2 && aiThinkingTime !== null && (
                  <p className="text-xs text-gray-400 mb-4">
                     Thinking time: {(aiThinkingTime / 1000).toFixed(2)}s
                  </p>
               )}
               <p className="text-white mb-2">Score: {gameState.scores.player1}</p>
               <PieceTray
                  pieces={gameState.player1Pieces}
                  onPieceRotate={handleRotate}
                  onPieceFlip={handleFlip}
                  activePieceId={activePiece ? activePiece.id + "_" + activePiece.player : null}
                  dragAttempt={gameState.dragAttempt}
                  disabled={
                     (gameMode === "pva" && playerSide !== 1) ||
                     gameState.currentPlayer !== 1 ||
                     gameState.gameOver
                  }
               />
            </div>
            <div className="basis-1/3 flex flex-col items-center justify-center h-full">
               <h1 className="text-4xl font-bold mb-4 text-white">Blokus Duo</h1>
               <div className="h-12 text-center mb-8">
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
               <p className="text-white mb-2">Score: {gameState.scores.player2}</p>
               {gameMode === "pva" && playerSide === 1 && aiThinkingTime !== null && (
                  <p className="text-xs text-gray-400">
                     Thinking time: {(aiThinkingTime / 1000).toFixed(2)}s
                  </p>
               )}
               <PieceTray
                  pieces={gameState.player2Pieces}
                  onPieceRotate={handleRotate}
                  onPieceFlip={handleFlip}
                  activePieceId={activePiece ? activePiece.id + "_" + activePiece.player : null}
                  dragAttempt={gameState.dragAttempt}
                  disabled={
                     (gameMode === "pva" && playerSide !== 2) ||
                     gameState.currentPlayer !== 2 ||
                     gameState.gameOver
                  }
               />
            </div>
         </main>
         <DragOverlay dropAnimation={null}>
            {activePiece ? (
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
