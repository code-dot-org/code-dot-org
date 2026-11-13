import {
  CHALLENGE_MODALITIES,
  ChallengeEditData,
  ChallengeModality,
} from './types';

// Mirrors ChallengesController::EDITABLE_FIELDS.
export const EDITABLE_FIELDS = [
  'question',
  'default_modality',
  'rubric',
  'whiteboard_starter_image_alt_text',
];

export const MAX_STARTER_IMAGE_BYTES = 2 * 1024 * 1024;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isNonBlankString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim() !== '';

// Immediate feedback only; ChallengesController and Challenge validate again.
export function validateChallengeJson(
  text: string,
  {
    hasImage,
    removingImage = false,
  }: {hasImage: boolean; removingImage?: boolean}
): string[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    return [`Not valid JSON: ${(e as Error).message}`];
  }
  if (!isObject(parsed)) {
    return ['Must be a JSON object.'];
  }

  const errors: string[] = [];
  const unknown = Object.keys(parsed).filter(k => !EDITABLE_FIELDS.includes(k));
  if (unknown.length > 0) {
    errors.push(
      `Unknown fields: ${unknown.join(', ')}. Allowed: ${EDITABLE_FIELDS.join(
        ', '
      )}.`
    );
  }

  const {question, default_modality, rubric} = parsed;
  const altText = parsed.whiteboard_starter_image_alt_text;

  if (!isNonBlankString(question)) {
    errors.push('"question" must be a non-empty string.');
  }
  if (!CHALLENGE_MODALITIES.includes(default_modality as ChallengeModality)) {
    errors.push(
      `"default_modality" must be one of: ${CHALLENGE_MODALITIES.join(', ')}.`
    );
  }

  if (!Array.isArray(rubric) || rubric.length === 0) {
    errors.push('"rubric" must be a non-empty list of levels.');
  } else {
    rubric.forEach((entry, i) => {
      if (!isObject(entry) || !Number.isInteger(entry.level)) {
        errors.push(`rubric[${i}].level must be an integer.`);
      }
      if (!isObject(entry) || !isNonBlankString(entry.description)) {
        errors.push(`rubric[${i}].description must be a non-empty string.`);
      }
    });
    const levels = rubric.map(entry => (isObject(entry) ? entry.level : null));
    if (new Set(levels).size !== levels.length) {
      errors.push('rubric levels must be unique.');
    }
  }

  if (
    altText !== undefined &&
    altText !== null &&
    typeof altText !== 'string'
  ) {
    errors.push('"whiteboard_starter_image_alt_text" must be a string.');
  }
  if (hasImage) {
    if (!isNonBlankString(altText)) {
      errors.push(
        '"whiteboard_starter_image_alt_text" is required with a starter image.'
      );
    }
    if (default_modality === 'video') {
      errors.push(
        'A starter image requires a "whiteboard" or "both" default_modality.'
      );
    }
  } else if (!removingImage && isNonBlankString(altText)) {
    // The server clears the alt text along with a removed image.
    errors.push(
      '"whiteboard_starter_image_alt_text" requires a starter image. Attach one or remove the field.'
    );
  }

  return errors;
}

// The editable JSON for an existing challenge, without server-assigned keys.
export function editableJson(challenge: ChallengeEditData): string {
  const input: Record<string, unknown> = {
    question: challenge.question,
    default_modality: challenge.defaultModality,
    rubric: challenge.rubric,
  };
  if (challenge.whiteboardStarterImageAltText) {
    input.whiteboard_starter_image_alt_text =
      challenge.whiteboardStarterImageAltText;
  }
  return JSON.stringify(input, null, 2);
}
