// Active-scenario selection: which `{labKey, tag}` pair is being rendered.
//
// Lives in its own module so the fixture registries (`registry.ts`,
// `fixtures.ts`) and the sessionStore (`scenarioStore.ts`) can all depend on
// it without forming an import cycle. The studio route loader calls
// `setActiveScenario` from the URL params before the lab makes any API call.

export type Scenario = {labKey: string; tag: string};

let active: Scenario | undefined;

/** Tell the registries which lab + tag is being rendered. */
export function setActiveScenario(scenario: Scenario): void {
  active = scenario;
}

/** Clear the active scenario. Useful between tests. */
export function clearActiveScenario(): void {
  active = undefined;
}

/** Returns `{labKey, tag}` if a scenario is active. */
export function getActiveScenario(): Scenario | undefined {
  return active;
}
