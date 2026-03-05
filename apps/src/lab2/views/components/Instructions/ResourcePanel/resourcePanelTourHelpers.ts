import {type StepOptions, type StepOptionsButton, type Tour} from 'shepherd.js';

import lab2I18n from '@cdo/apps/lab2/locale';
import {commonI18n} from '@cdo/apps/types/locale';

import {
  resourcePanelInstructionsElementId,
  resourcePanelTabsElementId,
  resourcePanelLinksElementId,
  resourcePanelNavigationButtonElementId,
} from './constants';

const nextButton = (tour: Tour): StepOptionsButton => ({
  text: commonI18n.next(),
  action: () => tour.next(),
});

const doneButton = (tour: Tour): StepOptionsButton => ({
  text: commonI18n.done(),
  action: () => tour.next(),
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
    buttons: [nextButton(tour)],
    scrollTo: false,
  },
  {
    id: 'links',
    attachTo: {element: `#${resourcePanelLinksElementId}`, on: 'right'},
    title: lab2I18n.resourcePanelOnboarding_linksTitle(),
    text: lab2I18n.resourcePanelOnboarding_linksText(),
    buttons: [nextButton(tour)],
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
    buttons: [doneButton(tour)],
    scrollTo: false,
  },
];
