import React, { useState } from 'react';
import './Menu.css';

interface MenuProps {
  onStartGame: (initialTime: number) => void;
}

const Menu: React.FC<MenuProps> = ({ onStartGame }) => {
  const [timeInput, setTimeInput] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [showCredits, setShowCredits] = useState(false);

  const handleStartGame = () => {
    const parsedTime = timeInput === '' ? 90 : parseInt(timeInput);
    onStartGame(parsedTime);
  };

  return (
    <div className="menu-container">
      <h1>NeoJewels</h1>
      <p className="subtitle">Bejeweled but with Neomojis!</p>
      <div className="menu-buttons">
        <button className="start-button" onClick={handleStartGame}>
          Start Game
        </button>
        <div className="secondary-buttons">
          <button className="menu-button" onClick={() => setShowSettings(true)}>
            Settings
          </button>
          <button className="menu-button" onClick={() => setShowCredits(true)}>
            Credits
          </button>
        </div>
      </div>

      {/* Settings Pop-up */}
      {showSettings && (
        <div className="popup-overlay">
          <div className="popup-content settings-popup">
            <h2>Settings</h2>
            <div className="time-setting">
              <p>Time: </p>
              <input
                type="number"
                min="0"
                placeholder="90"
                value={timeInput}
                onChange={(e) => setTimeInput(e.target.value)}
                className="time-input"
                aria-label="Initial game time in seconds"
              />
              <p className="time-hint">
                Initial time in seconds (default: 90)<br />
                Set to 0 for Zen Mode with no limits
              </p>
            </div>
            <button className="close-button" onClick={() => setShowSettings(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Credits Pop-up */}
      {showCredits && (
        <div className="popup-overlay">
          <div className="popup-content credits-popup">
            <h2>Credits</h2>
            <div className="credits-content">
              <p><a href="https://volpeon.ink/emojis/neofox/">Neofox</a> and <a href="https://volpeon.ink/emojis/neocat/">Neocat</a> by <a href="https://volpeon.ink/">Volpeon</a></p>
              <p><a href="https://git.gay/av70/neomouse">Neomouse</a> by <a href="https://akko.eepy.zone/wep">Wep</a></p>
              <p><a href="https://github.com/olivvybee/emojis">Neobread</a> by <a href="https://honeycomb.engineer/@olivvybee">olivvybee</a></p>
              <p><a href="https://github.com/SymTrkl/emoji">Neobot</a> by <a href="https://anarres.family/@SymTrkl">Jen</a> with contributions by <a href="https://kitty.social/@o76923">James</a></p>
              <p><a href="https://git.gay/moonrabbits/neodog">Neodog</a> by <a href="https://shonk.phite.ro/@moonrabbits">Moonrabbits</a></p>
              <p><a href="https://hai.z0ne.social/notes/a4p3f4y9f0qc0q0o">Neowolf</a> by <a href="https://hai.z0ne.social/@Erpel">Ente</a> (via <a href="https://neomojimixer.com">Neomojimixer</a>)</p>
              <p className="version">v1.2 | <a href="https://github.com/blobcatz/neojewels">Source Code</a></p>
            </div>
            <button className="close-button" onClick={() => setShowCredits(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu; 