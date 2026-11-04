import {useEffect, useState} from 'react';

import {
  StepInstructionsOptions,
  resolveStepInstructions,
} from '../../ai/resolveStepInstructions';

const NO_INSTRUCTIONS = null;

/**
 * Returns instructions for a step via resolveStepInstructions and a flag
 * indicating if the computation has resolved. Callers can pass plain
 * values without memoizing, since this hook handles memoization internally.
 */
export function useStepInstructions(opts: StepInstructionsOptions) {
  // Undefined until resolved; null when resolved to no text at all.
  const [resolved, setResolved] = useState<string | typeof NO_INSTRUCTIONS>();
  const {name, description} = opts.projectInfo;
  useEffect(() => {
    // Nothing to resolve until the project has loaded.
    if (opts.sources === undefined) return;
    // Intentionally don't setResolved(undefined) here. After the lab first
    // mounts, a rerun replaces the text in place rather than unmounting the lab.
    let cancelled = false;
    resolveStepInstructions({
      pathway: opts.pathway,
      checkpoint: opts.checkpoint,
      step: opts.step,
      projectInfo: {name, description},
      sources: opts.sources,
      authoredInstructions: opts.authoredInstructions,
      generatedInstructions: opts.generatedInstructions,
      saveGeneratedInstructions: opts.saveGeneratedInstructions,
      aichatContext: opts.aichatContext,
    }).then(instructions => {
      if (!cancelled) setResolved(instructions ?? NO_INSTRUCTIONS);
    });
    return () => {
      cancelled = true;
    };
  }, [
    opts.pathway,
    opts.checkpoint,
    opts.step,
    name,
    description,
    opts.sources,
    opts.authoredInstructions,
    opts.generatedInstructions,
    opts.saveGeneratedInstructions,
    opts.aichatContext,
  ]);
  return {
    instructions: resolved ?? undefined,
    isResolved: resolved !== undefined,
  };
}
