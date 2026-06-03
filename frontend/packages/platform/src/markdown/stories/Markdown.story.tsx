import type {Decorator, Meta, StoryObj} from '@storybook/react-vite';
import {useEffect, useMemo, useState, type ReactNode} from 'react';
import {fn} from 'storybook/test';

import {localization} from '@code-dot-org/core/plugins/localization';
import {Markdown, extensions} from '@code-dot-org/platform/markdown';

const meta: Meta<typeof Markdown> = {
  title: 'Platform/Markdown',
  component: Markdown,
  parameters: {
    docs: {
      description: {
        component:
          'Sanitized markdown rendered onto design-system components. ' +
          'Localization is inactive here (no LocalizeJS loaded); see the ' +
          '"Localized (simulated)" story for the build-time translation path.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Markdown>;

const BASIC = `# Heading 1

## Heading 2

A paragraph with **bold**, *italic*, \`inline code\`, and a
[link to code.org](https://code.org).

- list item one
- list item two

| Feature | Supported |
| ------- | --------- |
| Tables  | yes       |
| Links   | yes       |
`;

export const Basic: Story = {
  args: {content: BASIC},
};

export const Sanitization: Story = {
  name: 'Sanitization (unsafe input)',
  args: {
    content:
      'This text is safe. <script>alert("xss")</script>' +
      '<img src="x" onerror="alert(1)" /> The script tag and the onerror ' +
      'handler are stripped before render.',
  },
};

export const Callout: Story = {
  // The opening tag is on its own line so the callout parses as a block: an
  // inline custom element would be wrapped in a <p>, and <aside> can't nest in
  // a paragraph.
  render: () => (
    <Markdown
      content={
        '<callout variant="tip">\nHeads up — this is a callout.\n</callout>'
      }
      extensions={[extensions.callout]}
    />
  ),
};

export const InlineStyles: Story = {
  render: () => (
    <Markdown
      content={
        'A <span style="color:red; font-weight:bold">styled</span> span.'
      }
      extensions={[extensions.inlineStyles]}
    />
  ),
};

export const Embeds: Story = {
  render: () => (
    <Markdown
      content={
        '<iframe src="https://example.org" title="Example" width="320" height="180"></iframe>'
      }
      extensions={[extensions.embeds]}
    />
  ),
};

export const Blockly: Story = {
  name: 'Blockly XML (passthrough)',
  render: () => (
    <Markdown
      content={
        'Drag this block: <xml><block type="text_print"><title name="TEXT">hello</title></block></xml>'
      }
      extensions={[extensions.blockly]}
    />
  ),
};

export const ExternalLinks: Story = {
  name: 'Links in a new tab',
  render: () => (
    <Markdown
      content={'An [external link](https://example.com) opens in a new tab.'}
      extensions={[extensions.externalLinks()]}
    />
  ),
};

export const Details: Story = {
  name: 'Details (::: sugar)',
  // The `::: details [summary]` sugar (legacy syntax, flexible spacing). The
  // summary and body are both markdown. Raw <details> HTML also works without
  // the extension.
  render: () => (
    <Markdown
      content={'::: details [**Show a hint**]\nThe answer is *42*.\n:::'}
      extensions={[extensions.details]}
    />
  ),
};

export const VisualCodeBlock: Story = {
  name: 'Visual code blocks',
  render: () => (
    <Markdown
      content={'First `playSound()`(#fff176), then `get nectar`(#00b0bd).'}
      extensions={[extensions.visualCodeBlock]}
    />
  ),
};

export const ClickableText: Story = {
  render: () => (
    <Markdown
      content={'Now [run your program](#clickable=run) to see the result.'}
      extensions={[extensions.clickableText({onActivate: fn()})]}
    />
  ),
};

/*
 * The component delegates the actual expansion to the consumer's `onExpand`
 * handler (the package ships no modal of its own). This demo wires a minimal
 * lightbox so clicking the thumbnail visibly enlarges it — a sample of what a
 * host would provide. The extensions array is memoized so toggling the lightbox
 * does not rebuild the markdown processor.
 */
const ExpandableImagesDemo = () => {
  const [expanded, setExpanded] = useState<{url: string; alt: string} | null>(
    null,
  );
  const exts = useMemo(
    () => [
      extensions.expandableImages({
        onExpand: (url, alt) => setExpanded({url, alt}),
      }),
    ],
    [],
  );

  return (
    <div>
      <Markdown
        content={
          '![A photo expandable](https://picsum.photos/seed/markdown/480/320)'
        }
        extensions={exts}
      />
      {expanded && (
        <button
          type="button"
          aria-label="Close expanded image"
          onClick={() => setExpanded(null)}
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 0,
            padding: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            cursor: 'zoom-out',
          }}
        >
          <img
            src={expanded.url}
            alt={expanded.alt}
            style={{maxWidth: '90vw', maxHeight: '90vh'}}
          />
        </button>
      )}
    </div>
  );
};

export const ExpandableImages: Story = {
  render: () => <ExpandableImagesDemo />,
};

/*
 * Patch the core localization singleton so the build-time translation path runs
 * without a real LocalizeJS. The fake translator uppercases text and leaves
 * element structure (including the <code> token placeholders) untouched, so you
 * can see translation happen and the Blockly XML survive verbatim. Patching
 * happens in an effect (the singleton is module-scoped), then a 'change' event
 * — the same signal a real locale switch sends — nudges the mounted Markdown to
 * re-render. The original methods are restored on unmount.
 */
const SimulatedTranslation = ({children}: {children: ReactNode}) => {
  useEffect(() => {
    const patchable = localization as unknown as {
      isLocalizeJS: () => boolean;
      translate: (element: unknown) => unknown;
    };
    const original = {
      isLocalizeJS: patchable.isLocalizeJS,
      translate: patchable.translate,
    };
    patchable.isLocalizeJS = () => true;
    patchable.translate = element => {
      if (element && typeof element === 'object' && 'childNodes' in element) {
        const walk = (node: Node) => {
          if (node.nodeType === 3) {
            node.textContent = (node.textContent ?? '').toUpperCase();
          }
          node.childNodes.forEach(walk);
        };
        walk(element as Node);
      }
      return element;
    };
    localization.emit('change', {
      locale: localization.locale,
      rtl: localization.rtl,
    });

    return () => {
      Object.assign(localization, original);
      localization.emit('change', {
        locale: localization.locale,
        rtl: localization.rtl,
      });
    };
  }, []);

  return <>{children}</>;
};

const withSimulatedTranslation: Decorator = Story => (
  <SimulatedTranslation>
    <Story />
  </SimulatedTranslation>
);

export const LocalizedSimulated: Story = {
  name: 'Localized (simulated)',
  decorators: [withSimulatedTranslation],
  render: () => (
    <Markdown
      content={
        'Press <xml><block type="x" id="b1"></block></xml> then read the ' +
        '`print` block. (Text is uppercased by the fake translator; the ' +
        'Blockly XML is preserved.)'
      }
      extensions={[extensions.blockly]}
    />
  ),
};
