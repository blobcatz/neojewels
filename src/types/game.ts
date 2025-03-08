export type JewelType = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange' | 'pink';

export interface Jewel {
  type: JewelType;
  id: string;
  isHypercube: boolean;
  specialJewelsEnabled: boolean;
}

export type BoardJewel = Jewel | null;

export interface Position {
  row: number;
  col: number;
}

export interface GameState {
  board: BoardJewel[][];
  score: number;
  hintsRemaining: number;
  shufflesRemaining: number;
  selectedJewel: Position | null;
  gameOver: boolean;
  timeRemaining: number;
  isGameActive: boolean;
  isInMenu: boolean;
  isZenMode: boolean;
  isNeocatMode: boolean;
  specialJewelsEnabled: boolean;
} 