import { Jewel, JewelType, Position } from '../types/game';

const BOARD_SIZE = 8;
const MATCH_MIN = 3;

export const JEWEL_TYPES: JewelType[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink'];

let nextJewelId = 1;

export const generateRandomJewel = (excludeTypes: JewelType[] = []): Jewel => {
  const availableTypes = JEWEL_TYPES.filter(type => !excludeTypes.includes(type));
  return {
    type: availableTypes[Math.floor(Math.random() * availableTypes.length)],
    id: `jewel-${nextJewelId++}`
  };
};

const getExcludedTypes = (board: Jewel[][], row: number, col: number): JewelType[] => {
  const excludedTypes: JewelType[] = [];
  
  // Check horizontal matches (need to check 2 previous jewels)
  if (col >= 2) {
    if (board[row][col - 1].type === board[row][col - 2].type) {
      excludedTypes.push(board[row][col - 1].type);
    }
  }
  
  // Check vertical matches (need to check 2 previous jewels)
  if (row >= 2) {
    if (board[row - 1][col].type === board[row - 2][col].type) {
      excludedTypes.push(board[row - 1][col].type);
    }
  }
  
  return excludedTypes;
};

export const createBoard = (): Jewel[][] => {
  const board: Jewel[][] = [];
  
  // Initialize the board with non-matching jewels
  for (let row = 0; row < BOARD_SIZE; row++) {
    board[row] = [];
    for (let col = 0; col < BOARD_SIZE; col++) {
      const excludedTypes = getExcludedTypes(board, row, col);
      board[row][col] = generateRandomJewel(excludedTypes);
    }
  }

  // Verify the board has valid moves
  if (findPossibleMoves(board).length === 0) {
    // If no valid moves exist, create a new board
    return createBoard();
  }

  return board;
};

export const findMatches = (board: Jewel[][]): Position[][] => {
  const matches: Position[][] = [];
  
  // Check horizontal matches
  for (let row = 0; row < BOARD_SIZE; row++) {
    let count = 1;
    let start = 0;
    
    for (let col = 1; col < BOARD_SIZE; col++) {
      if (board[row][col].type === board[row][col - 1].type) {
        count++;
      } else {
        if (count >= MATCH_MIN) {
          const match = [];
          for (let i = start; i < col; i++) {
            match.push({ row, col: i });
          }
          matches.push(match);
        }
        count = 1;
        start = col;
      }
    }
    
    if (count >= MATCH_MIN) {
      const match = [];
      for (let i = start; i < BOARD_SIZE; i++) {
        match.push({ row, col: i });
      }
      matches.push(match);
    }
  }

  // Check vertical matches
  for (let col = 0; col < BOARD_SIZE; col++) {
    let count = 1;
    let start = 0;
    
    for (let row = 1; row < BOARD_SIZE; row++) {
      if (board[row][col].type === board[row - 1][col].type) {
        count++;
      } else {
        if (count >= MATCH_MIN) {
          const match = [];
          for (let i = start; i < row; i++) {
            match.push({ row: i, col });
          }
          matches.push(match);
        }
        count = 1;
        start = row;
      }
    }
    
    if (count >= MATCH_MIN) {
      const match = [];
      for (let i = start; i < BOARD_SIZE; i++) {
        match.push({ row: i, col });
      }
      matches.push(match);
    }
  }

  return matches;
};

export const findPossibleMoves = (board: Jewel[][]): [Position, Position][] => {
  const moves: [Position, Position][] = [];

  // Check horizontal swaps
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE - 1; col++) {
      // Swap
      const tempBoard = board.map(row => [...row]);
      [tempBoard[row][col], tempBoard[row][col + 1]] = [tempBoard[row][col + 1], tempBoard[row][col]];
      
      if (findMatches(tempBoard).length > 0) {
        moves.push([
          { row, col },
          { row, col: col + 1 }
        ]);
      }
    }
  }

  // Check vertical swaps
  for (let row = 0; row < BOARD_SIZE - 1; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      // Swap
      const tempBoard = board.map(row => [...row]);
      [tempBoard[row][col], tempBoard[row + 1][col]] = [tempBoard[row + 1][col], tempBoard[row][col]];
      
      if (findMatches(tempBoard).length > 0) {
        moves.push([
          { row, col },
          { row: row + 1, col }
        ]);
      }
    }
  }

  return moves;
};

export const isAdjacent = (pos1: Position, pos2: Position): boolean => {
  const rowDiff = Math.abs(pos1.row - pos2.row);
  const colDiff = Math.abs(pos1.col - pos2.col);
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
};

export const swapJewels = (board: Jewel[][], pos1: Position, pos2: Position): Jewel[][] => {
  const newBoard = board.map(row => [...row]);
  [newBoard[pos1.row][pos1.col], newBoard[pos2.row][pos2.col]] = 
    [newBoard[pos2.row][pos2.col], newBoard[pos1.row][pos1.col]];
  return newBoard;
};

export const removeMatches = (board: Jewel[][], matches: Position[][]): Jewel[][] => {
  const newBoard = board.map(row => [...row]);
  
  matches.forEach(match => {
    match.forEach(({ row, col }) => {
      // Move all jewels above down
      for (let i = row; i > 0; i--) {
        newBoard[i][col] = newBoard[i - 1][col];
      }
      // Generate new jewel at top
      newBoard[0][col] = generateRandomJewel();
    });
  });
  
  return newBoard;
}; 