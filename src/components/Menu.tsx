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
      <p className="subtitle creditsTitle">Credits</p>
      <p className="credits"><a href="https://volpeon.ink/emojis/neofox/">Neofox</a> and <a href="https://volpeon.ink/emojis/neocat/">Neocat</a> by <a href="https://volpeon.ink/">Volpeon</a><br></br>
      <a href="https://git.gay/av70/neomouse">Neomouse</a> by <a href="https://akko.eepy.zone/wep">Wep</a><br></br>
      <a href="https://github.com/olivvybee/emojis">Neobread</a> by <a href="https://honeycomb.engineer/@olivvybee">olivvybee</a><br></br>
      <a href="https://github.com/SymTrkl/emoji">Neobot</a> by <a href="https://anarres.family/@SymTrkl">Jen</a> with contributions by <a href="https://kitty.social/@o76923">James</a><br></br>
      <a href="https://git.gay/moonrabbits/neodog">Neodog</a> by <a href="https://shonk.phite.ro/@moonrabbits">Moonrabbits</a><br></br>
      <a href="https://hai.z0ne.social/notes/a4p3f4y9f0qc0q0o">Neowolf</a> by <a href="https://hai.z0ne.social/@Erpel">Ente</a> (via <a href="https://neomojimixer.com">Neomojimixer</a>)<br></br>
      </p>
      <p className="credits">v1.1 | <a href="https://github.com/blobcatz/neojewels">Source Code</a></p>
    </div>
  );
};

export default Menu; 