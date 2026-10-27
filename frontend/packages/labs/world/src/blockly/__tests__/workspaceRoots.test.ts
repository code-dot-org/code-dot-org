// What a workspace says about the file it is (`workspaceRoots`).

import * as Blockly from 'blockly/core';
import {describe, expect, it} from 'vitest';

import {definesRule, definesWorld, markCode} from '../workspaceRoots';

describe('a rule’s workspace', () => {
  it('is one a body of a rule is written on, with no `define rule` in it', () => {
    // A rule's page and the compiler hold a body under its head and nothing
    // above it; a list socket there still defaults to `all actors`.
    const workspace = new Blockly.Workspace();
    expect(definesRule(workspace)).toBe(false);
    markCode(workspace, 'rule');
    expect(definesRule(workspace)).toBe(true);
    markCode(workspace, undefined);
    expect(definesRule(workspace)).toBe(false);
    workspace.dispose();
  });
});

describe('the Main Screen’s code', () => {
  it('is a world’s, with no `define world` in it', () => {
    // So a hat there starts on a kind, as one in a world does
    // (`eventSubject`).
    const workspace = new Blockly.Workspace();
    expect(definesWorld(workspace)).toBe(false);
    markCode(workspace, 'world');
    expect(definesWorld(workspace)).toBe(true);
    expect(definesRule(workspace)).toBe(false);
    workspace.dispose();
  });
});
