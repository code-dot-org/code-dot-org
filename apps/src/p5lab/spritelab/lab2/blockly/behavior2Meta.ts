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
  // What the setting means for this system — the UNIT label on the start
  // and set blocks (gravity, speed).
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

// Meta for a student-created system: the setting is a plain strength the
// implementation interprets via "the chosen setting".
export function customBehavior2Meta(name: string): Behavior2SystemMeta {
  return {
    name,
    label: name,
    optionLabel: 'strength',
    options: [
      {key: 'low', label: 'low', value: 1},
      {key: 'medium', label: 'medium', value: 2},
      {key: 'high', label: 'high', value: 3},
    ],
  };
}

// The live system list: the built-ins until the view syncs the project's
// stored systems in (see SpriteLab2View). System dropdowns and generators
// resolve against this, so student-created systems appear everywhere.
let registry: Behavior2SystemMeta[] = BEHAVIOR2_SYSTEMS;

export function setBehavior2Registry(systems: Behavior2SystemMeta[]): void {
  registry = systems.length ? systems : BEHAVIOR2_SYSTEMS;
}

export function getBehavior2Registry(): Behavior2SystemMeta[] {
  return registry;
}

// Meta by name — a saved block can reference a system missing from the
// registry (deleted, or another project's); custom meta keeps its code
// generating instead of crashing.
export function getBehavior2System(name: string): Behavior2SystemMeta {
  return (
    registry.find(system => system.name === name) ??
    BEHAVIOR2_SYSTEMS.find(system => system.name === name) ??
    customBehavior2Meta(name)
  );
}

// The sprite types Platform2 blocks tag sprites with. Values are runtime
// group names; 'walls' and 'players' keep compatibility with the existing
// GameDev group vocabulary (set_type, platformPhysics).
export const BEHAVIOR2_TYPE_OPTIONS: [label: string, group: string][] = [
  ['platform block', 'walls'],
  ['player', 'players'],
  ['sprite', 'sprites'],
];
