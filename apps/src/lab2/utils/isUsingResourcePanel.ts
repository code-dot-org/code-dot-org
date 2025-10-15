import experiments from '@cdo/apps/util/experiments';

const LABS_WITHOUT_INSTRUCTIONS = [
  'bubble_choice',
  'panels',
  'standalone_video',
];

const STANDALONE_PROJECTS_WITH_RESOURCE_PANEL = ['pythonlab', 'weblab2'];

const LABS_USING_RESOURCE_PANEL = [
  'dance',
  'music',
  'pythonlab',
  'sketchlab',
  'weblab2',
];

// TODO: Once all lab2 labs are using this version of instructions, this function may be better named
// "isUsingInstructions", as the resource panel will be the instructions panel. Some labs do not use
// instructions, such as Panels, we will need to keep this function to determine if the copyright/language
// footer should be shown or hidden.
export function isUsingResourcePanel(
  appName: string,
  isProjectLevel: boolean
): boolean {
  if (
    (isProjectLevel &&
      !STANDALONE_PROJECTS_WITH_RESOURCE_PANEL.includes(appName)) ||
    LABS_WITHOUT_INSTRUCTIONS.includes(appName)
  ) {
    return false;
  }
  return (
    LABS_USING_RESOURCE_PANEL.includes(appName) ||
    experiments.isEnabledAllowingQueryString(experiments.LAB2_RESOURCE_PANEL)
  );
}
