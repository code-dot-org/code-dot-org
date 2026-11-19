import React from 'react';
import {createRoot} from 'react-dom/client';
import IconList from './code-studio/components/IconList';
import {searchAssets} from './code-studio/assets/searchAssets';

window.__searchAssets = (q) => searchAssets(q, 'all', {aliases: {hand: ['hand'], 'hand-up': ['hand-up']}, categories: {}, metadata: {hand: {name: 'hand'}, 'hand-up': {name: 'hand-up'}}}, 0, 10);

function showErr(msg) {
  const el = document.getElementById('err');
  el.textContent = 'UNCAUGHT: ' + msg;
}
window.addEventListener('error', e => showErr(e.message));

function App() {
  const [s, setS] = React.useState('');
  return (
    <div>
      <input id="search" value={s} onChange={e => setS(e.target.value)} placeholder="search icons" />
      <IconList search={s} assetChosen={() => {}} />
    </div>
  );
}
createRoot(document.getElementById('root')).render(<App />);
