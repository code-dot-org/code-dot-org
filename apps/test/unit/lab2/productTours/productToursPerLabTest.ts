import {
  isTourEnabledOnLevel,
  ProductTour,
} from '@cdo/apps/lab2/productTours/productToursPerLab';

describe('isTourEnabledOnLevel', () => {
  describe('when the tour is not available for the lab', () => {
    it('returns false for a tour not in the lab list', () => {
      expect(
        isTourEnabledOnLevel(ProductTour.SketchlabIntro, 'pythonlab', undefined)
      ).toBe(false);
    });

    it('returns false for an unknown lab', () => {
      expect(
        isTourEnabledOnLevel(
          ProductTour.ResourcePanelOnboarding,
          'unknownlab',
          undefined
        )
      ).toBe(false);
    });
  });

  describe('when the tour has triggeredByLevel=false', () => {
    it('returns true when the tour is available for the lab, regardless of productTours', () => {
      expect(
        isTourEnabledOnLevel(ProductTour.SketchlabIntro, 'sketchlab', undefined)
      ).toBe(true);
    });

    it('returns true even when productTours is an empty array', () => {
      expect(
        isTourEnabledOnLevel(ProductTour.SketchlabIntro, 'sketchlab', [])
      ).toBe(true);
    });

    it('returns true even when productTours does not include the tour', () => {
      expect(
        isTourEnabledOnLevel(ProductTour.SketchlabIntro, 'sketchlab', [
          'some_other_tour',
        ])
      ).toBe(true);
    });
  });

  describe('when the tour has triggeredByLevel=true', () => {
    it('returns false when productTours is undefined', () => {
      expect(
        isTourEnabledOnLevel(
          ProductTour.ResourcePanelOnboarding,
          'pythonlab',
          undefined
        )
      ).toBe(false);
    });

    it('returns false when productTours is an empty array', () => {
      expect(
        isTourEnabledOnLevel(
          ProductTour.ResourcePanelOnboarding,
          'pythonlab',
          []
        )
      ).toBe(false);
    });

    it('returns false when productTours does not include the tour', () => {
      expect(
        isTourEnabledOnLevel(ProductTour.ResourcePanelOnboarding, 'pythonlab', [
          ProductTour.ResourcePanelValidation,
        ])
      ).toBe(false);
    });

    it('returns true when productTours includes the tour', () => {
      expect(
        isTourEnabledOnLevel(ProductTour.ResourcePanelOnboarding, 'pythonlab', [
          ProductTour.ResourcePanelOnboarding,
        ])
      ).toBe(true);
    });

    it('returns true when productTours includes the tour among others', () => {
      expect(
        isTourEnabledOnLevel(ProductTour.ResourcePanelOnboarding, 'pythonlab', [
          ProductTour.ResourcePanelValidation,
          ProductTour.ResourcePanelOnboarding,
        ])
      ).toBe(true);
    });
  });
});
