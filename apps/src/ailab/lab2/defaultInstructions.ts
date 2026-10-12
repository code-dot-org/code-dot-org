import {LAB2_INSTRUCTIONS, type InstructionsKey} from '@code-dot-org/ailab';

import ailabI18n from '@cdo/apps/ailab/locale';

const legacyStrings = ailabI18n as Partial<Record<string, () => string>>;

// The legacy locale comes first because it is translated; LocalizeJS skips the AI Lab view.
export function getDefaultInstructions(
  key: InstructionsKey
): string | undefined {
  return (
    legacyStrings[key]?.() ??
    LAB2_INSTRUCTIONS.find(screen => screen.key === key)?.defaultText
  );
}
