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
const checkpoint = (skillIds?: string[], icon?: string) =>
  ({
    id: 'c',
    title: 'C',
    description: 'C.',
    steps: [],
    skillIds,
    icon,
  } as never);

describe('checkpointIcon', () => {
  it("is the first skill's icon, skipping skills without one", () => {
    expect(checkpointIcon(pathway, checkpoint(['build']))).toBe(
      'wand-magic-sparkles'
    );
    expect(checkpointIcon(pathway, checkpoint(['plain', 'build']))).toBe(
      'wand-magic-sparkles'
    );
  });

  it("is the checkpoint's own icon when no skill has one", () => {
    expect(checkpointIcon(pathway, checkpoint(['plain'], 'location-dot'))).toBe(
      'location-dot'
    );
    expect(checkpointIcon(pathway, checkpoint(undefined, 'location-dot'))).toBe(
      'location-dot'
    );
    expect(checkpointIcon(pathway, checkpoint(['build'], 'location-dot'))).toBe(
      'wand-magic-sparkles'
    );
  });

  it('is absent without a skill icon or one of its own', () => {
    expect(checkpointIcon(pathway, checkpoint(['plain']))).toBeUndefined();
    expect(checkpointIcon(pathway, checkpoint())).toBeUndefined();
  });
});
