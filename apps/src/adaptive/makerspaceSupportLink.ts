const MAKERSPACE_SETUP_SUPPORT_LINK =
  'https://support.code.org/hc/en-us/articles/50616846268045-Getting-ready-for-AI-Makerspace-Hour-of-AI-grades-9-12';

// Unit and course names; a new AI Makerspace unit or course must be added here.
const MAKERSPACE_NAMES = [
  'ai-makerspace1-2026',
  'ai-makerspace-2026',
  'hoai2026-adaptive',
];

export function makerspaceSupportLinkFor(name: string): string | undefined {
  return MAKERSPACE_NAMES.includes(name)
    ? MAKERSPACE_SETUP_SUPPORT_LINK
    : undefined;
}
