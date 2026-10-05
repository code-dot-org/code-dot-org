import type {InstructionsKey} from '@code-dot-org/ailab';

import ailabI18n from '@cdo/apps/ailab/locale';

// Keys that only Lab 2 AI Lab uses, so the legacy AI Lab locale has no string for them.
const LAB2_ONLY_DEFAULTS: Partial<Record<InstructionsKey, string>> = {
  datasetView:
    'Choose one column to predict, and one or more columns as inputs to help make the prediction.',
};

const legacyStrings = ailabI18n as Partial<Record<string, () => string>>;

export function getDefaultInstructions(
  key: InstructionsKey
): string | undefined {
  return LAB2_ONLY_DEFAULTS[key] ?? legacyStrings[key]?.();
}
