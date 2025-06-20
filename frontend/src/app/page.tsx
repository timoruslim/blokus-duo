"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Board } from "@/components/Board";
import { PieceTray } from "@/components/PieceTray";
import { Piece as PieceComponent } from "@/components/Piece";
import { BoardState, Piece as PieceType, PieceTemplate } from "@/lib/types";
import { PIECE_LIBRARY } from "@/lib/pieces";
import { getTransformedShape, isMoveValid } from "@/lib/pieceUtils";
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

   const sensors = useSensors(
      useSensor(PointerSensor, {
         activationConstraint: {
            distance: 2,
         },
      })
   );

   const handleRotate = useCallback((pieceId: string, player: 1 | 2) => {
      setGameState((prev) => {
         const piecesToUpdate = player === 1 ? prev.player1Pieces : prev.player2Pieces;
         const newPieces = piecesToUpdate.map((p) =>
            p.id === pieceId ? { ...p, rotation: p.rotation + 90 } : p
         );
         return {
            ...prev,
            ...(player === 1 ? { player1Pieces: newPieces } : { player2Pieces: newPieces }),
         };
      });
   }, []); // Empty dependency array makes this function stable

   const handleFlip = useCallback((pieceId: string, player: 1 | 2) => {
      setGameState((prev) => {
         const piecesToUpdate = player === 1 ? prev.player1Pieces : prev.player2Pieces;
         const newPieces = piecesToUpdate.map((p) =>
            p.id === pieceId ? { ...p, isFlipped: !p.isFlipped } : p
         );
         return {
            ...prev,
            ...(player === 1 ? { player1Pieces: newPieces } : { player2Pieces: newPieces }),
         };
      });
   }, []); // Empty dependency array makes this function stable

   const handleDragStart = useCallback((event: DragStartEvent) => {
      setActivePiece(event.active.data.current?.piece);
   }, []);

   const handleDragOver = useCallback(
      (event: DragOverEvent) => {
         const { over } = event;
         if (!over || !activePiece) {
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
      [activePiece, gameState.board, gameState.player1Pieces.length, gameState.player2Pieces.length]
   );

   const handleDragEnd = useCallback(
      (event: DragEndEvent) => {
         const { active, over } = event;
         const piece = active.data.current?.piece as PieceType;

         // A flag to check if the state was updated, to avoid incrementing the counter twice
         let moveMade = false;

         if (piece && over && over.id.toString().startsWith("cell-")) {
            const overId = over.id.toString();
            const [, rowStr, colStr] = overId.split("-");
            const row = parseInt(rowStr, 10);
            const col = parseInt(colStr, 10);

            const finalShape = getTransformedShape(piece);

            // This now uses the LATEST gameState because it's in the dependency array
            const isFirstMove =
               (piece.player === 1 && gameState.player1Pieces.length === PIECE_LIBRARY.length) ||
               (piece.player === 2 && gameState.player2Pieces.length === PIECE_LIBRARY.length);

            // This now uses the LATEST gameState.board
            const isValid = isMoveValid(
               gameState.board,
               finalShape,
               row,
               col,
               piece.player,
               isFirstMove
            );

            if (isValid) {
               moveMade = true;
               setGameState((prev) => {
                  const newBoard = JSON.parse(JSON.stringify(prev.board));
                  for (let r = 0; r < finalShape.length; r++) {
                     for (let c = 0; c < finalShape[r].length; c++) {
                        if (finalShape[r][c] === 1) {
                           newBoard[row + r][col + c] = piece.player;
                        }
                     }
                  }
                  const originalPieces =
                     piece.player === 1 ? prev.player1Pieces : prev.player2Pieces;
                  const newPlayerPieces = originalPieces.filter((p) => p.id !== piece.id);
                  return {
                     ...prev,
                     board: newBoard,
                     ...(piece.player === 1
                        ? { player1Pieces: newPlayerPieces }
                        : { player2Pieces: newPlayerPieces }),
                     currentPlayer: prev.currentPlayer === 1 ? 2 : 1,
                     dragAttempt: prev.dragAttempt + 1, // Increment counter on valid move
                  };
               });
            }
         }

         // Reset visual state
         setActivePiece(null);
         setGhostPiece(null);

         // If the move was not valid or dropped outside, increment counter to fix the original bug
         if (!moveMade) {
            setGameState((prev) => ({ ...prev, dragAttempt: prev.dragAttempt + 1 }));
         }
      },
      [gameState, setGameState] // Correct dependency array
   );

   return (
      <DndContext
         sensors={sensors}
         onDragStart={handleDragStart}
         onDragOver={handleDragOver}
         onDragEnd={handleDragEnd}
      >
         <main className="flex flex-row items-start justify-center h-screen min-h-screen p-5 bg-[#121212] gap-8">
            {/* Player 1 (White) Piece Tray */}
            <div className="basis-1/3 flex flex-col items-center justify-center h-full">
               <h2 className="text-white text-xl mb-4 font-semibold">Player 1 (White)</h2>
               <PieceTray
                  pieces={gameState.player1Pieces}
                  onPieceRotate={handleRotate}
                  onPieceFlip={handleFlip}
                  activePieceId={activePiece ? activePiece.id + "_" + activePiece.player : null}
                  dragAttempt={gameState.dragAttempt}
               />
            </div>

            {/* Center Column with the Board */}
            <div className="basis-1/3 flex flex-col items-center justify-center h-full">
               <h1 className="text-4xl font-bold mb-4 text-white">Blokus Duo</h1>
               <div ref={boardContainerRef} className="w-full max-w-lg">
                  <Board
                     boardState={gameState.board}
                     ghostPiece={ghostPiece}
                     activePlayer={activePiece ? activePiece.player : null}
                  />
               </div>
            </div>

            {/* Player 2 (Black) Piece Tray */}
            <div className="basis-1/3 flex flex-col items-center justify-center h-full">
               <h2 className="text-white text-xl mb-4 font-semibold">Player 2 (Black)</h2>
               <PieceTray
                  pieces={gameState.player2Pieces}
                  onPieceRotate={handleRotate}
                  onPieceFlip={handleFlip}
                  activePieceId={activePiece ? activePiece.id + "_" + activePiece.player : null}
                  dragAttempt={gameState.dragAttempt}
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
