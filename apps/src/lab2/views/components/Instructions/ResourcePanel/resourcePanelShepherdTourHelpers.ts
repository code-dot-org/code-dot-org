import lab2I18n from '@cdo/apps/lab2/locale';

import {
  resourcePanelInstructionsElementId,
  resourcePanelLinksElementId,
  resourcePanelNavigationButtonElementId,
  resourcePanelTabsElementId,
} from './constants';

export interface ResourcePanelShepherdStep {
  id: string;
  title: string;
  text: string;
  selector: string;
  placement:
    | 'top'
    | 'top-start'
    | 'top-end'
    | 'bottom'
    | 'bottom-start'
    | 'bottom-end'
    | 'left'
    | 'left-start'
    | 'left-end'
    | 'right'
    | 'right-start'
    | 'right-end';
  fallbackToCenter?: boolean;
}

export const REQUIRED_RESOURCE_PANEL_SELECTORS = [
  `#${resourcePanelInstructionsElementId}`,
  `#${resourcePanelTabsElementId}`,
  `#${resourcePanelLinksElementId}`,
];

export const RESOURCE_PANEL_SHEPHERD_STEPS: ResourcePanelShepherdStep[] = [
  {
    id: 'resource-panel-tour-panel',
    title: lab2I18n.resourcePanelOnboarding_title(),
    text: lab2I18n.resourcePanelOnboarding_text(),
    selector: `#${resourcePanelInstructionsElementId}`,
    placement: 'right',
  },
  {
    id: 'resource-panel-tour-tabs',
    title: lab2I18n.resourcePanelOnboarding_tabsTitle(),
    text: lab2I18n.resourcePanelOnboarding_tabsText(),
    selector: `#${resourcePanelTabsElementId}`,
    placement: 'right',
  },
  {
    id: 'resource-panel-tour-links',
    title: lab2I18n.resourcePanelOnboarding_linksTitle(),
    text: lab2I18n.resourcePanelOnboarding_linksText(),
    selector: `#${resourcePanelLinksElementId}`,
    placement: 'right',
  },
  {
    id: 'resource-panel-tour-navigation',
    title: lab2I18n.resourcePanelOnboarding_finishTitle(),
    text: lab2I18n.resourcePanelOnboarding_finishText(),
    selector: `#${resourcePanelNavigationButtonElementId}`,
    placement: 'right',
    fallbackToCenter: true,
  },
];
