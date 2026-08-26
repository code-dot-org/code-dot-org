import {describe, expect, it} from 'vitest';

import {parseDslLevel} from '../dslLevel';

// Excerpt of dashboard/config/scripts/k5_ai_data_survey_level_q1.multi —
// a survey question where every choice is marked `right` (no `wrong` at
// all).
const SURVEY_MULTI = `name 'k5_ai_data_survey_level_q1'
question 'My favorite flavor of ice cream is...'


right 'Chocolate'
right 'Vanilla'
right 'Cookies and Cream'
allow_multiple_attempts true
markdown <<MARKDOWN

MARKDOWN`;

// Excerpt of dashboard/config/scripts/ai_and_algorithmic_decisions_lesson5_level8_2025.multi
// — a real quiz with wrong/right answers and no `question` line at all
// (the question lives in the markdown body).
const QUIZ_MULTI = `name 'ai-and-algorithmic-decisions-lesson5-level8_2025'
title 'Conditional Logic'

wrong 'Change the condition to X.'
wrong 'Change Y to Z.'
right 'Change the condition to <= 20.'
allow_multiple_attempts false

markdown <<MARKDOWN
**Scenario**: Battery Saver should turn ON at 20% or below.
MARKDOWN`;

// Excerpt of dashboard/config/scripts/k5_ai_matching_background_emoji.match
const MATCH_DSL = `name 'k5_ai_matching_background_emoji'
title 'Using the training data'
question 'Not colorful and not happy effects'
answer 'Answer one'
question 'A little color and very happy effects'
answer 'Answer two'

markdown <<MARKDOWN
Match the backgrounds with the emojis.
MARKDOWN

allow_multiple_attempts true`;

// Excerpt of dashboard/config/scripts/k5_ai_final_choice_level_make_a_poster.external
const EXTERNAL_DSL = `name 'k5_ai_final_choice_level_make_a_poster'
title 'Make a Poster'
display_name 'Make a Poster'
bubble_choice_description 'Share your thoughts on AI.'

markdown <<MARKDOWN
#Make a Poster
It's time to plan your poster!
MARKDOWN`;

// Excerpt of dashboard/config/scripts/k5_ai_final_choice_level.bubble_choice
const BUBBLE_CHOICE_DSL = `name 'k5_ai_final_choice_level'
display_name 'End of Module Project'
description 'Choose a project to work on.'

sublevels
level 'k5_ai_final_choice_level_letter_to_principal'
level 'k5_ai_final_choice_level_make_a_poster'
level 'k5_ai_final_choice_level_sprite_lab'`;

// Excerpt of dashboard/config/scripts/k5_ai_data_survey_level.level_group
// (single page).
const LEVEL_GROUP_SINGLE_PAGE = `name 'k5_ai_data_survey_level'
title 'Let\\'s collect some data!'
submittable 'true'

page
level 'k5_ai_data_survey_level_q1'
level 'k5_ai_data_survey_level_q2'`;

// Excerpt of dashboard/config/scripts/
// ai_and_algorithmic_decisions_preassessment_2026.level_group (multi-page,
// with a `text` reference alongside `level` references).
const LEVEL_GROUP_MULTI_PAGE = `name 'ai-and-algorithmic-decisions-preassessment_2026'
title 'AI and Algorithmic Decisions Pre-Assessment'

page
text 'ai-and-algorithmic-decisions-preassessment-intro_2026'
level 'ai-and-algorithmic-decisions-preassessment-q1_2026'
level 'ai-and-algorithmic-decisions-preassessment-q2_2026'

page
level 'ai-and-algorithmic-decisions-preassessment-q6_2026'`;

describe('parseDslLevel', () => {
  it('parses a survey .multi with only `right` answers', () => {
    const parsed = parseDslLevel(SURVEY_MULTI, 'multi');
    if (parsed.kind !== 'multi') throw new Error('expected multi');
    expect(parsed.question).toBe('My favorite flavor of ice cream is...');
    expect(parsed.answers).toEqual([
      {text: 'Chocolate', correct: true},
      {text: 'Vanilla', correct: true},
      {text: 'Cookies and Cream', correct: true},
    ]);
    expect(parsed.allowMultipleAttempts).toBe(true);
    // Empty heredoc body normalizes to undefined.
    expect(parsed.markdown).toBeUndefined();
  });

  it('parses a .multi with wrong/right answers, in file order, and no question line', () => {
    const parsed = parseDslLevel(QUIZ_MULTI, 'multi');
    if (parsed.kind !== 'multi') throw new Error('expected multi');
    expect(parsed.question).toBe('');
    expect(parsed.displayName).toBe('Conditional Logic');
    expect(parsed.answers).toEqual([
      {text: 'Change the condition to X.', correct: false},
      {text: 'Change Y to Z.', correct: false},
      {text: 'Change the condition to <= 20.', correct: true},
    ]);
    expect(parsed.allowMultipleAttempts).toBe(false);
    expect(parsed.markdown).toContain('Battery Saver');
  });

  it('parses a .match into question/answer pairs', () => {
    const parsed = parseDslLevel(MATCH_DSL, 'match');
    if (parsed.kind !== 'match') throw new Error('expected match');
    expect(parsed.displayName).toBe('Using the training data');
    expect(parsed.pairs).toEqual([
      {question: 'Not colorful and not happy effects', answer: 'Answer one'},
      {question: 'A little color and very happy effects', answer: 'Answer two'},
    ]);
  });

  it('parses an .external into markdown with display_name preferred over title', () => {
    const parsed = parseDslLevel(EXTERNAL_DSL, 'external');
    if (parsed.kind !== 'external') throw new Error('expected external');
    expect(parsed.displayName).toBe('Make a Poster');
    expect(parsed.markdown).toContain("It's time to plan your poster!");
  });

  it('parses a .bubble_choice into an ordered level key list', () => {
    const parsed = parseDslLevel(BUBBLE_CHOICE_DSL, 'bubble_choice');
    if (parsed.kind !== 'bubbleChoice')
      throw new Error('expected bubbleChoice');
    expect(parsed.displayName).toBe('End of Module Project');
    expect(parsed.levelKeys).toEqual([
      'k5_ai_final_choice_level_letter_to_principal',
      'k5_ai_final_choice_level_make_a_poster',
      'k5_ai_final_choice_level_sprite_lab',
    ]);
  });

  it('parses a single-page .level_group and unescapes a Ruby-quoted apostrophe', () => {
    const parsed = parseDslLevel(LEVEL_GROUP_SINGLE_PAGE, 'level_group');
    if (parsed.kind !== 'levelGroup') throw new Error('expected levelGroup');
    expect(parsed.displayName).toBe("Let's collect some data!");
    expect(parsed.pages).toEqual([
      ['k5_ai_data_survey_level_q1', 'k5_ai_data_survey_level_q2'],
    ]);
  });

  it('parses a multi-page .level_group, treating `text` lines as level references', () => {
    const parsed = parseDslLevel(LEVEL_GROUP_MULTI_PAGE, 'level_group');
    if (parsed.kind !== 'levelGroup') throw new Error('expected levelGroup');
    expect(parsed.pages).toEqual([
      [
        'ai-and-algorithmic-decisions-preassessment-intro_2026',
        'ai-and-algorithmic-decisions-preassessment-q1_2026',
        'ai-and-algorithmic-decisions-preassessment-q2_2026',
      ],
      ['ai-and-algorithmic-decisions-preassessment-q6_2026'],
    ]);
  });

  it('treats an unrecognized DSL extension (.text_match) as opaque', () => {
    const parsed = parseDslLevel(
      "name 'x'\ntitle 'Some Text Match'",
      'text_match',
    );
    expect(parsed).toEqual({
      kind: 'opaque',
      levelType: 'TextMatch',
      displayName: 'Some Text Match',
    });
  });
});
