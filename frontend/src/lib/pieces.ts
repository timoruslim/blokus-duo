import { PieceTemplate } from "./types";

export const PIECE_LIBRARY: PieceTemplate[] = [
   // 1. Monomino (1 square)
   { id: "I1", shape: [[1]] },

   // 2. Domino (2 squares)
   { id: "I2", shape: [[1, 1]] },

   // 3. Trominoes (3 squares)
   { id: "I3", shape: [[1, 1, 1]] },
   {
      id: "V3",
      shape: [
         [1, 0],
         [1, 1],
      ],
   },

   // 4. Tetrominoes (4 squares)
   { id: "I4", shape: [[1, 1, 1, 1]] },
   {
      id: "L4",
      shape: [
         [1, 0, 0],
         [1, 1, 1],
      ],
   },
   {
      id: "T4",
      shape: [
         [1, 1, 1],
         [0, 1, 0],
      ],
   },
   {
      id: "O4",
      shape: [
         [1, 1],
         [1, 1],
      ],
   },
   {
      id: "Z4",
      shape: [
         [1, 1, 0],
         [0, 1, 1],
      ],
   },

   // 5. Pentominoes (5 squares)
   { id: "I5", shape: [[1, 1, 1, 1, 1]] },
   {
      id: "F5",
      shape: [
         [0, 1, 1],
         [1, 1, 0],
         [0, 1, 0],
      ],
   },
   {
      id: "L5",
      shape: [
         [1, 0, 0, 0],
         [1, 1, 1, 1],
      ],
   },
   {
      id: "N5",
      shape: [
         [0, 1, 1, 1],
         [1, 1, 0, 0],
      ],
   },
   {
      id: "P5",
      shape: [
         [1, 1],
         [1, 1],
         [1, 0],
      ],
   },
   {
      id: "T5",
      shape: [
         [1, 1, 1],
         [0, 1, 0],
         [0, 1, 0],
      ],
   },
   {
      id: "U5",
      shape: [
         [1, 0, 1],
         [1, 1, 1],
      ],
   },
   {
      id: "V5",
      shape: [
         [1, 0, 0],
         [1, 0, 0],
         [1, 1, 1],
      ],
   },
   {
      id: "W5",
      shape: [
         [1, 0, 0],
         [1, 1, 0],
         [0, 1, 1],
      ],
   },
   {
      id: "X5",
      shape: [
         [0, 1, 0],
         [1, 1, 1],
         [0, 1, 0],
      ],
   },
   {
      id: "Y5",
      shape: [
         [0, 1, 0, 0],
         [1, 1, 1, 1],
      ],
   },
   {
      id: "Z5",
      shape: [
         [1, 1, 0],
         [0, 1, 0],
         [0, 1, 1],
      ],
   },
];
