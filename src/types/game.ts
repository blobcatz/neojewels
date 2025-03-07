export type JewelType = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange' | 'pink';

export interface Position {
  row: number;
  col: number;
}

export interface Jewel {
  type: JewelType;
  id: string;
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
} 