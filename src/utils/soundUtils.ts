import moveSoundFile from '../assets/move.mp3';
import errorSoundFile from '../assets/error.mp3';
import gameOverSoundFile from '../assets/gameover.mp3';
import matchSoundFile from '../assets/match.mp3';

// Create audio elements for each sound
const moveSound = new Audio(moveSoundFile);
const errorSound = new Audio(errorSoundFile);
const gameOverSound = new Audio(gameOverSoundFile);
const matchSound = new Audio(matchSoundFile);

// Configure sound settings
moveSound.volume = 0.5;
errorSound.volume = 0.5;
gameOverSound.volume = 0.5;
matchSound.volume = 0.5;

export const playMoveSound = () => {
  moveSound.currentTime = 0;
  moveSound.play().catch(() => {
    // Ignore errors if sound can't play (e.g., user hasn't interacted with the page)
  });
};

export const playErrorSound = () => {
  errorSound.currentTime = 0;
  errorSound.play().catch(() => {
    // Ignore errors if sound can't play
  });
};

export const playGameOverSound = () => {
  gameOverSound.currentTime = 0;
  gameOverSound.play().catch(() => {
    // Ignore errors if sound can't play
  });
};

export const playMatchSound = () => {
  matchSound.currentTime = 0;
  matchSound.play().catch(() => {
    // Ignore errors if sound can't play
  });
}; 