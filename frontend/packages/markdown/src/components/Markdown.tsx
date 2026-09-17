import classNames from 'classnames';
import type {Components} from 'hast-util-to-jsx-runtime';
import {
  useMemo,
  useSyncExternalStore,
  type CSSProperties,
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

import {
  componentSizeToBodyTextSizeMap,
  type BodyTextSizeVariant,
} from '@code-dot-org/component-library/common/constants';
import Divider from '@code-dot-org/component-library/divider';
import Link from '@code-dot-org/component-library/link';

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
import rehypeListItemParagraphs from '../rehypeListItemParagraphs';
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
   * Render as phrasing content: one `<span>`, no block wrapper and no paragraph
   * typography, for markdown that sits inside a sentence or a list item. Block
   * syntax (headings, lists, quotes, fences, rules) is switched off, so it stays
   * literal text rather than producing block markup inside an inline context.
   * The surrounding element supplies the type scale, so `bodyVariant` does not
   * apply.
   */
  inline?: boolean;
  /**
   * Type scale for body text -- paragraphs, including those inside list items,
   * and the links inside them. Defaults to `body2`. Headings and other elements
   * keep their own variants. Ignored when `inline` is set.
   */
  bodyVariant?: BodyTextSizeVariant;
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
 * The design system sizes Link by component size (`m` -> body2, and so on)
 * rather than by typography variant, so body text and the links inside it are
 * set from two different scales. Inverting the library's own map keeps them in
 * step: a body4 paragraph gets xs links, not the 1rem default.
 */
const LINK_SIZE_BY_BODY_VARIANT = Object.fromEntries(
  Object.entries(componentSizeToBodyTextSizeMap).map(([size, variant]) => [
    variant,
    size,
  ]),
) as Record<BodyTextSizeVariant, keyof typeof componentSizeToBodyTextSizeMap>;

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

/*
 * Every component below forwards `className` and `style`. A mapped element
 * keeps only what its component passes on, so dropping `style` here would
 * silently discard the inline CSS the inlineStyles extension exists to permit —
 * the sanitizer would allow it through and the React layer would throw it away.
 * When that extension is not enabled, the sanitizer has already removed the
 * attribute and there is nothing to forward.
 */
const makeLink =
  (bodyVariant: BodyTextSizeVariant): Components['a'] =>
  ({children, href, className, style, target}) => (
    // A `target="_blank"` on the node (set by the externalLinks extension) maps
    // to the design-system Link's openInNewTab, which also applies rel=noopener.
    <Link
      href={href}
      size={LINK_SIZE_BY_BODY_VARIANT[bodyVariant]}
      className={className}
      style={style}
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
  (localized: boolean, variant: BodyTextSizeVariant): Components['p'] =>
  ({children, className, style}) => (
    <Typography
      variant={variant}
      component="p"
      className={className}
      style={style}
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
  ({
    children,
    className,
    style,
  }: {
    children?: ReactNode;
    className?: string;
    style?: CSSProperties;
  }) => (
    <Typography
      variant={variant}
      component={component}
      className={className}
      style={style}
    >
      {children}
    </Typography>
  );

const baseComponents = (
  localized: boolean,
  bodyVariant: BodyTextSizeVariant,
): Partial<Components> => ({
  h1: muiText('h1', 'h1'),
  h2: muiText('h2', 'h2'),
  h3: muiText('h3', 'h3'),
  h4: muiText('h4', 'h4'),
  h5: muiText('h5', 'h5'),
  h6: muiText('h6', 'h6'),
  strong: muiText('strong', 'strong'),
  em: muiText('em', 'em'),
  a: makeLink(bodyVariant),
  p: makeParagraph(localized, bodyVariant),
  // `---` renders as a themed design-system divider. (Divider is not yet
  // MUI-migrated, so the DSCO component is the design-system component here.)
  hr: ({className, style}) => <Divider className={className} style={style} />,
});

const NO_EXTENSIONS: MarkdownExtension[] = [];

/*
 * Block constructs, switched off for an inline render. Disabling them in the
 * tokenizer is what makes the inline contract enforceable: a definition that
 * happens to start with "- " stays text instead of becoming a <ul> inside a
 * <span>. Named as micromark knows them.
 */
// Renders a mapped element's children in its place, dropping the element.
const PassThrough: Components['p'] = ({children}) => <>{children}</>;

const BLOCK_CONSTRUCTS = [
  'blockQuote',
  'codeFenced',
  'codeIndented',
  'headingAtx',
  'htmlFlow',
  'list',
  'setextHeading',
  'thematicBreak',
];

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
  bodyVariant: BodyTextSizeVariant,
  inline: boolean,
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
    // Before the extensions' plugins: at this point the only custom elements in
    // the tree are the block-level ones an author wrote as raw HTML, which the
    // wrapper already classifies correctly.
    .use(rehypeListItemParagraphs)
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

  if (inline) {
    // Append rather than assign: remark-gfm has already registered its own
    // micromark extensions under this key.
    const micromarkExtensions = processor.data('micromarkExtensions') ?? [];
    processor.data('micromarkExtensions', [
      ...micromarkExtensions,
      {disable: {null: BLOCK_CONSTRUCTS}},
    ]);
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
    components: composeComponents(
      inline
        ? // The one paragraph the parser still produces is the wrapping span
          // itself, which carries the localization marker in its place.
          {...baseComponents(localized, bodyVariant), p: PassThrough}
        : baseComponents(localized, bodyVariant),
      extensions,
    ),
  });
};

/**
 * Renders markdown-flavored rich text as sanitized HTML mapped onto
 * design-system components.
 *
 * Provide the markdown as the `content` prop or as a single string child. Pass
 * `extensions` to enable additional syntax, tags, or behaviors a la carte,
 * `bodyVariant` to size body text, and `inline` for markdown that has to render
 * as phrasing content.
 *
 * Localization is automatic: when the core localization plugin has loaded
 * LocalizeJS, content is translated in place and re-translated on locale change
 * (see `localization.ts`); otherwise it is a no-op.
 */
const Markdown = ({
  content,
  className,
  bodyVariant = 'body2',
  inline = false,
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
    () => buildProcessor(extensions, localized, bodyVariant, inline),
    [extensions, localized, bodyVariant, inline],
  );

  const source = preprocessMarkdown(content ?? children ?? '', extensions);
  const rendered = processor.processSync(source).result;

  if (inline) {
    return (
      <span
        className={className}
        {...(localized ? LOCALIZE_NOTRANSLATE_ATTRS : LOCALIZE_PARAGRAPH_ATTRS)}
      >
        {rendered}
      </span>
    );
  }

  return (
    <div className={classNames(moduleStyles.markdownContainer, className)}>
      {rendered}
    </div>
  );
};

export default Markdown;
