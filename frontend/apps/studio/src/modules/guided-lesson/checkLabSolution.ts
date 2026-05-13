/**
 * Deterministic, Blockly-based code check for lab steps. Mirrors the legacy
 * `apps/src/required_block_utils.js` / `feedback.js#getMissingBlocks_`
 * pattern: walk the workspace's blocks, run each authored rule against
 * them, return the first failure (with its authored hint) or success.
 *
 * Why deterministic and not an LLM call: an "empty" Music Lab workspace
 * still emits the `when_run` framing as generated code, so passing the
 * generated source to an LLM with "be generous" baked in makes the check
 * unreliable. Block-type matching is fast, predictable, and authorable.
 *
 * The AI Tutor still helps the student when a check fails — the hint is
 * appended as a tutor turn in the chat, and the student can then ask
 * follow-up questions in the same chat which DOES go through the LLM.
 */

/**
 * Each rule carries TWO hints — a first-try Socratic *notice* prompt and an
 * optional `hintNudge` for the second try. After that the student is meant
 * to ask the AI Tutor in chat for full guidance. This three-tier escalation
 * mirrors Code.org CSF's teaching pattern: question → concrete prompt →
 * step-by-step (delivered by the tutor on-demand, not handed out).
 */

interface BaseRule {
  /** Socratic first-attempt hint. Should be a question or "notice" prompt. */
  hint: string;
  /** Optional second-attempt hint. More concrete than `hint`. */
  hintNudge?: string;
}

export type SolutionRule =
  | (BaseRule & {
      /** All instances of `type` count. Must appear in the workspace. */
      kind: 'requires-block';
      type: string;
    })
  | (BaseRule & {
      /** Must NOT appear in the workspace. */
      kind: 'forbids-block';
      type: string;
    })
  | (BaseRule & {
      /**
       * Sum the count of all listed block types. The total must be ≥ `count`.
       * Used for "at least 4 sound blocks" or "at least 1 of either predict
       * or compare".
       */
      kind: 'min-count';
      types: string[];
      count: number;
    });

/**
 * Named lab-specific predicates. When the named predicate returns true the
 * step passes *regardless of the rules array* — useful for "if the goal
 * was actually reached, don't be picky about which blocks the kid used."
 */
export type AcceptIfPredicate = 'maze-flag-caught';

export interface SolutionCheck {
  rules: SolutionRule[];
  /**
   * Optional escape hatch checked BEFORE the rules. If it resolves to true
   * the step passes immediately. Authored as a string so lesson data stays
   * JSON-shaped; the host maps strings to actual predicate functions.
   */
  acceptIf?: AcceptIfPredicate;
}

export interface SolutionCheckResult {
  solved: boolean;
  /** Which rule fired, by index into `check.rules`. */
  failedRuleIndex?: number;
  /** The rule that fired, for callers that want to pick hint vs. hintNudge. */
  rule?: SolutionRule;
  /**
   * For `min-count` failures, the actual count observed. Useful for
   * count-aware hint substitution (e.g. "you have 2 of 4 sound blocks").
   */
  observedCount?: number;
}

/**
 * Reads the maze SVG DOM and returns true if pegman is sitting on the
 * finish cell. Detects completion by position rather than by which blocks
 * the student used, so a hard-coded `move forward × 4, turn right, move
 * forward × 3` still counts as solved.
 *
 * Pegman's `<image>` `x` attribute includes a sprite-sheet *frame offset*
 * (`x * squareSize − frame * pegmanWidth + 1 + xOffset`) and can land
 * way off the visible cell. The companion `<rect id="clipRect">` is set
 * to `x * squareSize + 1 + xOffset` — i.e., the true visible cell pixel.
 * So we compare clipRect vs finish for x, and pegman image vs finish for
 * y (y has no frame offset). With squareSize ≈ 50 and the finish marker
 * being roughly cell-centered, ±35px is the comfortable tolerance.
 *
 * Logs identity + observed numbers on every call so we can see exactly
 * why a detection failed during a real session.
 */
function isMazeFlagCaught(): boolean {
  const pegman = document.getElementById('pegman') as SVGImageElement | null;
  const clipRect = document.getElementById('clipRect') as SVGRectElement | null;
  const finish = document.getElementById('finish') as SVGImageElement | null;

  if (!finish || (!pegman && !clipRect)) {
    console.info('[isMazeFlagCaught] missing elements', {
      pegman: !!pegman,
      clipRect: !!clipRect,
      finish: !!finish,
    });
    return false;
  }
  // Prefer clipRect for the true cell-pixel position; fall back to the
  // pegman image y (which is offset-free) for the vertical comparison.
  const pxRaw =
    clipRect?.getAttribute('x') ?? pegman?.getAttribute('x') ?? null;
  const pyRaw = pegman?.getAttribute('y') ?? clipRect?.getAttribute('y') ?? null;
  const fxRaw = finish.getAttribute('x');
  const fyRaw = finish.getAttribute('y');
  const px = pxRaw === null ? NaN : parseFloat(pxRaw);
  const py = pyRaw === null ? NaN : parseFloat(pyRaw);
  const fx = fxRaw === null ? NaN : parseFloat(fxRaw);
  const fy = fyRaw === null ? NaN : parseFloat(fyRaw);
  const observed = {px, py, fx, fy};
  if (![px, py, fx, fy].every(Number.isFinite)) {
    console.info('[isMazeFlagCaught] non-finite attrs', observed);
    return false;
  }
  // Finish marker is centered inside its cell with ~50px markers; pegman
  // clipRect lands at the cell's top-left + 1. Difference along x or y
  // can be up to ~35px when both are sitting on the same cell.
  const dx = Math.abs(px - fx);
  const dy = Math.abs(py - fy);
  const caught = dx <= 40 && dy <= 40;
  console.info('[isMazeFlagCaught]', {...observed, dx, dy, caught});
  return caught;
}

const ACCEPT_IF_PREDICATES: Record<AcceptIfPredicate, () => boolean> = {
  'maze-flag-caught': isMazeFlagCaught,
};

/**
 * Run the rules against the current Blockly main workspace. Returns the
 * first failing rule's hint, or `{solved: true}` if all rules pass — or
 * if the optional `acceptIf` predicate returns true (escape hatch for
 * "the goal was reached, don't be picky").
 */
export async function checkLabSolution(
  check: SolutionCheck,
): Promise<SolutionCheckResult> {
  if (check.acceptIf) {
    const predicate = ACCEPT_IF_PREDICATES[check.acceptIf];
    try {
      if (predicate?.()) {
        console.info('[checkLabSolution] acceptIf passed:', check.acceptIf);
        return {solved: true};
      }
    } catch (err) {
      console.warn(
        '[checkLabSolution] acceptIf predicate threw:',
        check.acceptIf,
        err,
      );
    }
  }

  let blocks: ReadonlyArray<{type: string}> = [];
  try {
    const BlocklyMod = await import('blockly/core');
    const Blockly =
      (BlocklyMod as unknown as {default?: typeof BlocklyMod}).default ??
      BlocklyMod;
    const workspace = Blockly.getMainWorkspace();
    if (!workspace) {
      console.warn('[checkLabSolution] no main workspace');
      return {solved: true};
    }
    blocks = workspace.getAllBlocks(false);
    console.info(
      '[checkLabSolution] blocks:',
      blocks.map(b => b.type),
    );
  } catch (err) {
    // If Blockly itself isn't available, fail open so the lesson is
    // never bricked.
    console.warn('[checkLabSolution] blockly read failed:', err);
    return {solved: true};
  }

  const typeCounts = new Map<string, number>();
  for (const block of blocks) {
    typeCounts.set(block.type, (typeCounts.get(block.type) ?? 0) + 1);
  }

  for (let i = 0; i < check.rules.length; i++) {
    const rule = check.rules[i];
    switch (rule.kind) {
      case 'requires-block':
        if ((typeCounts.get(rule.type) ?? 0) === 0) {
          return {solved: false, failedRuleIndex: i, rule};
        }
        break;
      case 'forbids-block':
        if ((typeCounts.get(rule.type) ?? 0) > 0) {
          return {solved: false, failedRuleIndex: i, rule};
        }
        break;
      case 'min-count': {
        const total = rule.types.reduce(
          (sum, t) => sum + (typeCounts.get(t) ?? 0),
          0,
        );
        if (total < rule.count) {
          return {
            solved: false,
            failedRuleIndex: i,
            rule,
            observedCount: total,
          };
        }
        break;
      }
    }
  }

  return {solved: true};
}
