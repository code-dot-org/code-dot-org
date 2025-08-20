import experiments from '@cdo/apps/util/experiments';

// Web Lab 2 uses the resource panel by default, otherwise we defer to the experiment flag.
// TODO: Once all lab2 labs are using this version of instructions, this function may be better named
// "isUsingInstructions", as the resource panel will be the instructions panel. Some labs do not use
// instructions, such as Panels, we will need to keep this function to determine if the copyright/language
// footer should be shown or hidden.
export function isUsingResourcePanel(appName: string): boolean {
  return (
    appName === 'weblab2' ||
    experiments.isEnabledAllowingQueryString(experiments.LAB2_RESOURCE_PANEL)
  );
}
