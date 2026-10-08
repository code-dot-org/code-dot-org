// An `(import…)` row's choice, applied once the editor can see what was
// imported.
//
// An import writes its file into the project and answers with the value the
// field should take — and it answers AT ONCE, before any editor has rendered
// with the new file. The map editor saves through Codebridge's `saveFile`,
// which builds the next project from the copy it held at its last render:
// taken then, the choice was saved over a project without the file, and the
// import was undone. The map named a background the project no longer had.
// A second try at the same one seemed to work, because the map already said
// it and nothing was saved.
//
// So the choice is held until the field's options include it — which is the
// render that has the new project — and applied then, through the callback
// of THAT render, whose save builds on the project with the file in it.

import {useCallback, useEffect, useRef, useState} from 'react';

/**
 * Ask an import, and apply its answer once `options` hold it.
 *
 * `apply` is read from the latest render, never from the one that asked:
 * that render's save is the stale one. `target` is whatever the field needs
 * besides the value — which property, for a field that is one of several.
 * An answer the options never come to hold is never applied, which leaves
 * the field as it was rather than naming something the project lacks.
 */
export function useAfterImport<T = undefined>(
  options: readonly string[],
  apply: (value: string, target: T) => void,
): (request: () => Promise<string | undefined>, target: T) => void {
  const [pending, setPending] = useState<{value: string; target: T} | null>(
    null,
  );
  const applyRef = useRef(apply);
  applyRef.current = apply;
  useEffect(() => {
    if (pending && options.includes(pending.value)) {
      setPending(null);
      applyRef.current(pending.value, pending.target);
    }
  }, [pending, options]);
  return useCallback((request, target) => {
    void request().then(value => {
      if (value) {
        setPending({value, target});
      }
    });
  }, []);
}
