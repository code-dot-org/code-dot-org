import lab2I18n from '@cdo/apps/lab2/locale';

export const INITIAL_STEP = 0;
export const STEPS = [
  {
    element: '#resource-panel-instructions',
    title: lab2I18n.resourcePanelOnboarding_title(),
    intro: lab2I18n.resourcePanelOnboarding_text(),
  },
  {
    element: '#resource-panel-tabs',
    title: lab2I18n.resourcePanelOnboarding_tabsTitle(),
    intro: lab2I18n.resourcePanelOnboarding_tabsText(),
    position: 'right',
  },
  {
    element: '#resource-panel-links',
    title: lab2I18n.resourcePanelOnboarding_linksTitle(),
    intro: lab2I18n.resourcePanelOnboarding_linksText(),
  },
  {
    element: '#resource-panel-navigation-button',
    title: lab2I18n.resourcePanelOnboarding_finishTitle(),
    intro: lab2I18n.resourcePanelOnboarding_finishText(),
  },
];
