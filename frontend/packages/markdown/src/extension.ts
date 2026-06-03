import type {Components} from 'hast-util-to-jsx-runtime';
import {defaultSchema} from 'rehype-sanitize';
import type {PluggableList} from 'unified';

/**
 * The sanitization allowlist schema, as accepted by rehype-sanitize. Derived
 * from the shipped default so we never drift from the library's own type.
 */
export type SanitizeSchema = typeof defaultSchema;

/**
 * A self-contained unit of markdown behavior.
 *
 * An extension bundles everything one feature needs — the remark/rehype
 * plugins that parse or transform it, the allowlist additions that let its tags
 * and attributes survive sanitization, and the components that render it — so
 * that enabling the feature is a single opt-in and its concerns live in one
 * place. A consumer enables only the extensions it wants; no use of the
 * component pays for behaviors it did not ask for.
 *
 * Author an extension in its own module under `extensions/` and export a single
 * `MarkdownExtension` value.
 */
export interface MarkdownExtension {
  /** Unique name. Aids debugging and de-duplication. */
  name: string;
  /**
   * Raw-source preprocessor, run before parsing. Use only for syntax that does
   * not fit markdown's block structure and so cannot be handled by a remark
   * plugin — e.g. rewriting a bespoke fenced block into HTML. Prefer a remark
   * plugin whenever the syntax reuses existing markdown.
   */
  preprocess?: (markdown: string) => string;
  /**
   * remark (mdast) plugins, run after the base parser and before the
   * markdown-to-HTML transform. Use for new markdown *syntax*.
   */
  remarkPlugins?: PluggableList;
  /**
   * rehype (hast) plugins, run after raw-HTML reparsing and before
   * sanitization — so whatever they emit is still subject to the allowlist.
   * Use to transform the HTML tree.
   */
  rehypePlugins?: PluggableList;
  /**
   * Allowlist additions, merged into the base schema. Scope these to only the
   * tags and attributes this extension introduces; arrays are concatenated, so
   * an extension widens the allowlist without replacing it.
   */
  sanitizeSchema?: Partial<SanitizeSchema>;
  /**
   * Tag-to-component mappings contributed by this extension. Later extensions
   * win on conflict, and all extensions win over the base mappings.
   */
  components?: Partial<Components>;
}

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const concatUnique = (a: unknown[], b: unknown[]): unknown[] => {
  const merged = [...a];
  for (const item of b) {
    if (!merged.includes(item)) {
      merged.push(item);
    }
  }
  return merged;
};

/*
 * Deep-merge a schema patch into a base schema. Arrays (tagNames, per-tag
 * attribute lists, protocol lists) are concatenated; nested objects (attributes,
 * protocols) are merged recursively; scalars are overwritten. The base is never
 * mutated, so the shared defaultSchema is safe to reuse.
 */
const mergeSchema = (
  base: Record<string, unknown>,
  patch: Record<string, unknown>,
): Record<string, unknown> => {
  const result = {...base};
  for (const [key, value] of Object.entries(patch)) {
    const current = result[key];
    if (Array.isArray(current) && Array.isArray(value)) {
      result[key] = concatUnique(current, value);
    } else if (isPlainObject(current) && isPlainObject(value)) {
      result[key] = mergeSchema(current, value);
    } else {
      result[key] = value;
    }
  }
  return result;
};

/** Fold every extension's schema additions into the base allowlist. */
export const composeSanitizeSchema = (
  base: SanitizeSchema,
  extensions: MarkdownExtension[],
): SanitizeSchema =>
  extensions.reduce(
    (schema, extension) =>
      extension.sanitizeSchema
        ? (mergeSchema(
            schema as Record<string, unknown>,
            extension.sanitizeSchema as Record<string, unknown>,
          ) as SanitizeSchema)
        : schema,
    base,
  );

/** Fold every extension's component mappings over the base mappings. */
export const composeComponents = (
  base: Partial<Components>,
  extensions: MarkdownExtension[],
): Partial<Components> =>
  extensions.reduce(
    (components, extension) => ({...components, ...extension.components}),
    {...base},
  );

/** Gather the remark plugins contributed by every extension, in order. */
export const collectRemarkPlugins = (
  extensions: MarkdownExtension[],
): PluggableList => extensions.flatMap(e => e.remarkPlugins ?? []);

/** Gather the rehype plugins contributed by every extension, in order. */
export const collectRehypePlugins = (
  extensions: MarkdownExtension[],
): PluggableList => extensions.flatMap(e => e.rehypePlugins ?? []);

/** Run the markdown source through every extension's preprocessor, in order. */
export const preprocessMarkdown = (
  markdown: string,
  extensions: MarkdownExtension[],
): string =>
  extensions.reduce(
    (source, extension) =>
      extension.preprocess ? extension.preprocess(source) : source,
    markdown,
  );
