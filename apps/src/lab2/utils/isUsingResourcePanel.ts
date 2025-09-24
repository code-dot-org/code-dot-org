import experiments from '@cdo/apps/util/experiments';

const LABS_WITHOUT_INSTRUCTIONS = [
  'bubble_choice',
  'panels',
  'standalone_video',
];

// Web Lab 2 and Lab2 Dance use the resource panel by default, otherwise we defer to the experiment flag.
// TODO: Once all lab2 labs are using this version of instructions, this function may be better named
// "isUsingInstructions", as the resource panel will be the instructions panel. Some labs do not use
// instructions, such as Panels, we will need to keep this function to determine if the copyright/language
// footer should be shown or hidden.
export function isUsingResourcePanel(
  appName: string,
  isProjectLevel: boolean
): boolean {
  if (isProjectLevel || LABS_WITHOUT_INSTRUCTIONS.includes(appName)) {
    return false;
  }
  return (
    appName === 'weblab2' ||
    appName === 'dance' ||
    appName === 'sketchlab' ||
    experiments.isEnabledAllowingQueryString(experiments.LAB2_RESOURCE_PANEL)
  );
}
