// No file the repository ships has two bindings sharing one variable.
//
// A binding owns its variable (specs/VARIABLE_OWNERSHIP_PLAN.md), and nothing
// converts a file written before that, so what the repository holds is checked
// here instead: stock rules and actors, every scenario's files, every lesson's.
// A `let` that joins one above it is the exception, and is allowed.

import {describe, expect, it} from 'vitest';

// @ts-expect-error A build script, untyped.
import {BINDING_BLOCKS} from '../../../scripts/rules/dsl.mjs';
import {STOCK_ACTORS} from '../../actors/stock';
import {WORLD_SCENARIOS} from '../../fixtures/scenarios';
import {LESSONS} from '../../progression/lessons';
import {STOCK_RULES} from '../../rules/stock';
import {projectFiles} from '../../runtime/projectFiles';
import {isLocalField} from '../fields/eventLocal';
import {BINDERS, REST} from '../variableScope';

interface Node {
  type?: string;
  fields?: Record<string, unknown>;
  inputs?: Record<string, {block?: Node; shadow?: Node}>;
  next?: {block?: Node; shadow?: Node};
}

const idOf = (value: unknown): string | undefined =>
  typeof value === 'string'
    ? value
    : value && typeof value === 'object' && 'id' in value
      ? String((value as {id: unknown}).id)
      : undefined;

/**
 * The ids bound more than once in one file, where the later one is not a
 * `let` below the earlier in the same stack.
 */
function sharedBindings(source: string): string[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(source);
  } catch {
    return [];
  }
  const owners = new Map<string, number>();
  const shared = new Set<string>();
  // `above` holds the ids bound over the rows being walked: a `let` naming
  // one of them is a join.
  const walkBlock = (node: Node, above: ReadonlySet<string>): void => {
    const locals = Object.keys(node.fields ?? {}).filter(isLocalField);
    const binder = node.type
      ? (BINDERS[node.type] ??
        (locals.length ? {fields: locals, over: [REST]} : undefined))
      : undefined;
    let here = above;
    for (const field of binder?.fields ?? []) {
      const id = idOf(node.fields?.[field]);
      if (!id) {
        continue;
      }
      const joins = node.type!.startsWith('world_let_') && above.has(id);
      if (!joins) {
        owners.set(id, (owners.get(id) ?? 0) + 1);
        if (owners.get(id)! > 1) {
          shared.add(id);
        }
      }
      here = new Set([...here, id]);
    }
    for (const [name, input] of Object.entries(node.inputs ?? {})) {
      const inside = binder?.over.includes(name) ? here : above;
      for (const child of [input.block, input.shadow]) {
        if (child) {
          walkBlock(child, inside);
        }
      }
    }
    const after = binder?.over.includes(REST) ? here : above;
    for (const child of [node.next?.block, node.next?.shadow]) {
      if (child) {
        walkBlock(child, after);
      }
    }
  };
  // Anything shaped like a block, wherever a file keeps its workspaces.
  const walk = (value: unknown): void => {
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }
    if (!value || typeof value !== 'object') {
      return;
    }
    const node = value as Node;
    if (typeof node.type === 'string' && (node.fields || node.inputs)) {
      walkBlock(node, new Set());
      return;
    }
    Object.values(value).forEach(walk);
  };
  walk(parsed);
  return [...shared];
}

const files: Array<[string, string]> = [
  ...STOCK_RULES.map((rule): [string, string] => [
    `stock rule ${rule.id}`,
    rule.contents,
  ]),
  ...STOCK_ACTORS.map((actor): [string, string] => [
    `stock actor ${actor.id}`,
    actor.contents,
  ]),
  ...Object.entries(WORLD_SCENARIOS).flatMap(([tag, scenario]) =>
    Object.entries(projectFiles(scenario.source)).map(
      ([path, source]): [string, string] => [`${tag}: ${path}`, source],
    ),
  ),
  ...Object.entries(LESSONS).flatMap(([tile, lesson]) =>
    Object.entries(projectFiles(lesson.source)).map(
      ([path, source]): [string, string] => [`${tile}: ${path}`, source],
    ),
  ),
];

describe('the repository’s files', () => {
  it('are many enough that the check means something', () => {
    expect(files.length).toBeGreaterThan(100);
  });

  it('are generated with the binding table the editor uses', () => {
    const asScript = Object.fromEntries(
      Object.entries(BINDERS).map(([type, binder]) => [
        type,
        {
          fields: binder.fields,
          over: binder.over.map(input => (input === REST ? 'next' : input)),
        },
      ]),
    );
    expect(BINDING_BLOCKS).toEqual(asScript);
  });

  it('never bind one variable twice', () => {
    const found = files.flatMap(([where, source]) =>
      sharedBindings(source).map(id => `${where}: ${id}`),
    );
    expect(found).toEqual([]);
  });
});
