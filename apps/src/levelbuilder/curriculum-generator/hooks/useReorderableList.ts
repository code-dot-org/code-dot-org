import {useCallback, useState} from 'react';

// State + callbacks for an editable, reorderable list of specs. Used
// by both the lesson and unit AI-generation pages, which both want
// "click to move up/down, click to remove, click to add a new blank
// row, patch a row's fields in-place" without re-implementing the
// array-splice ceremony each time.
//
// The hook is generic over the spec shape. Pages pass `getKey` to
// extract the stable React key (lesson uses spec.key, unit uses
// spec.reactKey) and `newSpec` to mint a blank row when the user
// hits "+ Add".

export interface UseReorderableListOptions<TSpec> {
  initial: TSpec[];
  getKey: (spec: TSpec) => string;
  newSpec: () => TSpec;
  // Optional post-patch hook for fields that depend on each other —
  // e.g. the lesson page's "re-derive `generate` from
  // `lastGeneratedDescription`" rule fires when `description` changes,
  // and the unit page's auto-derived key tracks the name field.
  // Receives the pre-patch spec, the freshly-merged spec, and the patch
  // that produced it; returns the final spec to store.
  onAfterPatch?: (prev: TSpec, next: TSpec, patch: Partial<TSpec>) => TSpec;
}

export interface UseReorderableListResult<TSpec> {
  specs: TSpec[];
  setSpecs: React.Dispatch<React.SetStateAction<TSpec[]>>;
  updateSpec: (key: string, patch: Partial<TSpec>) => void;
  removeSpec: (key: string) => void;
  moveSpec: (key: string, direction: 'up' | 'down') => void;
  addSpec: () => void;
}

export function useReorderableList<TSpec>(
  options: UseReorderableListOptions<TSpec>
): UseReorderableListResult<TSpec> {
  const {initial, getKey, newSpec, onAfterPatch} = options;
  const [specs, setSpecs] = useState<TSpec[]>(initial);

  const updateSpec = useCallback(
    (key: string, patch: Partial<TSpec>) => {
      setSpecs(current =>
        current.map(s => {
          if (getKey(s) !== key) return s;
          const next = {...s, ...patch};
          return onAfterPatch ? onAfterPatch(s, next, patch) : next;
        })
      );
    },
    [getKey, onAfterPatch]
  );

  const removeSpec = useCallback(
    (key: string) => {
      setSpecs(current => current.filter(s => getKey(s) !== key));
    },
    [getKey]
  );

  const moveSpec = useCallback(
    (key: string, direction: 'up' | 'down') => {
      setSpecs(current => {
        const i = current.findIndex(s => getKey(s) === key);
        if (i === -1) return current;
        const target = direction === 'up' ? i - 1 : i + 1;
        if (target < 0 || target >= current.length) return current;
        const next = [...current];
        [next[i], next[target]] = [next[target], next[i]];
        return next;
      });
    },
    [getKey]
  );

  const addSpec = useCallback(() => {
    setSpecs(current => [...current, newSpec()]);
  }, [newSpec]);

  return {specs, setSpecs, updateSpec, removeSpec, moveSpec, addSpec};
}
