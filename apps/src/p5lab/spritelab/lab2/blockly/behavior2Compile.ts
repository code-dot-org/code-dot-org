// Compile-time context for behavior2 system workspaces. The per-item state
// blocks store state as sprite props (the getProp fall-through), namespaced
// by the system being compiled so two systems' same-named state can't
// clobber each other. Generators run synchronously inside
// compileBehavior2Sources, which brackets each workspace with set/clear.

let currentBehavior2Name = '';

export function setCurrentBehavior2Name(name: string): void {
  currentBehavior2Name = name;
}

export function clearCurrentBehavior2Name(): void {
  currentBehavior2Name = '';
}

function sanitize(part: string): string {
  return part.replace(/[^a-zA-Z0-9]/g, '_');
}

// The sprite prop backing one named piece of per-sprite system state.
export function behavior2StateKey(stateName: string): string {
  return `__b2_${sanitize(currentBehavior2Name)}_${sanitize(stateName)}`;
}
