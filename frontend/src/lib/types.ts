// Represents a square on the board
export type SquareValue = 1 | 2 | 3; // 1 = black, 2 = white, 3 = empty

// Represents the 14x14 game board
export type BoardState = SquareValue[][];

// Represents the shape of a piece
export type PieceShape = (0 | 1)[][];

// Represents a piece in its 'template' form
export interface PieceTemplate {
   id: string;
   shape: PieceShape;
}

// Represents a polyomino piece
export interface Piece {
   id: string;
   baseShape: PieceShape; // The original, unmodified shape
   rotation: number; // Rotation in degrees (0, 90, 180, 270)
   isFlipped: boolean; // Is it flipped horizontally?
   player: 1 | 2;
}

export interface GameState {
   board: BoardState;
   player1Pieces: Piece[];
   player2Pieces: Piece[];
   currentPlayer: 1 | 2;
   scores: {
      player1: number;
      player2: number;
   };
   gameOver: boolean;
   winner: 1 | 2 | "draw" | null;
   lastPiecePlaced: {
      player1: string | null;
      player2: string | null;
   };
}
