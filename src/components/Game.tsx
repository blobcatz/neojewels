import { useState, useEffect, useRef } from 'react';
import { GameState, Position, Jewel } from '../types/game';
import {
  createBoard,
  findMatches,
  isAdjacent,
  swapJewels,
  removeMatches,
  findPossibleMoves
} from '../utils/gameUtils';
import { playMoveSound, playErrorSound, playGameOverSound, playMatchSound } from '../utils/soundUtils';
import './Game.css';
import React from 'react';
import Menu from './Menu';

const INITIAL_TIME = 90; // Default time
const TIME_BONUS = 2; // seconds added per successful match
const ANIMATION_DURATION = 500;
const FALL_DELAY = 50;

interface FallingJewel extends Position {
  fallDelay: number;
  fallDistance: number;
}

interface DragState {
  isDragging: boolean;
  startPosition: Position | null;
  currentPosition: Position | null;
  touchStartX?: number;
  touchStartY?: number;
}

interface SwapAnimation {
  positions: [Position, Position];
  isSwapping: boolean;
  isFailing: boolean;
}

const StarIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="currentColor">
    <path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clip-rule="evenodd" />
  </svg>
);

const ClockIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="currentColor">
    <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clip-rule="evenodd" />
  </svg>
);

const LightbulbIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 .75a8.25 8.25 0 0 0-4.135 15.39c.686.398 1.115 1.008 1.134 1.623a.75.75 0 0 0 .577.706c.352.083.71.148 1.074.195.323.041.6-.218.6-.544v-4.661a6.714 6.714 0 0 1-.937-.171.75.75 0 1 1 .374-1.453 5.261 5.261 0 0 0 2.626 0 .75.75 0 1 1 .374 1.452 6.712 6.712 0 0 1-.937.172v4.66c0 .327.277.586.6.545.364-.047.722-.112 1.074-.195a.75.75 0 0 0 .577-.706c.02-.615.448-1.225 1.134-1.623A8.25 8.25 0 0 0 12 .75Z" />
    <path fill-rule="evenodd" d="M9.013 19.9a.75.75 0 0 1 .877-.597 11.319 11.319 0 0 0 4.22 0 .75.75 0 1 1 .28 1.473 12.819 12.819 0 0 1-4.78 0 .75.75 0 0 1-.597-.876ZM9.754 22.344a.75.75 0 0 1 .824-.668 13.682 13.682 0 0 0 2.844 0 .75.75 0 1 1 .156 1.492 15.156 15.156 0 0 1-3.156 0 .75.75 0 0 1-.668-.824Z" clip-rule="evenodd" />
  </svg>
);

const ShuffleIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" color="currentColor">
    <path d="M19.5576 4L20.4551 4.97574C20.8561 5.41165 21.0566 5.62961 20.9861 5.81481C20.9155 6 20.632 6 20.0649 6C18.7956 6 17.2771 5.79493 16.1111 6.4733C15.3903 6.89272 14.8883 7.62517 14.0392 9M3 18H4.58082C6.50873 18 7.47269 18 8.2862 17.5267C9.00708 17.1073 9.50904 16.3748 10.3582 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M19.5576 20L20.4551 19.0243C20.8561 18.5883 21.0566 18.3704 20.9861 18.1852C20.9155 18 20.632 18 20.0649 18C18.7956 18 17.2771 18.2051 16.1111 17.5267C15.2976 17.0534 14.7629 16.1815 13.6935 14.4376L10.7038 9.5624C9.63441 7.81853 9.0997 6.9466 8.2862 6.4733C7.47269 6 6.50873 6 4.58082 6H3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
);

const Game: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    board: createBoard(),
    score: 0,
    hintsRemaining: 3,
    shufflesRemaining: 2,
    selectedJewel: null,
    gameOver: false,
    timeRemaining: INITIAL_TIME,
    isGameActive: true,
    isInMenu: true,
    isZenMode: false,
    isNeocatMode: false
  });

  const [matchedJewels, setMatchedJewels] = useState<Position[]>([]);
  const [fallingJewels, setFallingJewels] = useState<FallingJewel[]>([]);
  const [isShaking, setIsShaking] = useState(false);
  const [isUserMatch, setIsUserMatch] = useState(false);
  const [showNoMovesNotification, setShowNoMovesNotification] = useState(false);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startPosition: null,
    currentPosition: null
  });
  const [swapAnimation, setSwapAnimation] = useState<SwapAnimation>({
    positions: [{ row: -1, col: -1 }, { row: -1, col: -1 }],
    isSwapping: false,
    isFailing: false
  });
  const [instanceUrl, setInstanceUrl] = useState('');

  // Create a ref to store persistent jewel styles
  const jewelStylesRef = React.useRef(new Map<string, { rotation: number, size: number }>());

  // Initialize or get jewel style
  const getOrCreateJewelStyle = (jewelId: string) => {
    if (!jewelStylesRef.current.has(jewelId)) {
      jewelStylesRef.current.set(jewelId, {
        rotation: Math.floor(Math.random() * 6) + 1,
        size: Math.floor(Math.random() * 5) + 1
      });
    }
    return jewelStylesRef.current.get(jewelId)!;
  };

  // Get style for a jewel at a specific position
  const getJewelStyle = (rowIndex: number, colIndex: number) => {
    const jewel = gameState.board[rowIndex][colIndex];
    return getOrCreateJewelStyle(jewel.id);
  };

  // Clean up unused styles periodically
  useEffect(() => {
    const usedIds = new Set<string>();
    gameState.board.forEach(row => {
      row.forEach(jewel => {
        usedIds.add(jewel.id);
      });
    });

    // Remove styles for jewels that no longer exist
    for (const id of jewelStylesRef.current.keys()) {
      if (!usedIds.has(id)) {
        jewelStylesRef.current.delete(id);
      }
    }
  }, [gameState.board]);

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (gameState.isGameActive && !gameState.isZenMode && gameState.timeRemaining > 0) {
      timer = setInterval(() => {
        setGameState(prev => {
          const newTime = prev.timeRemaining - 1;
          if (newTime <= 0) {
            playGameOverSound();
            return {
              ...prev,
              timeRemaining: 0,
              gameOver: true,
              isGameActive: false
            };
          }
          return {
            ...prev,
            timeRemaining: newTime
          };
        });
      }, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [gameState.isGameActive, gameState.timeRemaining, gameState.isZenMode]);

  const checkAndRemoveMatches = (board: Jewel[][]) => {
    const matches = findMatches(board);
    if (matches.length > 0) {
      // Play match sound
      playMatchSound();

      // Flatten matches array for animation
      const matchedPositions = matches.flat();
      setMatchedJewels(matchedPositions);
      setIsShaking(true);

      // Reset shaking animation after duration
      setTimeout(() => {
        setIsShaking(false);
      }, ANIMATION_DURATION);

      // Wait for explosion animation before removing
      setTimeout(() => {
        const newBoard = removeMatches(board, matches);
        setMatchedJewels([]);

        // Calculate falling jewels with sequential delays
        const fallingPositions: FallingJewel[] = [];
        matches.forEach(match => {
          match.forEach(({ row, col }) => {
            let fallDistance = 0;
            for (let i = row - 1; i >= 0; i--) {
              fallDistance += 54; // 50px height + 4px margin
              fallingPositions.push({
                row: i,
                col,
                fallDelay: (row - i) * FALL_DELAY,
                fallDistance
              });
            }
          });
        });
        setFallingJewels(fallingPositions);

        setGameState(prev => ({
          ...prev,
          board: newBoard,
          score: prev.score + matches.reduce((acc, match) => acc + match.length, 0) * 10,
          timeRemaining: isUserMatch ? Math.min(prev.timeRemaining + TIME_BONUS, INITIAL_TIME) : prev.timeRemaining
        }));

        // Reset falling animation after the longest delay
        const maxDelay = Math.max(...fallingPositions.map(pos => pos.fallDelay));
        setTimeout(() => {
          setFallingJewels([]);
          setIsUserMatch(false); // Reset the user match flag after animations
        }, ANIMATION_DURATION + maxDelay);
      }, ANIMATION_DURATION);

      return true;
    }
    return false;
  };

  useEffect(() => {
    const board = gameState.board;
    const matches = findMatches(board);
    
    if (matches.length > 0) {
      setTimeout(() => {
        checkAndRemoveMatches(board);
      }, 300);
    } else {
      const possibleMoves = findPossibleMoves(board);
      if (possibleMoves.length === 0 && gameState.isGameActive && !gameState.gameOver) {
        // Show notification
        setShowNoMovesNotification(true);
        
        // Hide notification after animation
        setTimeout(() => {
          setShowNoMovesNotification(false);
        }, 2000);

        // Create a new board
        setTimeout(() => {
          setGameState(prev => ({
            ...prev,
            board: createBoard()
          }));
        }, 1000); // Start creating new board while notification is still visible
      }
    }
  }, [gameState.board, gameState.isGameActive, gameState.gameOver]);

  const handleSwap = (pos1: Position, pos2: Position) => {
    // Start swap animation
    setSwapAnimation({
      positions: [pos1, pos2],
      isSwapping: true,
      isFailing: false
    });

    const newBoard = swapJewels(gameState.board, pos1, pos2);
    const hasMatches = findMatches(newBoard).length > 0;

    if (hasMatches) {
      // Successful swap
      playMoveSound();
      setIsUserMatch(true); // Mark this as a user-initiated match
      setTimeout(() => {
        setSwapAnimation(prev => ({ ...prev, isSwapping: false }));
        setGameState(prev => ({
          ...prev,
          board: newBoard,
          selectedJewel: null
        }));
      }, ANIMATION_DURATION);
    } else {
      // Failed swap
      playErrorSound();
      setTimeout(() => {
        setSwapAnimation(prev => ({ ...prev, isFailing: true }));
        
        // Wait for fail animation, then swap back
        setTimeout(() => {
          setGameState(prev => ({
            ...prev,
            board: swapJewels(newBoard, pos2, pos1),
            selectedJewel: null
          }));
          setSwapAnimation({
            positions: [{ row: -1, col: -1 }, { row: -1, col: -1 }],
            isSwapping: false,
            isFailing: false
          });
        }, ANIMATION_DURATION);
      }, ANIMATION_DURATION);
    }
  };

  const handleJewelClick = (row: number, col: number) => {
    if (gameState.gameOver || !gameState.isGameActive || swapAnimation.isSwapping) return;

    const clickedPosition: Position = { row, col };

    if (!gameState.selectedJewel) {
      setGameState(prev => ({
        ...prev,
        selectedJewel: clickedPosition
      }));
      return;
    }

    if (isAdjacent(gameState.selectedJewel, clickedPosition)) {
      handleSwap(gameState.selectedJewel, clickedPosition);
    } else {
      setGameState(prev => ({
        ...prev,
        selectedJewel: clickedPosition
      }));
    }
  };

  const showHint = () => {
    if ((gameState.hintsRemaining > 0 || gameState.isZenMode) && gameState.isGameActive) {
      const possibleMoves = findPossibleMoves(gameState.board);
      if (possibleMoves.length > 0) {
        const [pos1, pos2] = possibleMoves[0];
        if (!gameState.isZenMode) {
          setGameState(prev => ({
            ...prev,
            hintsRemaining: prev.hintsRemaining - 1
          }));
        }
        
        // Highlight the hint
        const hintElements = [
          document.querySelector(`[data-row="${pos1.row}"][data-col="${pos1.col}"]`),
          document.querySelector(`[data-row="${pos2.row}"][data-col="${pos2.col}"]`)
        ];
        
        hintElements.forEach(el => {
          if (el) {
            el.classList.add('hint');
            setTimeout(() => el.classList.remove('hint'), 2000);
          }
        });
      }
    }
  };

  const shuffleBoard = () => {
    if ((gameState.shufflesRemaining > 0 || gameState.isZenMode) && gameState.isGameActive) {
      // Create a new board with the same jewels but in random positions
      const allJewels = gameState.board.flat();
      let newBoard: Jewel[][] = [];
      let attempts = 0;
      const MAX_ATTEMPTS = 100;

      do {
        // Shuffle the jewels
        const shuffledJewels = [...allJewels].sort(() => Math.random() - 0.5);
        
        // Create new board
        newBoard = [];
        for (let row = 0; row < gameState.board.length; row++) {
          newBoard[row] = [];
          for (let col = 0; col < gameState.board[row].length; col++) {
            newBoard[row][col] = shuffledJewels[row * gameState.board[row].length + col];
          }
        }

        attempts++;
      } while (findMatches(newBoard).length > 0 && attempts < MAX_ATTEMPTS);

      if (attempts >= MAX_ATTEMPTS) {
        newBoard = createBoard();
      }

      if (!gameState.isZenMode) {
        setGameState(prev => ({
          ...prev,
          board: newBoard,
          shufflesRemaining: prev.shufflesRemaining - 1
        }));
      } else {
        setGameState(prev => ({
          ...prev,
          board: newBoard
        }));
      }
    }
  };

  const startGame = (initialTime: number, isNeocatMode: boolean) => {
    const isZenMode = initialTime === 0;
    setGameState(prev => ({
      ...prev,
      isInMenu: false,
      board: createBoard(),
      score: 0,
      hintsRemaining: isZenMode ? Infinity : 3,
      shufflesRemaining: isZenMode ? Infinity : 2,
      selectedJewel: null,
      gameOver: false,
      timeRemaining: initialTime || INITIAL_TIME,
      isGameActive: true,
      isZenMode,
      isNeocatMode
    }));
  };

  const resetGame = () => {
    setGameState(prev => ({
      ...prev,
      board: createBoard(),
      score: 0,
      hintsRemaining: 3,
      shufflesRemaining: 2,
      selectedJewel: null,
      gameOver: false,
      timeRemaining: INITIAL_TIME,
      isGameActive: true,
      isInMenu: true,
      isNeocatMode: prev.isNeocatMode
    }));
  };

  const endGame = () => {
    playGameOverSound();
    setGameState(prev => ({
      ...prev,
      gameOver: true,
      isGameActive: false
    }));
  };

  const formatTime = (seconds: number): string => {
    if (gameState.isZenMode) return '∞';
    return `${seconds}s`;
  };

  const isJewelMatched = (row: number, col: number): boolean => {
    return matchedJewels.some(pos => pos.row === row && pos.col === col);
  };

  const isJewelAdjacent = (row: number, col: number): boolean => {
    if (!gameState.selectedJewel) return false;
    return Math.abs(gameState.selectedJewel.row - row) <= 1 && 
           Math.abs(gameState.selectedJewel.col - col) <= 1 &&
           !(gameState.selectedJewel.row === row && gameState.selectedJewel.col === col);
  };

  const getJewelFallingStyle = (row: number, col: number) => {
    const fallingJewel = fallingJewels.find(j => j.row === row && j.col === col);
    if (fallingJewel) {
      return {
        animationDelay: `${fallingJewel.fallDelay}ms`,
        '--fall-distance': `-${fallingJewel.fallDistance}px`
      } as React.CSSProperties;
    }
    return {};
  };

  const handleDragStart = (row: number, col: number, e: React.DragEvent<HTMLDivElement>) => {
    if (gameState.gameOver || !gameState.isGameActive) return;
    
    e.dataTransfer.setData('text/plain', ''); // Required for Firefox
    e.dataTransfer.effectAllowed = 'move';
    
    setDragState({
      isDragging: true,
      startPosition: { row, col },
      currentPosition: { row, col }
    });
  };

  const handleDragOver = (row: number, col: number, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!dragState.isDragging) return;

    setDragState(prev => ({
      ...prev,
      currentPosition: { row, col }
    }));
  };

  const handleDrop = (row: number, col: number) => {
    if (!dragState.startPosition || !dragState.isDragging || swapAnimation.isSwapping) return;

    const startPos = dragState.startPosition;
    const endPos = { row, col };

    if (isAdjacent(startPos, endPos)) {
      handleSwap(startPos, endPos);
    }

    setDragState({
      isDragging: false,
      startPosition: null,
      currentPosition: null
    });
  };

  const handleDragEnd = () => {
    setDragState({
      isDragging: false,
      startPosition: null,
      currentPosition: null
    });
  };

  const handleShare = () => {
    if (!instanceUrl) return;

    let fullUrl = instanceUrl;
    if (!instanceUrl.startsWith('http://') && !instanceUrl.startsWith('https://')) {
      fullUrl = 'https://' + instanceUrl;
    }

    try {
      const shareText = `Just scored ${gameState.score} in #NeoJewels! https://blobcatz.github.io/neojewels/`;
      const shareUrl = new URL('/share', fullUrl);
      shareUrl.searchParams.set('text', shareText);
      
      window.open(shareUrl.toString(), '_blank');
    } catch (error) {
      console.error('Invalid instance URL');
    }
  };

  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add viewport meta tag for mobile optimization
    const viewportMeta = document.createElement('meta');
    viewportMeta.name = 'viewport';
    viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    document.head.appendChild(viewportMeta);

    // Prevent pull-to-refresh on mobile
    document.body.style.overscrollBehavior = 'none';

    // Add non-passive touch event listeners to the game board
    const board = boardRef.current;
    if (board) {
      const preventTouch = (e: TouchEvent) => {
        e.preventDefault();
      };

      board.addEventListener('touchmove', preventTouch, { passive: false });
      board.addEventListener('touchstart', preventTouch, { passive: false });

      return () => {
        document.head.removeChild(viewportMeta);
        document.body.style.overscrollBehavior = 'auto';
        board.removeEventListener('touchmove', preventTouch);
        board.removeEventListener('touchstart', preventTouch);
      };
    }

    return () => {
      document.head.removeChild(viewportMeta);
      document.body.style.overscrollBehavior = 'auto';
    };
  }, []);

  // Modify touch event handlers to not call preventDefault
  const handleTouchStart = (e: React.TouchEvent, position: Position) => {
    if (gameState.gameOver || !gameState.isGameActive) return;
    
    const touch = e.touches[0];
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    
    setDragState({
      isDragging: true,
      startPosition: position,
      currentPosition: position,
      touchStartX: touch.clientX - rect.left,
      touchStartY: touch.clientY - rect.top
    });
    
    setGameState(prev => ({
      ...prev,
      selectedJewel: position
    }));
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragState.isDragging || !boardRef.current) return;

    const touch = e.touches[0];
    const board = boardRef.current.getBoundingClientRect();
    const jewelSize = board.width / 8; // 8x8 board
    
    const touchX = touch.clientX - board.left;
    const touchY = touch.clientY - board.top;
    
    // Calculate the current position based on touch coordinates
    const col = Math.floor(touchX / jewelSize);
    const row = Math.floor(touchY / jewelSize);
    
    // Ensure we're within board boundaries
    if (row >= 0 && row < 8 && col >= 0 && col < 8) {
      const newPosition = { row, col };
      
      // Only update if the position has changed and is adjacent
      if (dragState.startPosition && 
          (newPosition.row !== dragState.currentPosition?.row || 
           newPosition.col !== dragState.currentPosition?.col) &&
          isAdjacent(dragState.startPosition, newPosition)) {
        setDragState(prev => ({
          ...prev,
          currentPosition: newPosition
        }));
      }
    }
  };

  const handleTouchEnd = () => {
    if (!dragState.isDragging || !dragState.startPosition || !dragState.currentPosition) return;

    if (isAdjacent(dragState.startPosition, dragState.currentPosition)) {
      handleSwap(dragState.startPosition, dragState.currentPosition);
    }

    setDragState({
      isDragging: false,
      startPosition: null,
      currentPosition: null
    });

    setGameState(prev => ({
      ...prev,
      selectedJewel: null
    }));
  };

  return (
    <div className="game-container">
      {showNoMovesNotification && (
        <div className="notification">
          No more moves! Reshuffling the board...
        </div>
      )}
      {gameState.isInMenu ? (
        <Menu onStartGame={startGame} />
      ) : gameState.gameOver ? (
        <div className="game-over">
          <h2>Game Over!</h2>
          <p>final score: {gameState.score}</p>
          <button className="reset-button" onClick={resetGame}>
            play again
          </button>
          <div className="share-section">
            <h3>share your score on fedi</h3>
            <div className="share-input-group">
              <input
                type="url"
                className="instance-input"
                placeholder="instance url"
                value={instanceUrl}
                onChange={(e) => setInstanceUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleShare()}
              />
              <button 
                className="share-button"
                onClick={handleShare}
                title="Share your score"
              >
                share
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="game-info">
            <div className="score">
              <StarIcon />
              {gameState.score}
            </div>
            <div className="timer">
              <ClockIcon />
              {formatTime(gameState.timeRemaining)}
            </div>
            <div className="game-controls">
              <div className="hints">
                <div
                  className={`hint-icon ${(!gameState.isZenMode && gameState.hintsRemaining === 0) || !gameState.isGameActive ? 'disabled' : ''}`}
                  onClick={showHint}
                  role="button"
                  aria-label="Show hint"
                  title="Show hint"
                >
                  <LightbulbIcon />
                </div>
                <span className="hints-count">{gameState.isZenMode ? '∞' : gameState.hintsRemaining}</span>
              </div>
              <div className="shuffles">
                <div
                  className={`shuffle-icon ${(!gameState.isZenMode && gameState.shufflesRemaining === 0) || !gameState.isGameActive ? 'disabled' : ''}`}
                  onClick={shuffleBoard}
                  role="button"
                  aria-label="Shuffle board"
                  title="Shuffle board"
                >
                  <ShuffleIcon />
                </div>
                <span className="shuffles-count">{gameState.isZenMode ? '∞' : gameState.shufflesRemaining}</span>
              </div>
            </div>
          </div>
          <div className={`game-board ${gameState.isNeocatMode ? 'neocat-mode' : ''}`} ref={boardRef}>
            {gameState.board.map((row, rowIndex) => (
              <div key={rowIndex} className="board-row">
                {row.map((jewel, colIndex) => {
                  const position = { row: rowIndex, col: colIndex };
                  const style = getJewelStyle(rowIndex, colIndex);
                  const rotationClass = `rotate-${style.rotation}`;
                  const sizeClass = `size-${style.size}`;

                  // Calculate position for swap animation
                  let swapStyle: React.CSSProperties = {};
                  if (swapAnimation.isSwapping) {
                    const [pos1, pos2] = swapAnimation.positions;
                    if (rowIndex === pos1.row && colIndex === pos1.col) {
                      const offsetX = (pos2.col - pos1.col) * 54; // 50px + 4px margin
                      const offsetY = (pos2.row - pos1.row) * 54;
                      swapStyle = {
                        '--offset-x': `${offsetX}px`,
                        '--offset-y': `${offsetY}px`
                      } as React.CSSProperties;
                    } else if (rowIndex === pos2.row && colIndex === pos2.col) {
                      const offsetX = (pos1.col - pos2.col) * 54;
                      const offsetY = (pos1.row - pos2.row) * 54;
                      swapStyle = {
                        '--offset-x': `${offsetX}px`,
                        '--offset-y': `${offsetY}px`
                      } as React.CSSProperties;
                    }
                  }

                  const fallStyle = {
                    ...getJewelFallingStyle(rowIndex, colIndex),
                    ...swapStyle,
                    '--initial-rotation': `${(style.rotation - 3.5) * 2}deg`,
                    '--initial-scale': style.size === 3 ? '1' : style.size < 3 ? '0.96' : '1.04'
                  } as React.CSSProperties;

                  const willFall = fallingJewels.some(j => j.row === rowIndex && j.col === colIndex);
                  const isMatched = isJewelMatched(rowIndex, colIndex);
                  const isSelected = gameState.selectedJewel?.row === rowIndex && gameState.selectedJewel?.col === colIndex;
                  const isAdj = isJewelAdjacent(rowIndex, colIndex);
                  const isDragging = dragState.startPosition?.row === rowIndex && dragState.startPosition?.col === colIndex;
                  const isDragTarget = dragState.currentPosition?.row === rowIndex && dragState.currentPosition?.col === colIndex;
                  const isSwapping = swapAnimation.positions.some(pos => pos.row === rowIndex && pos.col === colIndex);
                  const isSwapFailing = swapAnimation.isFailing && isSwapping;

                  const baseClasses = `jewel ${jewel.type}`;
                  const animationClasses = !willFall && !isMatched ? `${rotationClass} ${sizeClass}` : '';
                  const stateClasses = `${
                    isSelected
                      ? 'selected'
                      : isAdj
                      ? 'adjacent'
                      : ''
                  } ${isMatched ? 'matched' : ''} 
                  ${willFall ? 'falling' : ''} 
                  ${isShaking && !willFall && !isMatched ? 'board-shake' : ''}
                  ${isDragging ? 'dragging' : ''}
                  ${isDragTarget ? 'drag-target' : ''}
                  ${isSwapping ? 'swapping' : ''}
                  ${isSwapFailing ? 'swap-failed' : ''}`;

                  return (
                    <div
                      key={jewel.id}
                      className={`${baseClasses} ${animationClasses} ${stateClasses}`}
                      style={fallStyle}
                      data-row={rowIndex}
                      data-col={colIndex}
                      onClick={() => handleJewelClick(rowIndex, colIndex)}
                      draggable={!gameState.gameOver && gameState.isGameActive && !swapAnimation.isSwapping}
                      onDragStart={(e) => handleDragStart(rowIndex, colIndex, e)}
                      onDragOver={(e) => handleDragOver(rowIndex, colIndex, e)}
                      onDrop={() => handleDrop(rowIndex, colIndex)}
                      onDragEnd={handleDragEnd}
                      onTouchStart={(e) => handleTouchStart(e, position)}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          {gameState.isZenMode && (
            <button className="end-game-button" onClick={endGame}>
              End Game
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default Game; 
