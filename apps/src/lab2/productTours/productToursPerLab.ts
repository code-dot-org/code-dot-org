import {StepOptions, Tour} from 'shepherd.js';

import {createSketchlabTourSteps} from '@cdo/apps/lab2/productTours/sketchlabTourSteps';

import {AppName, LevelProperties} from '../types';

import {createOnboardingTourSteps} from './onboardingTourSteps';
import {createValidationTourSteps} from './validationTourSteps';

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
  // Description shown to level editors. Not necessary if triggeredByLevel is false, because the
  // tour will not be shown on the level edit page.
  description?: string;
  getSteps: (tour: Tour) => StepOptions[];
  // Optional function for more specific checks on whether the tour should be shown for a given level.
  // If not provided, we will show by default.
  shouldShowOnLevel?: (levelProperties: LevelProperties) => boolean;
}

const ProductTourConfigurations: Record<ProductTour, ProductTourConfig> = {
  [ProductTour.ResourcePanelOnboarding]: {
    name: ProductTour.ResourcePanelOnboarding,
    displayName: 'Using the Resource Panel',
    triggeredByLevel: true,
    description:
      'Gives users an overview of the different components of the resource panel, including the tabs, extra links and continue button.',
    getSteps: createOnboardingTourSteps,
  },
  [ProductTour.ResourcePanelValidation]: {
    name: ProductTour.ResourcePanelValidation,
    displayName: 'Validating Your Work',
    triggeredByLevel: true,
    description:
      'Guides users through opening the validation tab and running validation on their code. This tour will only show up if there is validation on the level.',
    getSteps: createValidationTourSteps,
    shouldShowOnLevel: levelProperties => !!levelProperties.validations,
  },
  [ProductTour.SketchlabIntro]: {
    name: ProductTour.SketchlabIntro,
    displayName: 'Intro to Sketch Lab',
    triggeredByLevel: false,
    getSteps: createSketchlabTourSteps,
  },
};

// Returns true if the given tour should be shown for the given level and lab.
// Tours with triggeredByLevel=true require the tour to be available on the lab
// and present in the level's productTours field if checkProductToursPerLevel is true.
// (We allow overriding the productToursPerLevel for cases such as user-initiated tours).
// Tours with triggeredByLevel=false are shown whenever the user first reaches a lab that has the tour available.
export function isTourEnabledOnLevel(
  tour: ProductTour,
  levelProperties: LevelProperties,
  checkProductToursPerLevel: boolean
): boolean {
  const isAvailableForLab = ToursPerLab[
    levelProperties.appName as AppName
  ]?.some(config => config.name === tour);
  if (!isAvailableForLab) {
    return false;
  }
  const config = ProductTourConfigurations[tour];
  if (config.shouldShowOnLevel && !config.shouldShowOnLevel(levelProperties)) {
    return false;
  }
  if (!config.triggeredByLevel || !checkProductToursPerLevel) {
    return true;
  }
  return levelProperties.productTours?.includes(tour) ?? false;
}

// These tour configurations are used to determine which tours should be shown in the level editor for a given lab.
// The tour implementation itself is responsible for using isTourEnabledOnLevel to correctly show the tour.

// List of tours available for each lab.
export const ToursPerLab: Partial<Record<AppName, ProductTourConfig[]>> = {
  pythonlab: [
    ProductTourConfigurations[ProductTour.ResourcePanelOnboarding],
    ProductTourConfigurations[ProductTour.ResourcePanelValidation],
  ],
  sketchlab: [ProductTourConfigurations[ProductTour.SketchlabIntro]],
  weblab2: [ProductTourConfigurations[ProductTour.ResourcePanelOnboarding]],
};
