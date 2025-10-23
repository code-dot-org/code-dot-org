const LABS_WITHOUT_INSTRUCTIONS = [
  'bubble_choice',
  'panels',
  'standalone_video',
];

// Some labs do not use instructions, such as Panels, we will need to keep this function to determine
// if the copyright/language/extra links footer should be shown or hidden and whether the rubric FAB should be shown.
export function isUsingInstructions(appName: string | undefined): boolean {
  if (!appName) return false;
  return !LABS_WITHOUT_INSTRUCTIONS.includes(appName);
}
