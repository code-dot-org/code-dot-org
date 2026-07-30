// Shared metadata for behavior2 systems (student-facing word: "system").
// One entry per system the start-system block can attach and the Systems tab
// can open. The name doubles as the __behavior2s registry key in generated
// code, so it must be stable across saves.

export interface Behavior2SystemOption {
  // Dropdown value stored in the block (stable, save-safe).
  key: string;
  // Dropdown label.
  label: string;
  // The number passed to the system implementation as its setting. Sign
  // convention follows the student coordinate system (y up), matching
  // setProp/changePropBy: negative y velocity is downward.
  value: number;
}

export interface Behavior2SystemMeta {
  name: string;
  label: string;
  // What the setting means for this system, e.g. 'gravity'. Currently only
  // documentation and the future per-system dropdown label.
  optionLabel: string;
  options: Behavior2SystemOption[];
}

export const BEHAVIOR2_SYSTEMS: Behavior2SystemMeta[] = [
  {
    name: 'platformer',
    label: 'platformer',
    optionLabel: 'gravity',
    // GameDev_gravity's strengths, same convention (negative = downward).
    options: [
      {key: 'low', label: 'low', value: -0.25},
      {key: 'medium', label: 'medium', value: -0.5},
      {key: 'high', label: 'high', value: -1},
    ],
  },
  {
    name: 'walk',
    label: 'walk',
    optionLabel: 'speed',
    options: [
      {key: 'low', label: 'low', value: 2},
      {key: 'medium', label: 'medium', value: 4},
      {key: 'high', label: 'high', value: 6},
    ],
  },
];

export function getBehavior2System(
  name: string
): Behavior2SystemMeta | undefined {
  return BEHAVIOR2_SYSTEMS.find(system => system.name === name);
}

// The sprite types Platform2 blocks tag sprites with. Values are runtime
// group names; 'walls' and 'players' keep compatibility with the existing
// GameDev group vocabulary (set_type, platformPhysics).
export const BEHAVIOR2_TYPE_OPTIONS: [label: string, group: string][] = [
  ['platform block', 'walls'],
  ['player', 'players'],
  ['sprite', 'sprites'],
];
