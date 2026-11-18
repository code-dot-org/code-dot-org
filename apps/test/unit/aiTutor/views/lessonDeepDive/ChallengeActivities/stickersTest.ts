import {STICKER_SECTIONS} from '@cdo/apps/aiTutor/views/lessonDeepDive/ChallengeActivities/stickers';

describe('STICKER_SECTIONS', () => {
  it('lists every sticker under its section', () => {
    expect(STICKER_SECTIONS.map(section => section.title)).toEqual([
      'Reactions',
      'Celebrate',
      'Tech',
      'Point it out',
      'Just for fun',
    ]);
    expect(STICKER_SECTIONS.flatMap(section => section.stickers)).toHaveLength(
      51
    );
  });
});
