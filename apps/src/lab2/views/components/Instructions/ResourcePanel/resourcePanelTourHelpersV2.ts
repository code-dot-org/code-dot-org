import {type StepOptions, type StepOptionsButton, type Tour} from 'shepherd.js';

import lab2I18n from '@cdo/apps/lab2/locale';

import {
  resourcePanelInstructionsElementId,
  resourcePanelTabsElementId,
  resourcePanelLinksElementId,
  resourcePanelNavigationButtonElementId,
} from './constants';

const nextButton = (tour: Tour): StepOptionsButton => ({
  text: 'Next',
  action: () => tour.next(),
  classes: 'shepherd-button-primary',
});

const doneButton = (tour: Tour): StepOptionsButton => ({
  text: 'Done',
  action: () => tour.complete(),
  classes: 'shepherd-button-primary',
});

const backButton = (tour: Tour): StepOptionsButton => ({
  text: 'Back',
  action: () => tour.back(),
  classes: 'shepherd-button-secondary',
});

export const createResourcePanelTourSteps = (tour: Tour): StepOptions[] => [
  {
    id: 'instructions',
    attachTo: {
      element: `#${resourcePanelInstructionsElementId}`,
      on: 'right',
    },
    title: lab2I18n.resourcePanelOnboarding_title(),
    text: lab2I18n.resourcePanelOnboarding_text(),
    buttons: [nextButton(tour)],
    scrollTo: false,
  },
  {
    id: 'tabs',
    attachTo: {element: `#${resourcePanelTabsElementId}`, on: 'right'},
    title: lab2I18n.resourcePanelOnboarding_tabsTitle(),
    text: lab2I18n.resourcePanelOnboarding_tabsText(),
    buttons: [backButton(tour), nextButton(tour)],
    scrollTo: false,
  },
  {
    id: 'links',
    attachTo: {element: `#${resourcePanelLinksElementId}`, on: 'right'},
    title: lab2I18n.resourcePanelOnboarding_linksTitle(),
    text: lab2I18n.resourcePanelOnboarding_linksText(),
    buttons: [backButton(tour), nextButton(tour)],
    scrollTo: false,
  },
  {
    id: 'navigation',
    attachTo: {
      element: `#${resourcePanelNavigationButtonElementId}`,
      on: 'top',
    },
    title: lab2I18n.resourcePanelOnboarding_finishTitle(),
    text: lab2I18n.resourcePanelOnboarding_finishText(),
    buttons: [backButton(tour), doneButton(tour)],
    scrollTo: false,
  },
];
