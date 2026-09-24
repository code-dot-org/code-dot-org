// The swap itself, apart from the lab it happens in.
//
// `GeneratedCodeView` is stubbed: it reads the sources and the runtime, and
// what this is about is which of the two things is on screen and what the other
// one is handed.

import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import type {CustomEditorProps} from '@code-dot-org/codebridge';

import {orShowCode} from '../orShowCode';
import {ShowCodeContext} from '../showCode';

vi.mock('../GeneratedCodeView', () => ({
  GeneratedCodeView: ({fileId}: {fileId: string}) => (
    <div>javascript for {fileId}</div>
  ),
}));

/** An editor that says what it was handed, so the wrapper can be seen to pass it on. */
const Editor = ({fileId, initialContents}: CustomEditorProps) => (
  <div>
    editor for {fileId} holding {initialContents}
  </div>
);

const props: CustomEditorProps = {
  fileId: 'file1',
  initialContents: '{}',
  language: 'actor',
  isReadOnly: false,
  onChange: () => {},
};

const showing = (value: boolean) => {
  const Wrapped = orShowCode(Editor);
  render(
    <ShowCodeContext.Provider value={{showing: value, hide: () => {}}}>
      <Wrapped {...props} />
    </ShowCodeContext.Provider>,
  );
};

describe('an editor that can show its file’s JavaScript instead', () => {
  it('is the editor, with its props, until the code is asked for', () => {
    showing(false);
    expect(screen.getByText(/editor for file1 holding/)).toBeTruthy();
    expect(screen.queryByText(/javascript for/)).toBeNull();
  });

  it('is the code, for the file it was handed, when it is', () => {
    // BY ID, not "whichever file is active": the wrapper is rendered AS the
    // editor for one file, so that is the file whose code it shows.
    showing(true);
    expect(screen.getByText('javascript for file1')).toBeTruthy();
  });

  it('takes the editor down rather than hiding it', () => {
    // The point of the unmount, said out loud. A Blockly workspace left
    // mounted behind the code is a workspace whose container has no size, and
    // a block that measures itself at zero draws as nothing
    // (`BlocklyFileEditor.layOut`). The cost is a rebuild on the way back,
    // which is what switching to another file and back already costs.
    showing(true);
    expect(screen.queryByText(/editor for/)).toBeNull();
  });

  it('keeps a name a stack trace can be read with', () => {
    expect(orShowCode(Editor).displayName).toBe('orShowCode(Editor)');
  });
});
