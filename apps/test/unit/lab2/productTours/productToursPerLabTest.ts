import {
  isTourEnabledOnLevel,
  ProductTour,
} from '@cdo/apps/lab2/productTours/productToursPerLab';
import {LevelProperties} from '@cdo/apps/lab2/types';

const makeLevelProperties = (
  appName: string,
  overrides: Partial<LevelProperties> = {}
): LevelProperties =>
  ({appName, id: 0, name: 'test', ...overrides} as LevelProperties);

describe('isTourEnabledOnLevel', () => {
  describe('when the tour is not available for the lab', () => {
    it('returns false for a tour not in the lab list', () => {
      expect(
        isTourEnabledOnLevel(
          ProductTour.SketchlabIntro,
          makeLevelProperties('pythonlab')
        )
      ).toBe(false);
    });

    it('returns false for an unknown lab', () => {
      expect(
        isTourEnabledOnLevel(
          ProductTour.ResourcePanelOnboarding,
          makeLevelProperties('unknownlab')
        )
      ).toBe(false);
    });
  });

  describe('when the tour has triggeredByLevel=false', () => {
    it('returns true when the tour is available for the lab, regardless of productTours', () => {
      expect(
        isTourEnabledOnLevel(
          ProductTour.SketchlabIntro,
          makeLevelProperties('sketchlab')
        )
      ).toBe(true);
    });

    it('returns true even when productTours is an empty array', () => {
      expect(
        isTourEnabledOnLevel(
          ProductTour.SketchlabIntro,
          makeLevelProperties('sketchlab', {productTours: []})
        )
      ).toBe(true);
    });

    it('returns true even when productTours does not include the tour', () => {
      expect(
        isTourEnabledOnLevel(
          ProductTour.SketchlabIntro,
          makeLevelProperties('sketchlab', {productTours: ['some_other_tour']})
        )
      ).toBe(true);
    });
  });

  describe('when the tour has triggeredByLevel=true', () => {
    it('returns false when productTours is undefined', () => {
      expect(
        isTourEnabledOnLevel(
          ProductTour.ResourcePanelOnboarding,
          makeLevelProperties('pythonlab')
        )
      ).toBe(false);
    });

    it('returns false when productTours is an empty array', () => {
      expect(
        isTourEnabledOnLevel(
          ProductTour.ResourcePanelOnboarding,
          makeLevelProperties('pythonlab', {productTours: []})
        )
      ).toBe(false);
    });

    it('returns false when productTours does not include the tour', () => {
      expect(
        isTourEnabledOnLevel(
          ProductTour.ResourcePanelOnboarding,
          makeLevelProperties('pythonlab', {
            productTours: [ProductTour.ResourcePanelValidation],
          })
        )
      ).toBe(false);
    });

    it('returns true when productTours includes the tour', () => {
      expect(
        isTourEnabledOnLevel(
          ProductTour.ResourcePanelOnboarding,
          makeLevelProperties('pythonlab', {
            productTours: [ProductTour.ResourcePanelOnboarding],
          })
        )
      ).toBe(true);
    });

    it('returns true when productTours includes the tour among others', () => {
      expect(
        isTourEnabledOnLevel(
          ProductTour.ResourcePanelOnboarding,
          makeLevelProperties('pythonlab', {
            productTours: [
              ProductTour.ResourcePanelValidation,
              ProductTour.ResourcePanelOnboarding,
            ],
          })
        )
      ).toBe(true);
    });
  });

  describe('when the tour has a shouldShowOnLevel check', () => {
    it('returns false for ResourcePanelValidation when levelProperties has no validations', () => {
      expect(
        isTourEnabledOnLevel(
          ProductTour.ResourcePanelValidation,
          makeLevelProperties('pythonlab', {
            productTours: [ProductTour.ResourcePanelValidation],
          })
        )
      ).toBe(false);
    });

    it('returns true for ResourcePanelValidation when levelProperties has validations', () => {
      expect(
        isTourEnabledOnLevel(
          ProductTour.ResourcePanelValidation,
          makeLevelProperties('pythonlab', {
            validations: [{}] as LevelProperties['validations'],
            productTours: [ProductTour.ResourcePanelValidation],
          })
        )
      ).toBe(true);
    });
  });
});
