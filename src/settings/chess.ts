export enum ChessPiece {
  Queen = "queen",
}

export const PIECE_SYMBOL_MAP = {
  [ChessPiece.Queen]: "♛", // <- black;white -> ♕
} as const satisfies {
  [Key in ChessPiece]: string;
};
