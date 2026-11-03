import {Pathway} from '@cdo/apps/adaptive/types';
import {checkpointIcon} from '@cdo/apps/adaptive/views/map/checkpointIcon';

const pathway = {
  skills: {
    build: {
      id: 'build',
      title: 'Build',
      description: 'B.',
      icon: 'wand-magic-sparkles',
    },
    plain: {id: 'plain', title: 'Plain', description: 'P.'},
  },
} as unknown as Pathway;
const checkpoint = (skillIds?: string[]) =>
  ({id: 'c', title: 'C', description: 'C.', steps: [], skillIds} as never);

describe('checkpointIcon', () => {
  it("is the first skill's icon, skipping skills without one", () => {
    expect(checkpointIcon(pathway, checkpoint(['build']))).toBe(
      'wand-magic-sparkles'
    );
    expect(checkpointIcon(pathway, checkpoint(['plain', 'build']))).toBe(
      'wand-magic-sparkles'
    );
  });

  it('is absent without a skill icon', () => {
    expect(checkpointIcon(pathway, checkpoint(['plain']))).toBeUndefined();
    expect(checkpointIcon(pathway, checkpoint())).toBeUndefined();
  });
});
