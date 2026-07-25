import {BLOCKLY_THEME_APPLIED_EVENT, Themes} from '@cdo/apps/blockly/constants';
import {setAllWorkspacesTheme} from '@cdo/apps/blockly/utils/workspace/themes';

import setBlocklyGlobal from '../../../../util/setupBlocklyGlobal';

setBlocklyGlobal();

describe('setAllWorkspacesTheme', () => {
  it('dispatches a theme-applied event with the new theme', () => {
    const received = [];
    const listener = event => received.push(event.detail.theme);
    document.addEventListener(BLOCKLY_THEME_APPLIED_EVENT, listener);

    const theme = Blockly.themes[Themes.HIGH_CONTRAST];
    setAllWorkspacesTheme(theme, undefined);

    document.removeEventListener(BLOCKLY_THEME_APPLIED_EVENT, listener);
    expect(received).toEqual([theme]);
  });
});
