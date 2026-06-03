import classNames from 'classnames';
import type {Components} from 'hast-util-to-jsx-runtime';
import {
  useMemo,
  useSyncExternalStore,
  type ComponentType,
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

import Link from '@code-dot-org/component-library/link';
import Typography, {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  StrongText,
  EmText,
} from '@code-dot-org/component-library/typography';

import {
  collectRehypePlugins,
  collectRemarkPlugins,
  composeComponents,
  composeSanitizeSchema,
  type MarkdownExtension,
} from '../extension';
import {
  getLocalizationVersion,
  isLocalizationActive,
  subscribeLocalization,
  translateHtml,
} from '../localization';
import rehypeLocalize from '../rehypeLocalize';

import moduleStyles from './markdown.module.scss';

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

const MarkdownLink: Components['a'] = ({children, href, className}) => (
  <Link href={href} className={className} {...LOCALIZE_LINK_ATTRS}>
    {children}
  </Link>
);

/*
 * Paragraphs render through the base Typography component rather than the
 * generated `BodyTwoText`: the generated typography elements drop unknown props,
 * which would silently strip the localization attribute. The base component
 * forwards rest props to the underlying element.
 *
 * When localization is active, rehypeLocalize has already translated the
 * content at build time, so we mark the paragraph data-notranslate. Otherwise we
 * mark it data-isolate for the runtime translation path.
 */
const makeParagraph =
  (localized: boolean): Components['p'] =>
  ({children, className}) => (
    <Typography
      semanticTag="p"
      visualAppearance="body-two"
      className={className}
      {...(localized ? LOCALIZE_NOTRANSLATE_ATTRS : LOCALIZE_PARAGRAPH_ATTRS)}
    >
      {children}
    </Typography>
  );

/*
 * The design-system typography components require `children`, but rehype-react's
 * component slots type it as optional. This adapter bridges that gap (and
 * forwards className), producing a component assignable to any tag slot.
 */
const styledText =
  (Element: ComponentType<{children: ReactNode; className?: string}>) =>
  ({children, className}: {children?: ReactNode; className?: string}) => (
    <Element className={className}>{children}</Element>
  );

const baseComponents = (localized: boolean): Partial<Components> => ({
  h1: styledText(Heading1),
  h2: styledText(Heading2),
  h3: styledText(Heading3),
  h4: styledText(Heading4),
  strong: styledText(StrongText),
  em: styledText(EmText),
  a: MarkdownLink,
  p: makeParagraph(localized),
});

const NO_EXTENSIONS: MarkdownExtension[] = [];

/*
 * Compose the pipeline from the base behavior plus the enabled extensions.
 * Extension remark plugins run before the markdown-to-HTML transform; extension
 * rehype plugins run after raw-HTML reparsing but before sanitization, so their
 * output is still constrained by the (extension-widened) allowlist; extension
 * components are merged over the base mappings.
 *
 * When localization is active, rehypeLocalize runs last among the rehype tree
 * transforms (still before sanitization) so it sees the final structure,
 * including any elements the extensions introduced.
 */
const buildProcessor = (
  extensions: MarkdownExtension[],
  localized: boolean,
) => {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(collectRemarkPlugins(extensions))
    // allowDangerousHtml lets raw HTML in the markdown survive to rehype-raw,
    // which reparses it. rehype-sanitize then enforces the allowlist, so the
    // raw HTML is constrained to safe tags/attributes.
    .use(remarkRehype, {allowDangerousHtml: true})
    .use(rehypeRaw)
    .use(collectRehypePlugins(extensions));

  if (localized) {
    processor.use(rehypeLocalize, {translate: translateHtml});
  }

  return processor
    .use(rehypeSanitize, composeSanitizeSchema(defaultSchema, extensions))
    .use(rehypeReact, {
      Fragment,
      jsx,
      jsxs,
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

  const rendered = processor.processSync(content ?? children ?? '').result;

  return (
    <div className={classNames(moduleStyles.markdownContainer, className)}>
      {rendered}
    </div>
  );
};

export default Markdown;
