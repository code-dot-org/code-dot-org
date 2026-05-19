/**
 * OceansLabelingRenderer — AI for Oceans labeling level renderer (T051).
 *
 * Wraps OceansShell with the correct AppMode per level id.
 * The OceansLab component handles its own ghost-finger demo and growing-
 * school mastery visual internally.
 *
 * onContinue fires onComplete(perfect=true) since training runs are
 * always treated as perfect — the bias insight comes from diverging
 * predictions, not error counts.
 */

import type {Level} from '../../content/types';
import {useLanguage} from '../../i18n/StringsProvider';

import {OceansShell} from './OceansShell';

import {appModeForLevel} from './index';

export interface OceansLabelingRendererProps {
  level: Level;
  onComplete: (perfect: boolean) => void;
}

/**
 * Oceans labeling renderer for `kind: 'oceans-labeling'` levels.
 * Passes the active locale so OceansLab can use its built-in TTS guide.
 */
export function OceansLabelingRenderer({
  level,
  onComplete,
}: OceansLabelingRendererProps) {
  const lang = useLanguage();
  const appMode = appModeForLevel(level.id);

  return (
    <OceansShell
      appMode={appMode}
      guides="K5"
      textToSpeechLocale={lang}
      onContinue={() => onComplete(true)}
      height="calc(100vh - 56px)"
    />
  );
}
