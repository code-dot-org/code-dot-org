import {render} from '@testing-library/react';
import * as React from 'react';
import {describe, it, expect, beforeEach, vi} from 'vitest';

import {Modes} from '../../../src/oceans/constants';
import {resetState, setState} from '../../../src/oceans/state';

// Avoid canvas operations in jsdom.
vi.mock('../../../src/oceans/models/soundLibrary', () => ({
  default: {playSound: vi.fn(), loadSounds: vi.fn(), injectSoundAPIs: vi.fn()},
}));

describe('UI', () => {
  beforeEach(async () => {
    resetState();
  });

  it('renders a loading indicator in Loading mode', async () => {
    setState({currentMode: Modes.Loading});
    const {default: UI} = await import('../../../src/oceans/ui');
    const {container} = render(React.createElement(UI));
    // The loading component renders an img with alt="Loading".
    expect(container.querySelector('img[alt="Loading"]')).not.toBeNull();
  });
});
