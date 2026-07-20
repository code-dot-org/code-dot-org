import {render} from '@testing-library/react';
import {expect, it} from 'vitest';

import type {LevelProperties, MultiFileSource} from '@code-dot-org/core/api';
import {RootStateProvider} from '@code-dot-org/core/redux';
import {SourcesProvider} from '@code-dot-org/lab/contexts';

import {samplePythonSource} from '../../fixtures';
import {getEmptyProject} from '../../utils/multiFileSource';
import CodeEditor from '../CodeEditor';

it('mounts a CodeMirror editor showing the active file contents', () => {
  const {container} = render(
    <RootStateProvider>
      <SourcesProvider<LevelProperties, MultiFileSource>
        levelProperties={{} as LevelProperties}
        initialSources={{source: samplePythonSource}}
        defaultSources={{source: getEmptyProject()}}
      >
        <CodeEditor />
      </SourcesProvider>
    </RootStateProvider>,
  );

  expect(container.querySelector('.cm-editor')).not.toBe(null);
  // The scroller carries the accessible label and is the tab stop.
  const scroller = container.querySelector('.cm-scroller');
  expect(scroller?.getAttribute('aria-label')).toBe('Code editor');
  expect(scroller?.getAttribute('tabindex')).toBe('0');
  expect(container.textContent).toContain('hello from codebridge');
});
