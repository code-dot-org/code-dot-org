import lab2I18n from '@cdo/apps/lab2/locale';

import {
  resourcePanelInstructionsElementId,
  resourcePanelTabsElementId,
  resourcePanelLinksElementId,
  resourcePanelNavigationButtonElementId,
} from './constants';
export const INITIAL_STEP = 0;
export const STEPS = [
  {
    element: `#${resourcePanelInstructionsElementId}`,
    title: lab2I18n.resourcePanelOnboarding_title(),
    intro: lab2I18n.resourcePanelOnboarding_text(),
  },
  {
    element: `#${resourcePanelTabsElementId}`,
    title: lab2I18n.resourcePanelOnboarding_tabsTitle(),
    intro: lab2I18n.resourcePanelOnboarding_tabsText(),
    position: 'right',
  },
  {
    element: `#${resourcePanelLinksElementId}`,
    title: lab2I18n.resourcePanelOnboarding_linksTitle(),
    intro: lab2I18n.resourcePanelOnboarding_linksText(),
  },
  {
    element: `#${resourcePanelNavigationButtonElementId}`,
    title: lab2I18n.resourcePanelOnboarding_finishTitle(),
    intro: lab2I18n.resourcePanelOnboarding_finishText(),
  },
];
