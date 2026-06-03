import {useMemo, useState, type ReactNode} from 'react';

import {Markdown, extensions} from '../src';

/**
 * A markdown scenario, used by both the demo app (`demo/Demo.tsx`) and the
 * visual-regression tests (`src/components/Markdown.visual.test.tsx`). Defining
 * them here keeps the two in sync — one source of scenarios.
 *
 * `id` doubles as the screenshot baseline name, so keep it stable.
 */
export interface Scenario {
  id: string;
  name: string;
  render: () => ReactNode;
}

// Inline data-URI image so the expandable-image scenario is network-free and
// deterministic for screenshots. Spaces are percent-encoded — a raw space in a
// markdown image destination ends the URL, so the image would fail to parse.
const IMAGE =
  "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20" +
  "width='96'%20height='64'%3E%3Crect%20width='96'%20height='64'%20" +
  "fill='%234a90d9'/%3E%3C/svg%3E";

const VOCAB: Record<string, {definition: string}> = {
  'lossy compression': {definition: 'Reducing file size by discarding data.'},
  algorithm: {definition: 'A list of steps to finish a task.'},
};

/*
 * Clickable text delegates to the consumer's `onActivate(id)`. This shows the
 * activated id as feedback. The feedback is absent until activation, so the
 * visual baseline (the initial render) is unaffected.
 */
const ClickableTextScenario = () => {
  const [activated, setActivated] = useState<string | null>(null);
  const exts = useMemo(
    () => [extensions.clickableText({onActivate: id => setActivated(id)})],
    [],
  );

  return (
    <>
      <Markdown
        content={'Now [run your program](#clickable=run) to see the result.'}
        extensions={exts}
      />
      {activated !== null && (
        <p role="status" style={{color: '#1a7f37', marginTop: 8}}>
          Activated: <code>{activated}</code>
        </p>
      )}
    </>
  );
};

/*
 * Expandable images delegate the actual expand to the consumer's `onExpand`
 * handler. This wires a minimal lightbox so clicking the thumbnail visibly
 * enlarges it — a sample of what a host provides. The initial render is just the
 * thumbnail (the overlay is fixed-position and absent until clicked), so the
 * visual baseline is unaffected.
 */
const ExpandableImagesScenario = () => {
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
    <>
      <Markdown
        content={`![A blue box expandable](${IMAGE})`}
        extensions={exts}
      />
      {expanded && (
        <button
          type="button"
          aria-label="Close expanded image"
          onClick={() => setExpanded(null)}
          style={{
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.7)',
            border: 0,
            cursor: 'zoom-out',
            display: 'flex',
            inset: 0,
            justifyContent: 'center',
            padding: 0,
            position: 'fixed',
          }}
        >
          <img
            src={expanded.url}
            alt={expanded.alt}
            style={{maxHeight: '90vh', maxWidth: '90vw'}}
          />
        </button>
      )}
    </>
  );
};

export const scenarios: Scenario[] = [
  {
    id: 'basic',
    name: 'Basic',
    render: () => (
      <Markdown
        content={
          '# Heading 1\n\n## Heading 2\n\n' +
          'A paragraph with **bold**, *italic*, `inline code`, and a ' +
          '[link to code.org](https://code.org).\n\n' +
          '- list item one\n- list item two\n\n' +
          '| Feature | Supported |\n| ------- | --------- |\n' +
          '| Tables  | yes       |\n| Links   | yes       |\n'
        }
      />
    ),
  },
  {
    id: 'sanitization',
    name: 'Sanitization',
    render: () => (
      <Markdown
        content={
          'This text is safe. <script>alert("xss")</script>' +
          '<img src="x" onerror="alert(1)" /> The script and handler are stripped.'
        }
      />
    ),
  },
  {
    id: 'callout',
    name: 'Callout',
    render: () => (
      <Markdown
        content={'<callout variant="tip">\nHeads up — a callout.\n</callout>'}
        extensions={[extensions.callout]}
      />
    ),
  },
  {
    id: 'inline-styles',
    name: 'Inline styles',
    render: () => (
      <Markdown
        content={
          'A <span style="color:red; font-weight:bold">styled</span> span.'
        }
        extensions={[extensions.inlineStyles]}
      />
    ),
  },
  {
    id: 'embeds',
    name: 'Embeds',
    render: () => (
      <Markdown
        content={
          '<iframe src="data:text/html,embed" title="Example" width="320" height="120"></iframe>'
        }
        extensions={[extensions.embeds]}
      />
    ),
  },
  {
    id: 'blockly',
    name: 'Blockly',
    render: () => (
      <Markdown
        content={
          'Drag this block: <xml><block type="text_print"><title name="TEXT">hello</title></block></xml>'
        }
        extensions={[extensions.blockly]}
      />
    ),
  },
  {
    id: 'external-links',
    name: 'External links',
    render: () => (
      <Markdown
        content={'An [external link](https://example.com) opens in a new tab.'}
        extensions={[extensions.externalLinks()]}
      />
    ),
  },
  {
    id: 'details',
    name: 'Details',
    render: () => (
      <Markdown
        content={'::: details [**Show a hint**]\nThe answer is *42*.\n:::'}
        extensions={[extensions.details]}
      />
    ),
  },
  {
    id: 'visual-code-blocks',
    name: 'Visual code blocks',
    render: () => (
      <Markdown
        content={'First `playSound()`(#fff176), then `get nectar`(#00b0bd).'}
        extensions={[extensions.visualCodeBlock]}
      />
    ),
  },
  {
    id: 'vocabulary-definitions',
    name: 'Vocabulary definitions',
    render: () => (
      <Markdown
        content={
          'A method like [v lossy compression] follows an [v algorithm]. ' +
          'An [v unknown term] falls back to plain text.'
        }
        extensions={[extensions.vocabularyDefinition({lookup: t => VOCAB[t]})]}
      />
    ),
  },
  {
    id: 'clickable-text',
    name: 'Clickable text',
    render: () => <ClickableTextScenario />,
  },
  {
    id: 'expandable-images',
    name: 'Expandable images',
    render: () => <ExpandableImagesScenario />,
  },
];
