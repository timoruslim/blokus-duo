// Represents a square on the board
export type SquareValue = 0 | 1 | 2; // 0 = empty, 1 = black, 2 = white

// Represents the 14x14 game board
export type BoardState = SquareValue[][];

// Represents the shape of a piece
export type PieceShape = (0 | 1)[][];

// Represents a polyomino piece
export interface Piece {
  id: string; // A unique identifier, e.g., "F5"
  shape: PieceShape;
  player: 1 | 2; // The player this piece belongs to
}
