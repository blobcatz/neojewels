export type JewelType = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange' | 'pink' | 'hypercube';

export interface Position {
  row: number;
  col: number;
}

export interface Jewel {
  type: JewelType;
  id: string;
  isHypercube: boolean;
  specialJewelsEnabled: boolean;
  storedColor?: JewelType; // For hypercube to store the color it will clear
}

export interface GameState {
  board: Jewel[][];
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