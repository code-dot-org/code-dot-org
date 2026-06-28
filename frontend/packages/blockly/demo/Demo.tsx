import {Typography} from '@mui/material';
import {useState} from 'react';

import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';
import Toggle from '@code-dot-org/component-library/toggle';

import {BlocklyMarkdown, BlocklyProvider, BlocklyWorkspace} from '../src';
import {themeOptions, themes} from '../src/themes';

import {modes} from './modes';

import moduleStyles from './demo.module.scss';

/**
 * Dev playground for the Blockly workspace. A mode selector swaps the lesson —
 * its instructions, toolbox, starting blocks, and plugins — a theme selector
 * picks the block palette, and a light/dark toggle restyles both the blocks and
 * the surrounding chrome live. The instructions render through BlocklyMarkdown
 * on the left (so any inline `<xml>` shows as a live block preview); the
 * editable workspace fills the rest.
 *
 * The chrome is built from the design system, mirroring the markdown package's
 * demo: DSCO controls (SimpleDropdown, Toggle) and MUI Typography, with layout
 * in a CSS module. `data-theme` on the root bridges to the design-system color
 * variables so the chrome (and the BlocklyMarkdown instructions) track the
 * light/dark toggle; the Blockly block palette is themed separately via `theme`.
 */
export const Demo = () => {
  const [modeId, setModeId] = useState(modes[0].id);
  const [themeName, setThemeName] = useState(themeOptions[0].value);
  const [dark, setDark] = useState(false);

  const mode = modes.find(candidate => candidate.id === modeId) ?? modes[0];
  // Dark variants share the base name with a `-dark` suffix in the themes map;
  // fall back to the light theme if a variant is ever missing.
  const theme = (dark && themes[`${themeName}-dark`]) || themes[themeName];

  return (
    <div className={moduleStyles.app} data-theme={dark ? 'Dark' : 'Light'}>
      <header className={moduleStyles.header}>
        <Typography variant="h6" component="h1" className={moduleStyles.title}>
          Blockly demo
        </Typography>
        <SimpleDropdown
          name="mode"
          labelText="Mode"
          selectedValue={modeId}
          onChange={event => setModeId(event.target.value)}
          items={modes.map(candidate => ({
            value: candidate.id,
            text: candidate.name,
          }))}
        />
        <SimpleDropdown
          name="theme"
          labelText="Theme"
          selectedValue={themeName}
          onChange={event => setThemeName(event.target.value)}
          items={themeOptions.map(option => ({
            value: option.value,
            text: option.text,
          }))}
        />
        <Toggle
          name="dark"
          label="Dark mode"
          checked={dark}
          onChange={event => setDark(event.target.checked)}
        />
      </header>

      {mode.id === 'flyoutSpike' ? (
        // Spike: a BlocklyProvider lets the instructions and the main workspace
        // share one driver. The instructions render with `draggable`, so each
        // embedded <xml> becomes a flyout that drags (or keyboard-places) its
        // blocks into the main workspace.
        <BlocklyProvider
          key={mode.id}
          blocks={mode.blocks}
          plugins={mode.plugins}
          theme={theme}
        >
          <div className={moduleStyles.body}>
            <aside aria-label="Instructions" className={moduleStyles.sidebar}>
              <BlocklyMarkdown
                draggable
                content={mode.instructions}
                blocks={mode.blocks}
                plugins={mode.plugins}
                theme={theme}
              />
            </aside>

            <main aria-label="Coding workspace" className={moduleStyles.canvas}>
              <BlocklyWorkspace startBlocks={mode.startBlocks} theme={theme} />
            </main>
          </div>
        </BlocklyProvider>
      ) : (
        <div className={moduleStyles.body}>
          <aside className={moduleStyles.sidebar}>
            <BlocklyMarkdown
              content={mode.instructions}
              blocks={mode.blocks}
              plugins={mode.plugins}
              theme={theme}
            />
          </aside>

          <main className={moduleStyles.canvas}>
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
      )}
    </div>
  );
};

export default Demo;
