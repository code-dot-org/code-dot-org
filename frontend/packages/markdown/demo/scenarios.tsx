import {useEffect, useMemo, useState, type ReactNode} from 'react';

import {localization} from '@code-dot-org/core/plugins/localization';

import {Markdown, extensions} from '../src';

/**
 * A markdown scenario, used by the demo app (`demo/Demo.tsx`). Defining the
 * scenarios here keeps them in one place.
 */
export interface Scenario {
  id: string;
  name: string;
  render: () => ReactNode;
}

// Inline data-URI image so the expandable-image scenario is network-free and
// deterministic. A base64 PNG (a solid #4a90d9 96x64 box) rather than an SVG
// data URI: expandableImages permits only raster data: images, since an
// `<img>`-rendered SVG is safe but the same URL handed to a consumer's onExpand
// (which may navigate to it) could run an embedded script.
const IMAGE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABACAIAAABqVuVZAAAA' +
  'aUlEQVR42u3QMQ0AAAgDsOlDHfZwgwNujiZV0FQPhygQJEiQIEGCBAlCkCBBggQJEiQIQY' +
  'IECRIkSJAgBAkSJEiQIEGCBCFIkCBBggQJEoQgQYIECRIkSBCCBAkSJEiQIEGCECRIkKB/' +
  'FjbeylkuOHQHAAAAAElFTkSuQmCC';

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

/*
 * Localization runs against the core localization plugin, which is inactive
 * unless LocalizeJS is loaded. This patches the singleton to simulate a loaded
 * translator that uppercases text, so you can see translation happen — inline
 * code is renamed for translation and restored.
 * Patching is in an effect (and a 'change' event re-renders), restored on
 * unmount. (@testing-library's render flushes effects, so the visual screenshot
 * captures the translated result deterministically.)
 */
const LocalizedScenario = () => {
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

  return (
    <Markdown
      content={
        'Press `x` then read the ' +
        '`print` block. Text is uppercased by the simulated translator; the ' +
        'inline code elements are preserved.'
      }
    />
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
  {
    id: 'localized',
    name: 'Localized (simulated)',
    render: () => <LocalizedScenario />,
  },
];
