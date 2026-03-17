import {AppName} from '../types';

export enum ProductTour {
  ResourcePanelOnboarding = 'resource_panel_onboarding',
  ResourcePanelValidation = 'resource_panel_validation',
  SketchlabIntro = 'sketchlab_intro',
}

interface ProductTourConfig {
  name: ProductTour;
  // If the tour is enabled based on a level setting or not. If true, the tour will only be triggered
  // when the user first reaches a level with the tour enabled. If false, the tour will be triggered the first time
  // the user reaches a lab that has that tour available.
  triggeredByLevel: boolean;
}

// List of tours available for each lab, not including tours that are
// available for all lab2 labs (see UniversalLab2ProductTours below).
export const ToursPerLab: Partial<Record<AppName, ProductTourConfig[]>> = {
  pythonlab: [
    {name: ProductTour.ResourcePanelValidation, triggeredByLevel: true},
  ],
  sketchlab: [{name: ProductTour.SketchlabIntro, triggeredByLevel: false}],
};

// Tours available in all lab2 labs.
export const UniversalLab2ProductTours: ProductTourConfig[] = [
  {name: ProductTour.ResourcePanelOnboarding, triggeredByLevel: true},
];
