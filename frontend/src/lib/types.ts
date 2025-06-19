// Represents a square on the board
export type SquareValue = 0 | 1 | 2; // 0 = empty, 1 = black, 2 = white

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
