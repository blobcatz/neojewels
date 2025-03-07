import React from 'react';
import './Menu.css';

interface MenuProps {
  onStartGame: () => void;
}

const Menu: React.FC<MenuProps> = ({ onStartGame }) => {
  return (
    <div className="menu-container">
      <h1>NeoJewels</h1>
      <p className="subtitle">Bejeweled but with Neomojis!</p>
      <button className="start-button" onClick={onStartGame}>
        Start Game
      </button>
      <p className="credits">Neofox and Neocat emotes by <a href="https://volpeon.ink/">Volpeon</a> | v1.1 <a href="https://github.com/blobcatz/neojewels">Source Code</a></p>
    </div>
  );
};

export default Menu; 