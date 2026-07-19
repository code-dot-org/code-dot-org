import {FontSize} from '@code-dot-org/lab';
import type {FontSizeKey} from '@code-dot-org/lab';
import {labViewActions} from '@code-dot-org/lab/redux';
import type {Setting} from '@code-dot-org/lab/resourcePanel';

import {useAppDispatch, useAppSelector} from '../redux/store';

// Font-size dropdown options, one per FontSize key (Tiny…Huge).
const fontSizeOptions = (Object.keys(FontSize) as FontSizeKey[]).map(key => ({
  value: key,
  text: key,
}));

/**
 * The Codebridge-owned settings for the resource panel's Settings menu: editor
 * and console font size. Ported and trimmed from
 * apps/src/codebridge/hooks/useCodebridgeSettings.ts — the theme setting is
 * contributed separately by the host lab (see the base `useThemeSetting`), and
 * the layout toggle is omitted (the port has a single layout). Backend
 * per-user persistence is deferred; the choice is session-only.
 */
export const useCodebridgeSettings = (): Setting[] => {
  const dispatch = useAppDispatch();
  const editorFontSizeKey = useAppSelector(
    state => state.labView.editorFontSizeKey,
  );
  const consoleFontSizeKey = useAppSelector(
    state => state.labView.consoleFontSizeKey,
  );

  return [
    {
      id: 'editorFontSize',
      label: 'Text editor font size',
      options: fontSizeOptions,
      selectedValue: editorFontSizeKey,
      onChange: value =>
        dispatch(labViewActions.setEditorFontSize(value as FontSizeKey)),
    },
    {
      id: 'consoleFontSize',
      label: 'Console font size',
      options: fontSizeOptions,
      selectedValue: consoleFontSizeKey,
      onChange: value =>
        dispatch(labViewActions.setConsoleFontSize(value as FontSizeKey)),
    },
  ];
};
