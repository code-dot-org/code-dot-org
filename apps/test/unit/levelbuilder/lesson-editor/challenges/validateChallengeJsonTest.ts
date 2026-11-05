import {
  editableJson,
  validateChallengeJson,
} from '@cdo/apps/levelbuilder/lesson-editor/challenges/validateChallengeJson';

const valid = {
  question: 'Draw a cat.',
  default_modality: 'whiteboard',
  rubric: [
    {level: 0, description: 'No cat'},
    {level: 1, description: 'A cat'},
  ],
};

const check = (input: unknown, hasImage = false) =>
  validateChallengeJson(JSON.stringify(input), {hasImage});

describe('validateChallengeJson', () => {
  it('accepts a valid challenge', () => {
    expect(check(valid)).toEqual([]);
  });

  it('accepts a starter image with alt text on a whiteboard challenge', () => {
    expect(
      check({...valid, whiteboard_starter_image_alt_text: 'an empty box'}, true)
    ).toEqual([]);
  });

  it('reports invalid JSON', () => {
    expect(validateChallengeJson('{nope', {hasImage: false})[0]).toMatch(
      /Not valid JSON/
    );
  });

  it('rejects non-objects', () => {
    expect(check([valid])).toEqual(['Must be a JSON object.']);
  });

  it('rejects unknown fields, including keys', () => {
    expect(check({...valid, key: 'x'})[0]).toMatch(/Unknown fields: key/);
  });

  it('requires a question and a known modality', () => {
    const errors = check({
      ...valid,
      question: ' ',
      default_modality: 'mime',
    });
    expect(errors).toEqual([
      '"question" must be a non-empty string.',
      '"default_modality" must be one of: whiteboard, video, both.',
    ]);
  });

  it.each([
    [[], '"rubric" must be a non-empty list of levels.'],
    [
      [{level: 'zero', description: 'a'}],
      'rubric[0].level must be an integer.',
    ],
    [
      [{level: 0, description: ''}],
      'rubric[0].description must be a non-empty string.',
    ],
    [
      [
        {level: 0, description: 'a'},
        {level: 0, description: 'b'},
      ],
      'rubric levels must be unique.',
    ],
  ])('rejects rubric %j', (rubric, message) => {
    expect(check({...valid, rubric})).toContain(message);
  });

  it('requires alt text with a starter image', () => {
    expect(check(valid, true)).toEqual([
      '"whiteboard_starter_image_alt_text" is required with a starter image.',
    ]);
  });

  it('rejects a starter image on a video challenge', () => {
    const errors = check(
      {
        ...valid,
        default_modality: 'video',
        whiteboard_starter_image_alt_text: 'a box',
      },
      true
    );
    expect(errors).toEqual([
      'A starter image requires a "whiteboard" or "both" default_modality.',
    ]);
  });
});

describe('editableJson', () => {
  it('omits server-assigned fields and empty alt text', () => {
    const json = JSON.parse(
      editableJson({
        id: 1,
        key: 'challenge-1',
        question: 'Draw a cat.',
        defaultModality: 'whiteboard',
        rubric: valid.rubric,
        whiteboardStarterImageAltText: null,
        whiteboardStarterImageUrl: null,
      })
    );
    expect(json).toEqual(valid);
  });
});
