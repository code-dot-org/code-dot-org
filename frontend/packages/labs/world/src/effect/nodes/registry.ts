import type {EffectNodeDefinition, EffectPortDefinition} from './types';

/**
 * Lookup for node definitions.
 *
 * A registry is a value rather than a module-level singleton so tests can
 * compile against a small fixed node set, and so a future lab could ship a
 * restricted palette without editing the stock definitions.
 */
export interface EffectNodeRegistry {
  get(type: string): EffectNodeDefinition | undefined;
  /** Throws when the type is unknown; use in code paths that cannot recover. */
  require(type: string): EffectNodeDefinition;
  list(): readonly EffectNodeDefinition[];
  /** A new registry with `definitions` added, overriding on type collision. */
  extend(definitions: readonly EffectNodeDefinition[]): EffectNodeRegistry;
}

export function createNodeRegistry(
  definitions: readonly EffectNodeDefinition[],
): EffectNodeRegistry {
  const byType = new Map(
    definitions.map(definition => [definition.type, definition]),
  );

  return {
    get: type => byType.get(type),
    require: type => {
      const definition = byType.get(type);
      if (!definition) {
        throw new Error(`Unknown effect node type: ${type}`);
      }
      return definition;
    },
    list: () => [...byType.values()],
    extend: extra => createNodeRegistry([...byType.values(), ...extra]),
  };
}

export function findPort(
  ports: readonly EffectPortDefinition[],
  portId: string,
): EffectPortDefinition | undefined {
  return ports.find(port => port.id === portId);
}
