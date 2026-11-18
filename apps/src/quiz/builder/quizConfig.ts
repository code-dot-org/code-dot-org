import {INTRO_SCREEN_REQUIRED_ERROR, TIME_LIMIT_ERROR} from './constants';
import {QuizConfigurationData} from './types';

// Blank text and a missing value both mean the field is unset.
function normalize(value: unknown) {
  return value === '' || value === null ? undefined : value;
}

// The fields of draft that differ from saved, as Save quiz sends them.
export function changedConfigFields(
  saved: QuizConfigurationData,
  draft: QuizConfigurationData
): Partial<QuizConfigurationData> {
  const keys = new Set([...Object.keys(saved), ...Object.keys(draft)]);
  return Object.fromEntries(
    [...keys]
      .map(key => key as keyof QuizConfigurationData)
      .filter(key => normalize(saved[key]) !== normalize(draft[key]))
      .map(key => [key, normalize(draft[key])])
  );
}

export function timeLimitError(draft: QuizConfigurationData): string | null {
  const minutes = normalize(draft.timeLimitMinutes) as number | undefined;
  return minutes === undefined || (Number.isInteger(minutes) && minutes > 0)
    ? null
    : TIME_LIMIT_ERROR;
}

// Why the draft can't be saved as it is, or null if it can.
export function configError(draft: QuizConfigurationData): string | null {
  return (
    timeLimitError(draft) ??
    (normalize(draft.timeLimitMinutes) !== undefined && !draft.showIntroScreen
      ? INTRO_SCREEN_REQUIRED_ERROR
      : null)
  );
}
