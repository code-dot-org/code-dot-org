const LABS_WITHOUT_INSTRUCTIONS = [
  'bubble_choice',
  'panels',
  'standalone_video',
];

// TODO: Once all lab2 labs are using this version of instructions, this function may be better named
// "isUsingInstructions", as the resource panel will be the instructions panel. Some labs do not use
// instructions, such as Panels, we will need to keep this function to determine if the copyright/language
// footer should be shown or hidden.
export function isUsingInstructions(appName: string | undefined): boolean {
  if (!appName) return false;
  return !LABS_WITHOUT_INSTRUCTIONS.includes(appName);
}
