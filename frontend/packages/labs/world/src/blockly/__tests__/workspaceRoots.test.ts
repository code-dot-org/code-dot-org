// What a workspace says about the file it is (`workspaceRoots`).

import * as Blockly from 'blockly/core';
import {describe, expect, it} from 'vitest';

import {definesRule, markRule} from '../workspaceRoots';

describe('a rule’s workspace', () => {
  it('is one a body of a rule is written on, with no `define rule` in it', () => {
    // A rule's page and the compiler hold a body under its head and nothing
    // above it; a list socket there still defaults to `all actors`.
    const workspace = new Blockly.Workspace();
    expect(definesRule(workspace)).toBe(false);
    markRule(workspace, true);
    expect(definesRule(workspace)).toBe(true);
    markRule(workspace, false);
    expect(definesRule(workspace)).toBe(false);
    workspace.dispose();
  });
});
