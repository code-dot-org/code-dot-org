import {filterFishComponents} from '../../../src/demo/helpers';
import {AppMode} from '../../../src/demo/constants';

describe('filterFishComponents', () => {
  const fishComponents = {
    bodies: {
      body1: {src: 'images/body1.png', exclusions: []},
      body2: {src: 'images/body2.png'},
      body3: {
        src: 'images/body3.png',
        exclusions: [AppMode.FishShort, 'other-exclusion']
      }
    },
    eyes: {
      eye1: {src: 'images/eye1.png'},
      eye2: {src: 'images/eye2.png', exclusions: [AppMode.FishShort]}
    }
  };

  it('returns all components if no appMode is defined', () => {
    expect(filterFishComponents(fishComponents, null)).toEqual(fishComponents);
    expect(filterFishComponents(fishComponents, undefined)).toEqual(
      fishComponents
    );
  });

  it('filters components that should be excluded in the given appMode', () => {
    const filteredComponents = filterFishComponents(
      fishComponents,
      AppMode.FishShort
    );

    expect(Object.keys(filteredComponents)).toEqual(
      Object.keys(fishComponents)
    );
    expect(filteredComponents.bodies).toEqual([
      fishComponents.bodies.body1,
      fishComponents.bodies.body2
    ]);
    expect(filteredComponents.eyes).toEqual([fishComponents.eyes.eye1]);
  });
});
