import {useState} from 'react';

import {BlocklyMarkdown, BlocklyWorkspace} from '../src';
import {themeOptions, themes} from '../src/themes';

import {modes} from './modes';

const INSTRUCTIONS_WIDTH = 360;

/**
 * Dev playground for the Blockly workspace. A mode selector (above the
 * instructions) swaps the lesson — its instructions, toolbox, starting blocks,
 * and plugins — a theme selector picks the block palette, and a light/dark
 * toggle restyles both the blocks and the surrounding chrome live. The
 * instructions render through BlocklyMarkdown on the left (so any inline `<xml>`
 * shows as a live block preview); the editable workspace fills the rest.
 */
export const Demo = () => {
  const [modeId, setModeId] = useState(modes[0].id);
  const [themeName, setThemeName] = useState(themeOptions[0].value);
  const [dark, setDark] = useState(false);

  const mode = modes.find(candidate => candidate.id === modeId) ?? modes[0];
  // Dark variants share the base name with a `-dark` suffix in the themes map;
  // fall back to the light theme if a variant is ever missing.
  const theme = (dark && themes[`${themeName}-dark`]) || themes[themeName];

  const selectStyle = {fontSize: 14, padding: '4px 8px'};

  return (
    <div
      // data-theme drives the design-system color variables the BlocklyMarkdown
      // instructions (and this chrome) read; the Blockly block palette is themed
      // separately via the `theme` prop below.
      data-theme={dark ? 'Dark' : 'Light'}
      style={{
        background: 'var(--background-neutral-primary)',
        color: 'var(--text-neutral-primary)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'sans-serif',
        height: '100vh',
      }}
    >
      <header
        style={{
          alignItems: 'center',
          borderBottom: '1px solid var(--border-neutral-secondary, #ccc)',
          display: 'flex',
          flex: '0 0 auto',
          gap: 24,
          padding: '8px 16px',
        }}
      >
        <label style={{flex: `0 0 ${INSTRUCTIONS_WIDTH}px`}}>
          Mode{' '}
          <select
            value={modeId}
            onChange={event => setModeId(event.target.value)}
            style={selectStyle}
          >
            {modes.map(candidate => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Theme{' '}
          <select
            value={themeName}
            onChange={event => setThemeName(event.target.value)}
            style={selectStyle}
          >
            {themeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.text}
              </option>
            ))}
          </select>
        </label>
        <label>
          <input
            type="checkbox"
            checked={dark}
            onChange={event => setDark(event.target.checked)}
          />{' '}
          Dark mode
        </label>
      </header>

      <div style={{display: 'flex', flex: '1 1 auto', minHeight: 0}}>
        <aside
          style={{
            borderRight: '1px solid var(--border-neutral-secondary, #ccc)',
            boxSizing: 'border-box',
            flex: `0 0 ${INSTRUCTIONS_WIDTH}px`,
            overflowY: 'auto',
            padding: 16,
          }}
        >
          <BlocklyMarkdown
            content={mode.instructions}
            blocks={mode.blocks}
            plugins={mode.plugins}
            theme={theme}
          />
        </aside>

        <main style={{display: 'flex', flex: '1 1 auto', minWidth: 0}}>
          {/* Remount per mode so each loads its own toolbox, start blocks, and
              plugins from a clean workspace rather than mutating the previous
              one. */}
          <BlocklyWorkspace
            key={mode.id}
            toolbox={mode.toolbox}
            startBlocks={mode.startBlocks}
            plugins={mode.plugins}
            blocks={mode.blocks}
            theme={theme}
          />
        </main>
      </div>
    </div>
  );
};

export default Demo;
