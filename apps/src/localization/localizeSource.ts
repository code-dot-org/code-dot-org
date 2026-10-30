import * as acorn from 'acorn';
import * as walk from 'acorn-walk';

import localization from './Localization';

export interface LocalizeSourceOptions {
  // Labels passed through to localization.translate so translators see
  // contextual hints for these strings.
  labels?: string[];
  // String values to leave alone — typically things the runtime keys off
  // by exact match (element IDs, event names, ...). When such a string
  // appears as a bare literal it's skipped; when it appears as an
  // operand of a `+` chain it's treated as a non-literal placeholder so
  // the translator never sees its content.
  exclude?: Iterable<string>;
  // Position-based exclusion keyed by callee name. For each entry, any
  // string at one of the listed argument indices is left untouched.
  // The callee is matched by trailing identifier: both `onEvent(...)`
  // and `foo.onEvent(...)` match `{ onEvent: [...] }`.
  //
  // Example: { onEvent: [1] } skips the eventType argument in
  // `onEvent("btn", "click", fn)` without skipping `"click"` elsewhere
  // in the source.
  excludeCallArgs?: Record<string, readonly number[]>;
  // Line-prefix exclusions: any source line whose first non-whitespace
  // content starts with one of these strings is exempted from
  // translation in full. Useful for protecting data lines whose string
  // contents are referenced by the runtime by exact match (e.g. word
  // lists keyed on the English forms).
  //
  // Matching is on the raw line (split at "\n"), so multi-line
  // declarations only have their first line protected. Single-line
  // statements — the common case — are fully covered.
  excludeLinesStartingWith?: readonly string[];
}

interface Patch {
  start: number;
  end: number;
  replacement: string;
}

interface ChainPart {
  isString: boolean;
  // When isString: the cooked literal value.
  value?: string;
  // When !isString: the source text of the original expression, to be
  // re-emitted in the rewritten chain.
  text?: string;
}

// Flatten a `+` BinaryExpression into its leaf operands. Acorn parses
// `a + b + c` left-associatively as BinaryExpression(BinaryExpression(a, b), c);
// this walks the spine and returns [a, b, c] in source order.
const flattenPlusChain = (
  node: acorn.Expression | acorn.PrivateIdentifier,
  out: acorn.Expression[] = []
): acorn.Expression[] => {
  if (node.type === 'BinaryExpression' && node.operator === '+') {
    flattenPlusChain(node.left, out);
    flattenPlusChain(node.right, out);
  } else if (node.type !== 'PrivateIdentifier') {
    out.push(node);
  }
  return out;
};

const isStringLiteral = (
  node: acorn.Node
): node is acorn.Literal & {value: string} =>
  node.type === 'Literal' && typeof (node as acorn.Literal).value === 'string';

// Trailing-identifier name of a CallExpression callee, or null when the
// callee is something more dynamic (e.g. `obj[name]()` or `(f || g)()`).
// `foo(...)` -> "foo"; `a.b.foo(...)` -> "foo"; otherwise null.
const getCalleeName = (
  callee: acorn.Expression | acorn.Super
): string | null => {
  if (callee.type === 'Identifier') return callee.name;
  if (
    callee.type === 'MemberExpression' &&
    !callee.computed &&
    callee.property.type === 'Identifier'
  ) {
    return callee.property.name;
  }
  return null;
};

// Is `node` the argument of a CallExpression whose callee name is in
// `excludeCallArgs`, at one of the listed positions?
const isExcludedCallArg = (
  node: acorn.Node,
  parent: acorn.Node | undefined,
  excludeCallArgs: Record<string, readonly number[]> | undefined
): boolean => {
  if (!excludeCallArgs || !parent || parent.type !== 'CallExpression') {
    return false;
  }
  const ce = parent as acorn.CallExpression;
  const name = getCalleeName(ce.callee);
  if (name === null) return false;
  const positions = excludeCallArgs[name];
  if (!positions) return false;
  const argIdx = ce.arguments.indexOf(node as acorn.Expression);
  return argIdx >= 0 && positions.includes(argIdx);
};

/**
 * Return a copy of `source` with translatable string content rewritten via
 * `localization.translate`. Two source patterns are recognized:
 *
 *   1. Bare string literals — translated as-is.
 *      `"hello"` -> `"hola"`
 *
 *   2. String-coercing `+` chains — collapsed to a `%N`-placeholder format,
 *      translated as one unit, then expanded back into a `+` chain with the
 *      original non-literal subexpressions spliced into the placeholders in
 *      their translated positions. This lets translators reorder fragments
 *      around interpolated values without losing meaning.
 *        `"hello " + name + " world"`
 *          -> translate("hello %1 world")
 *          -> e.g. "hola %1 mundo"
 *          -> emitted as `"hola " + (name) + " mundo"`
 *
 * Structurally non-translatable positions are skipped:
 *   - Object/class property keys (`{ "foo": ... }`, `class { "foo"() {} }`)
 *   - Module specifiers (`import x from "..."`, `require("...")`)
 *   - Computed member access (`obj["foo"]`)
 *   - Switch case discriminants (`case "foo":`) — translating breaks matching
 *
 * Rewrites are applied as offset patches against the original source string;
 * regions outside translated literals stay byte-identical, preserving
 * formatting and comments.
 *
 * Known limitation: a `+` chain rewrite covers the full span of the chain,
 * so a chain nested as one operand of an outer chain (e.g. `f("a" + x) +
 * name + "b"`) has its translation discarded when the outer chain's patch
 * is applied. This matters rarely in practice and can be revisited if it
 * does.
 *
 * On parse failure (e.g. the source is XML, not JS), `source` is returned
 * unchanged.
 */
export const localizeSource = (
  source: string,
  opts: LocalizeSourceOptions = {}
): string => {
  const {labels = []} = opts;
  const excludeSet = new Set(opts.exclude);

  let ast: acorn.Program;
  try {
    ast = acorn.parse(source, {
      ecmaVersion: 'latest',
      sourceType: 'script',
      allowReturnOutsideFunction: true,
      allowAwaitOutsideFunction: true,
    });
  } catch {
    return source;
  }

  // Precompute byte ranges for any lines whose leading content matches
  // one of the configured prefixes. The lookup is a linear scan of a
  // typically small list of ranges, called once per literal/chain.
  const excludedLineRanges: Array<readonly [number, number]> = [];
  if (opts.excludeLinesStartingWith?.length) {
    const prefixes = opts.excludeLinesStartingWith;
    let lineStart = 0;
    for (let i = 0; i <= source.length; i++) {
      if (i === source.length || source[i] === '\n') {
        const line = source.slice(lineStart, i);
        const trimmed = line.trimStart();
        if (prefixes.some(p => trimmed.startsWith(p))) {
          excludedLineRanges.push([lineStart, i]);
        }
        lineStart = i + 1;
      }
    }
  }
  const isInExcludedLine = (offset: number): boolean =>
    excludedLineRanges.some(([s, e]) => offset >= s && offset < e);

  const patches: Patch[] = [];

  walk.ancestor(ast, {
    BinaryExpression(node, _state, ancestors) {
      if (node.operator !== '+') return;

      // Only act at the TOP of a `+` spine — if our parent is also a
      // `+` BinaryExpression, the chain-top visitor will flatten down
      // through us via flattenPlusChain.
      const parent = ancestors[ancestors.length - 2];
      if (
        parent &&
        parent.type === 'BinaryExpression' &&
        (parent as acorn.BinaryExpression).operator === '+'
      ) {
        return;
      }

      const operands = flattenPlusChain(node);
      if (!operands.some(isStringLiteral)) return;

      // Skip the whole chain if it sits at an excluded call argument
      // position (e.g. the eventType slot of `onEvent(...)`). The
      // Literal visitor already declined to translate operands of any
      // `+` chain via its parent-is-+ check, so there's nothing to undo.
      if (isExcludedCallArg(node, parent, opts.excludeCallArgs)) return;

      if (isInExcludedLine(node.start)) return;

      // Nothing to translate if every string operand is in the exclude
      // set — the chain stays byte-identical.
      const hasTranslatable = operands.some(
        op => isStringLiteral(op) && !excludeSet.has(op.value)
      );
      if (!hasTranslatable) return;

      // Anything left of the first string-literal operand can't be
      // string-concat semantically (JS only coerces to string from the
      // first string forward). Collapse that prefix into one opaque
      // non-literal operand so its numeric semantics are preserved.
      // Excluded literals still count as string literals for this
      // boundary — they coerce just like translatable ones.
      const firstStrIdx = operands.findIndex(isStringLiteral);
      const parts: ChainPart[] = [];
      if (firstStrIdx > 0) {
        const prefixStart = operands[0].start;
        const prefixEnd = operands[firstStrIdx - 1].end;
        parts.push({
          isString: false,
          text: source.slice(prefixStart, prefixEnd),
        });
      }
      for (let i = firstStrIdx; i < operands.length; i++) {
        const op = operands[i];
        if (isStringLiteral(op) && !excludeSet.has(op.value)) {
          parts.push({isString: true, value: op.value});
        } else {
          // Non-literal operand OR an excluded literal (e.g. an element
          // ID). Either way, becomes a placeholder so the translator
          // never sees its content.
          parts.push({
            isString: false,
            text: source.slice(op.start, op.end),
          });
        }
      }

      // Coalesce adjacent string parts — they read as a single literal
      // to a translator.
      const coalesced: ChainPart[] = [];
      for (const part of parts) {
        const last = coalesced[coalesced.length - 1];
        if (last && last.isString && part.isString) {
          last.value = (last.value ?? '') + (part.value ?? '');
        } else {
          coalesced.push({...part});
        }
      }

      // Build the format string with %N placeholders, in 1-based order.
      const placeholders: string[] = [];
      let format = '';
      for (const part of coalesced) {
        if (part.isString) {
          format += part.value ?? '';
        } else {
          placeholders.push(part.text ?? '');
          format += '%' + placeholders.length;
        }
      }

      const translated = localization.translate(format, labels);
      if (translated === format) return;

      // Walk the translated string, splitting on %N markers. Text
      // between markers becomes a string-literal segment; markers
      // become the original placeholder expression wrapped in parens to
      // remain safe at any operator precedence.
      const segments: string[] = [];
      const re = /%(\d+)/g;
      let cursor = 0;
      let match: RegExpExecArray | null;
      while ((match = re.exec(translated)) !== null) {
        if (match.index > cursor) {
          segments.push(JSON.stringify(translated.slice(cursor, match.index)));
        }
        const idx = parseInt(match[1], 10) - 1;
        if (idx >= 0 && idx < placeholders.length) {
          segments.push('(' + placeholders[idx] + ')');
        } else {
          // Translator emitted an out-of-range placeholder; preserve it
          // as literal text rather than corrupting the rewrite.
          segments.push(JSON.stringify(match[0]));
        }
        cursor = match.index + match[0].length;
      }
      if (cursor < translated.length) {
        segments.push(JSON.stringify(translated.slice(cursor)));
      }
      if (segments.length === 0) {
        segments.push('""');
      }

      patches.push({
        start: node.start,
        end: node.end,
        replacement: segments.join(' + '),
      });
    },

    Literal(node, _state, ancestors) {
      if (typeof node.value !== 'string') return;
      if (excludeSet.has(node.value)) return;
      if (isInExcludedLine(node.start)) return;

      const parent = ancestors[ancestors.length - 2];
      if (!parent) return;

      // If we're an operand of a `+` BinaryExpression, the chain
      // visitor will handle (or correctly decline to handle) the whole
      // chain. We must NOT also register a standalone patch here — it
      // would overlap the chain's patch and corrupt the splice. This
      // check stands in for tracking "consumed" operands explicitly,
      // and is robust to acorn-walk firing children's visitors before
      // their parents'.
      if (
        parent.type === 'BinaryExpression' &&
        (parent as acorn.BinaryExpression).operator === '+'
      ) {
        return;
      }

      if (isExcludedCallArg(node, parent, opts.excludeCallArgs)) return;

      switch (parent.type) {
        case 'Property':
          if ((parent as acorn.Property).key === node) return;
          break;
        case 'MethodDefinition':
          if ((parent as acorn.MethodDefinition).key === node) return;
          break;
        case 'PropertyDefinition':
          if ((parent as acorn.PropertyDefinition).key === node) return;
          break;
        case 'ImportDeclaration':
        case 'ExportNamedDeclaration':
        case 'ExportAllDeclaration':
        case 'ImportExpression':
          return;
        case 'CallExpression': {
          const ce = parent as acorn.CallExpression;
          if (
            ce.callee.type === 'Identifier' &&
            ce.callee.name === 'require' &&
            ce.arguments[0] === node
          ) {
            return;
          }
          break;
        }
        case 'MemberExpression': {
          const me = parent as acorn.MemberExpression;
          if (me.computed && me.property === node) return;
          break;
        }
        case 'SwitchCase':
          if ((parent as acorn.SwitchCase).test === node) return;
          break;
      }

      const translated = localization.translate(node.value as string, labels);
      if (translated === node.value) return;

      patches.push({
        start: node.start,
        end: node.end,
        replacement: JSON.stringify(translated),
      });
    },
  });

  // Apply patches end-to-start so earlier offsets stay valid as we splice.
  patches.sort((a, b) => b.start - a.start);
  let out = source;
  for (const p of patches) {
    out = out.slice(0, p.start) + p.replacement + out.slice(p.end);
  }
  return out;
};
