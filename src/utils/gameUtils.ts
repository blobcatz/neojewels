import { Jewel, JewelType, Position } from '../types/game';

export const BOARD_SIZE = 8;
const MATCH_MIN = 3;
const HYPERCUBE_MATCH = 5;

export const JEWEL_TYPES: JewelType[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink'];

let nextJewelId = 1;

export const getRandomJewelType = (): JewelType => {
  return JEWEL_TYPES[Math.floor(Math.random() * JEWEL_TYPES.length)];
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

export const generateRandomJewel = (excludeTypes: JewelType[] = [], specialJewelsEnabled: boolean = true): Jewel => {
  const availableTypes = JEWEL_TYPES.filter(type => !excludeTypes.includes(type));
  return {
    type: availableTypes[Math.floor(Math.random() * availableTypes.length)],
    id: `jewel-${nextJewelId++}`,
    isHypercube: false,
    specialJewelsEnabled
  };
};

export const createHypercube = (specialJewelsEnabled: boolean = true): Jewel => {
  // Use a random valid jewel type for the hypercube
  const randomType = JEWEL_TYPES[Math.floor(Math.random() * JEWEL_TYPES.length)];
  return {
    type: randomType,
    id: `jewel-${nextJewelId++}`,
    isHypercube: true,
    specialJewelsEnabled
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

export const shuffleExistingBoard = (board: Jewel[][], specialJewelsEnabled: boolean = true): Jewel[][] => {
  // Collect all jewels from the board
  const allJewels = board.flat();
  
  // Create a shuffled copy of the jewels
  const shuffledJewels = [...allJewels];
  
  // Fisher-Yates shuffle algorithm
  for (let i = shuffledJewels.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledJewels[i], shuffledJewels[j]] = [shuffledJewels[j], shuffledJewels[i]];
  }
  
  // Keep shuffling until we have no matches and valid moves
  let attempts = 0;
  const MAX_ATTEMPTS = 100;
  
  do {
    // Shuffle again if needed
    if (attempts > 0) {
      for (let i = shuffledJewels.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledJewels[i], shuffledJewels[j]] = [shuffledJewels[j], shuffledJewels[i]];
      }
    }
    
    // Create new board from shuffled jewels
    const newBoard: Jewel[][] = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
      newBoard[row] = [];
      for (let col = 0; col < BOARD_SIZE; col++) {
        const jewel = shuffledJewels[row * BOARD_SIZE + col];
        newBoard[row][col] = {
          ...jewel,
          specialJewelsEnabled
        };
      }
    }
    
    // Check if this arrangement is valid (no matches and has possible moves)
    if (findMatches(newBoard).length === 0 && findPossibleMoves(newBoard).length > 0) {
      return newBoard;
    }
    
    attempts++;
  } while (attempts < MAX_ATTEMPTS);
  
  // If we couldn't find a valid arrangement after max attempts,
  // create a new board as a fallback
  return createBoard(specialJewelsEnabled);
};

export const createBoard = (specialJewelsEnabled: boolean = true): Jewel[][] => {
  let board: Jewel[][] = Array(BOARD_SIZE).fill(null).map(() =>
    Array(BOARD_SIZE).fill(null).map(() => ({
      type: getRandomJewelType(),
      id: generateId(),
      isHypercube: false,
      specialJewelsEnabled
    }))
  );

  // Keep generating new boards until we have one with no matches and valid moves
  while (findMatches(board).length > 0 || findPossibleMoves(board).length === 0) {
    board = Array(BOARD_SIZE).fill(null).map(() =>
      Array(BOARD_SIZE).fill(null).map(() => ({
        type: getRandomJewelType(),
        id: generateId(),
        isHypercube: false,
        specialJewelsEnabled
      }))
    );
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
      if (board[row][col].type === board[row][col - 1].type && !board[row][col].isHypercube) {
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
      if (board[row][col].type === board[row - 1][col].type && !board[row][col].isHypercube) {
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

  // Helper function to check if a move creates a match or involves a hypercube
  const checkMove = (pos1: Position, pos2: Position) => {
    const tempBoard = board.map(row => [...row]);
    [tempBoard[pos1.row][pos1.col], tempBoard[pos2.row][pos2.col]] = 
      [tempBoard[pos2.row][pos2.col], tempBoard[pos1.row][pos1.col]];
    
    // Check if either jewel is a hypercube
    const isValidHypercubeMove = 
      (board[pos1.row][pos1.col].isHypercube && !board[pos2.row][pos2.col].isHypercube) ||
      (board[pos2.row][pos2.col].isHypercube && !board[pos1.row][pos1.col].isHypercube);
    
    return findMatches(tempBoard).length > 0 || isValidHypercubeMove;
  };

  // Check horizontal swaps
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE - 1; col++) {
      if (checkMove({ row, col }, { row, col: col + 1 })) {
        moves.push([{ row, col }, { row, col: col + 1 }]);
      }
    }
  }

  // Check vertical swaps
  for (let row = 0; row < BOARD_SIZE - 1; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (checkMove({ row, col }, { row: row + 1, col })) {
        moves.push([{ row, col }, { row: row + 1, col }]);
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
  const specialJewelsEnabled = board[0][0].specialJewelsEnabled;
  
  // Handle hypercube swap
  if (newBoard[pos1.row][pos1.col].isHypercube || newBoard[pos2.row][pos2.col].isHypercube) {
    const hypercubePos = newBoard[pos1.row][pos1.col].isHypercube ? pos1 : pos2;
    const normalPos = newBoard[pos1.row][pos1.col].isHypercube ? pos2 : pos1;
    const targetColor = newBoard[normalPos.row][normalPos.col].type;
    
    // First perform the swap
    [newBoard[pos1.row][pos1.col], newBoard[pos2.row][pos2.col]] = 
      [newBoard[pos2.row][pos2.col], newBoard[pos1.row][pos1.col]];
    
    // Collect all positions that need to be cleared
    const positionsToReplace = new Set<string>();
    
    // Find all jewels of the target color
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (newBoard[row][col].type === targetColor && !newBoard[row][col].isHypercube) {
          positionsToReplace.add(`${row},${col}`);
        }
      }
    }
    
    // Always add both the normal jewel and hypercube positions
    positionsToReplace.add(`${normalPos.row},${normalPos.col}`);
    positionsToReplace.add(`${hypercubePos.row},${hypercubePos.col}`);
    
    // Replace all collected positions with new random jewels
    Array.from(positionsToReplace).forEach(pos => {
      const [row, col] = pos.split(',').map(Number);
      const excludedTypes = getExcludedTypes(newBoard, row, col);
      newBoard[row][col] = generateRandomJewel(excludedTypes, specialJewelsEnabled);
    });
    
    return newBoard;
  }
  
  // Normal swap
  [newBoard[pos1.row][pos1.col], newBoard[pos2.row][pos2.col]] = 
    [newBoard[pos2.row][pos2.col], newBoard[pos1.row][pos1.col]];
  return newBoard;
};

export const removeMatches = (board: Jewel[][], matches: Position[][]): Jewel[][] => {
  const newBoard = board.map(row => [...row]);
  const flatMatches = matches.flat();
  const specialJewelsEnabled = board[0][0].specialJewelsEnabled;

  // Create hypercube for matches of 4 or more ONLY if special jewels are enabled
  const longMatch = matches.find(match => match.length >= HYPERCUBE_MATCH);
  const shouldCreateHypercube = specialJewelsEnabled && longMatch;

  if (shouldCreateHypercube) {
    const middlePos = longMatch[Math.floor(longMatch.length / 2)];
    const newJewel: Jewel = {
      type: getRandomJewelType(),
      id: generateId(),
      isHypercube: true,
      specialJewelsEnabled
    };
    newBoard[middlePos.row][middlePos.col] = newJewel;
  }

  // Replace matched jewels with new ones
  for (const { row, col } of flatMatches) {
    // Only skip replacement if we're creating a hypercube at this position
    if (!(shouldCreateHypercube && 
          longMatch?.some(pos => pos.row === row && pos.col === col))) {
      newBoard[row][col] = {
        type: getRandomJewelType(),
        id: generateId(),
        isHypercube: false,
        specialJewelsEnabled
      };
    }
  }

  // Let jewels fall to fill empty spaces
  for (let col = 0; col < BOARD_SIZE; col++) {
    let emptyRow = BOARD_SIZE - 1;
    for (let row = BOARD_SIZE - 1; row >= 0; row--) {
      if (newBoard[row][col].type !== null) {
        if (emptyRow !== row) {
          newBoard[emptyRow][col] = newBoard[row][col];
          newBoard[row][col] = {
            type: getRandomJewelType(),
            id: generateId(),
            isHypercube: false,
            specialJewelsEnabled
          };
        }
        emptyRow--;
      }
    }
  }

  return newBoard;
}; 