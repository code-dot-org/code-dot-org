import {AppName} from '../types';

export enum ProductTour {
  ResourcePanelOnboarding = 'resource_panel_onboarding',
  ResourcePanelValidation = 'resource_panel_validation',
  SketchlabIntro = 'sketchlab_intro',
}

export interface ProductTourConfig {
  name: ProductTour;
  displayName: string;
  // If the tour is enabled based on a level setting or not. If true, the tour will only be triggered
  // when the user first reaches a level with the tour enabled. If false, the tour will be triggered the first time
  // the user reaches a lab that has that tour available.
  triggeredByLevel: boolean;
}

const ProductTourConfigurations: Record<ProductTour, ProductTourConfig> = {
  [ProductTour.ResourcePanelOnboarding]: {
    name: ProductTour.ResourcePanelOnboarding,
    displayName: 'Resource panel onboarding',
    triggeredByLevel: true,
  },
  [ProductTour.ResourcePanelValidation]: {
    name: ProductTour.ResourcePanelValidation,
    displayName: 'Resource panel validation',
    triggeredByLevel: true,
  },
  [ProductTour.SketchlabIntro]: {
    name: ProductTour.SketchlabIntro,
    displayName: 'Sketchlab intro',
    triggeredByLevel: false,
  },
};

// These tour configurations are used to determine which tours should be shown in the level editor for a given lab.
// The tour implementation itself is responsible for correctly using the configuration to determine if the tour
// is available on a given level.

// List of tours available for each lab.
export const ToursPerLab: Partial<Record<AppName, ProductTourConfig[]>> = {
  aichat: [ProductTourConfigurations[ProductTour.ResourcePanelOnboarding]],
  dance: [ProductTourConfigurations[ProductTour.ResourcePanelOnboarding]],
  music: [ProductTourConfigurations[ProductTour.ResourcePanelOnboarding]],
  pythonlab: [
    ProductTourConfigurations[ProductTour.ResourcePanelOnboarding],
    ProductTourConfigurations[ProductTour.ResourcePanelValidation],
  ],
  sketchlab: [
    ProductTourConfigurations[ProductTour.ResourcePanelOnboarding],
    ProductTourConfigurations[ProductTour.SketchlabIntro],
  ],
  weblab2: [ProductTourConfigurations[ProductTour.ResourcePanelOnboarding]],
};
