import {
  POSE_MARK,
  sentPromptsFor,
} from '@cdo/apps/p5lab/spritelab/lab2/views/explore/sentPrompts';

const OPTIONS = {imageType: 'sprite', style: 'pixel', pixelGrid: 64} as const;

describe('sentPrompts', () => {
  it('one picture gets the full prompt and no poses', () => {
    const sent = sentPromptsFor('A key', OPTIONS, 'pixel', false);
    expect(sent.picture).toMatch(/^A key\. /);
    expect(sent.poses).toBeUndefined();
  });

  it('a set gets its base words, the shared pose words with the mark, and a frame per pose', () => {
    const sent = sentPromptsFor('A cat', OPTIONS, 'pixel', true, 'quadruped');
    expect(sent.picture).toMatch(/^A cat\. /);
    expect(sent.poses?.common).toContain(POSE_MARK);
    expect(sent.poses?.frames.map(f => f.label)).toEqual([
      'idling',
      'walking',
      'jumping',
      'landing',
    ]);
  });
});
