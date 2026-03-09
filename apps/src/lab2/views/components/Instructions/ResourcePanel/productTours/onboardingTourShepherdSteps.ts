import {type StepOptions, type Tour} from 'shepherd.js';

import lab2I18n from '@cdo/apps/lab2/locale';
import {
  resourcePanelInstructionsElementId,
  resourcePanelTabsElementId,
  resourcePanelLinksElementId,
  resourcePanelNavigationButtonElementId,
} from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/constants';
import {
  nextButton,
  backButton,
  doneButton,
} from '@cdo/apps/sharedComponents/productTour/productTourHelpers';

export const createOnboardingTourSteps = (tour: Tour): StepOptions[] => [
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
