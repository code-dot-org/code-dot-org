import classNames from 'classnames';
import type {Components} from 'hast-util-to-jsx-runtime';
import {
  useMemo,
  useSyncExternalStore,
  type ElementType,
  type ReactNode,
} from 'react';
import {Fragment, jsx, jsxs} from 'react/jsx-runtime';
import rehypeRaw from 'rehype-raw';
import rehypeReact from 'rehype-react';
import rehypeSanitize, {defaultSchema} from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import {unified} from 'unified';

import {Typography, type TypographyProps} from '@mui/material';

import Link from '@code-dot-org/component-library/link';
// Load the design-system MUI augmentations so the custom Typography variants
// (e.g. `strong`, `em`) are recognized. Type-only: no runtime cost.
import type {} from '@code-dot-org/component-library/themes';

import {
  collectRehypePlugins,
  collectRemarkPlugins,
  composeComponents,
  composeSanitizeSchema,
  preprocessMarkdown,
  type MarkdownExtension,
  type SanitizeSchema,
} from '../extension';
import {
  getLocalizationVersion,
  isLocalizationActive,
  subscribeLocalization,
  translateHtml,
} from '../localization';
import rehypeLocalize from '../rehypeLocalize';

import moduleStyles from './markdown.module.css';

export interface MarkdownProps {
  /** Markdown content. Used instead of `children` when both are provided. */
  content?: string;
  /** Markdown content as a string child. Ignored when `content` is set. */
  children?: string;
  /** Additional class name for the wrapping container. */
  className?: string;
  /**
   * Markdown extensions to enable for this render. Each extension is a
   * self-contained bundle of plugins, allowlist additions, and component
   * mappings (see {@link MarkdownExtension}); only the behaviors listed here are
   * activated. Pass a stable array reference (defined outside render) so the
   * underlying processor can be memoized.
   */
  extensions?: MarkdownExtension[];
}

/*
 * Localization wrappers. Our i18n tooling keys off these attributes to localize
 * URLs and to isolate paragraph-level translation units. They are applied here,
 * in the React layer (i.e. after sanitization), and mirror the wrappers the
 * legacy SafeMarkdown component applied. Defined as plain objects so the
 * `data-*` keys spread onto the design-system components, whose prop types do
 * not enumerate arbitrary data attributes.
 */
const LOCALIZE_LINK_ATTRS = {
  'data-lz-url': 'true',
  'data-localize': 'markdown-url',
};
// data-isolate marks a paragraph as a runtime translation unit; data-notranslate
// marks one already translated at build time by rehypeLocalize, so the runtime
// engine leaves it alone.
const LOCALIZE_PARAGRAPH_ATTRS = {'data-isolate': 'true'};
const LOCALIZE_NOTRANSLATE_ATTRS = {'data-notranslate': 'true'};

const MarkdownLink: Components['a'] = ({children, href, className, target}) => (
  // A `target="_blank"` on the node (set by the externalLinks extension) maps to
  // the design-system Link's openInNewTab, which also applies rel=noopener.
  <Link
    href={href}
    className={className}
    openInNewTab={target === '_blank'}
    {...LOCALIZE_LINK_ATTRS}
  >
    {children}
  </Link>
);

/*
 * MUI Typography forwards unknown props (including our `data-*` localization
 * attributes) to the rendered element, so the isolation/notranslate markers
 * survive. When localization is active, rehypeLocalize has already translated
 * the content at build time, so we mark the paragraph data-notranslate;
 * otherwise data-isolate marks it for the runtime translation path.
 */
const makeParagraph =
  (localized: boolean): Components['p'] =>
  ({children, className}) => (
    <Typography
      variant="body2"
      component="p"
      className={className}
      {...(localized ? LOCALIZE_NOTRANSLATE_ATTRS : LOCALIZE_PARAGRAPH_ATTRS)}
    >
      {children}
    </Typography>
  );

/*
 * Adapts an element slot to a MUI Typography with the given variant (the
 * design-system type scale) and semantic tag. The tag is pinned via `component`
 * rather than left to the theme's `variantMapping`, so it is correct even when
 * the content renders outside the CdoTheme provider. rehype-react types children
 * as optional and passes a `node` prop we do not spread; this bridges that and
 * forwards className.
 */
const muiText =
  (variant: TypographyProps['variant'], component: ElementType) =>
  ({children, className}: {children?: ReactNode; className?: string}) => (
    <Typography variant={variant} component={component} className={className}>
      {children}
    </Typography>
  );

const baseComponents = (localized: boolean): Partial<Components> => ({
  h1: muiText('h1', 'h1'),
  h2: muiText('h2', 'h2'),
  h3: muiText('h3', 'h3'),
  h4: muiText('h4', 'h4'),
  h5: muiText('h5', 'h5'),
  h6: muiText('h6', 'h6'),
  strong: muiText('strong', 'strong'),
  em: muiText('em', 'em'),
  a: MarkdownLink,
  p: makeParagraph(localized),
});

const NO_EXTENSIONS: MarkdownExtension[] = [];

/*
 * A sanitize pass with a fresh attacher identity. unified de-duplicates plugins
 * by reference, so calling `.use(rehypeSanitize, schema)` twice reconfigures the
 * single registration instead of adding a second pass. Wrapping mints a distinct
 * attacher each call, so the before- and after-localization passes both run.
 */
const sanitizePass = (schema: SanitizeSchema) => () => rehypeSanitize(schema);

/*
 * Compose the pipeline from the base behavior plus the enabled extensions.
 * Extension remark plugins run before the markdown-to-HTML transform; extension
 * rehype plugins run after raw-HTML reparsing but before sanitization, so their
 * output is still constrained by the (extension-widened) allowlist; extension
 * components are merged over the base mappings.
 *
 * Sanitization runs before localization. rehypeLocalize round-trips block
 * content through a live DOM (innerHTML) inside the translator, so the tree must
 * already be safe at that point — sanitizing only afterward would be too late to
 * stop markup that auto-executes on parse. When localization is active, a second
 * sanitize pass then constrains the translator's reparsed output.
 */
const buildProcessor = (
  extensions: MarkdownExtension[],
  localized: boolean,
) => {
  const sanitizeSchema = composeSanitizeSchema(defaultSchema, extensions);

  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(collectRemarkPlugins(extensions))
    // allowDangerousHtml lets raw HTML in the markdown survive to rehype-raw,
    // which reparses it. rehype-sanitize then enforces the allowlist, so the
    // raw HTML is constrained to safe tags/attributes.
    .use(remarkRehype, {allowDangerousHtml: true})
    .use(rehypeRaw)
    .use(collectRehypePlugins(extensions))
    // Sanitize before localization, not after: rehypeLocalize serializes each
    // block and reparses it through a live DOM, so the content it handles has
    // to be safe going in.
    .use(sanitizePass(sanitizeSchema));

  if (localized) {
    // `summary` is included so details summaries (inline content after
    // unwrapping) are translated like paragraph text.
    processor.use(rehypeLocalize, {
      translate: translateHtml,
      blockTags: ['p', 'summary'],
    });
    // Re-sanitize the localized tree: the stashed originals are already safe,
    // but the translator's output was reparsed and spliced back in, so hold it
    // to the same allowlist. A distinct attacher (sanitizePass) so this is a
    // genuine second pass, not a reconfiguration of the first.
    processor.use(sanitizePass(sanitizeSchema));
  }

  return processor.use(rehypeReact, {
    Fragment,
    jsx,
    jsxs,
    // Pass each source hast node to its mapped component as a `node` prop.
    // Extensions that reconstruct the original subtree (e.g. an embedded
    // Blockly `<xml>` re-serialized to a workspace) need it; base components
    // destructure only the props they use, so the extra prop is inert for them.
    passNode: true,
    components: composeComponents(baseComponents(localized), extensions),
  });
};

/**
 * Renders markdown-flavored rich text as sanitized HTML mapped onto
 * design-system components.
 *
 * Provide the markdown as the `content` prop or as a single string child. Pass
 * `extensions` to enable additional syntax, tags, or behaviors a la carte.
 *
 * Localization is automatic: when the core localization plugin has loaded
 * LocalizeJS, content is translated in place and re-translated on locale change
 * (see `localization.ts`); otherwise it is a no-op.
 */
const Markdown = ({
  content,
  className,
  extensions = NO_EXTENSIONS,
  children,
}: MarkdownProps) => {
  // Re-render (and re-run the synchronous translate) when LocalizeJS loads or
  // the locale changes. Inactive until then — the runtime data-isolate path,
  // with no per-render translation cost.
  useSyncExternalStore(
    subscribeLocalization,
    getLocalizationVersion,
    getLocalizationVersion,
  );
  const localized = isLocalizationActive();

  const processor = useMemo(
    () => buildProcessor(extensions, localized),
    [extensions, localized],
  );

  const source = preprocessMarkdown(content ?? children ?? '', extensions);
  const rendered = processor.processSync(source).result;

  return (
    <div className={classNames(moduleStyles.markdownContainer, className)}>
      {rendered}
    </div>
  );
};

export default Markdown;
