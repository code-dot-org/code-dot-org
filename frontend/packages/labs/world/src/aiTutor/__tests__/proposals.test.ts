// Refusing the proposals that would not open.
//
// The safety property this lab needs and Web Lab does not: a `.actor` that
// names a block type which does not exist is a file the editor cannot load, so
// accepting one would replace a student's work with something broken. Every
// proposed workspace is generated first, and the generator is the same one the
// compiler uses.

import {describe, expect, it, vi} from 'vitest';

import type {MultiFileSource, ProjectFile} from '@code-dot-org/core/api';

import {
  mergeProposedWorkspaces,
  refusedWorkspaces,
  workspacesGenerate,
} from '../proposals';

const ok = () => 'generated module';
const throws = () => {
  throw new Error('Invalid block definition for type world_nonsense');
};

describe('workspacesGenerate', () => {
  it('accepts a workspace the generator can build', () => {
    expect(
      workspacesGenerate([{path: 'actors/coin.actor', contents: '{}'}], ok),
    ).toBe(true);
  });

  it('refuses one that throws — an unknown block type, or bad JSON', () => {
    expect(
      workspacesGenerate([{path: 'actors/coin.actor', contents: '{'}], throws),
    ).toBe(false);
  });

  it('refuses the whole offer when any one file is bad', () => {
    // A half-applied proposal is a project in a state nobody asked for.
    const generate = vi
      .fn()
      .mockImplementationOnce(ok)
      .mockImplementationOnce(throws);

    expect(
      workspacesGenerate(
        [
          {path: 'actors/a.actor', contents: '{}'},
          {path: 'actors/b.actor', contents: '{}'},
        ],
        generate,
      ),
    ).toBe(false);
  });

  it('refuses a kind the agent may not write', () => {
    // A `.map` is placements and a `.png` is bytes; neither is a workspace,
    // and the generator would not be asked about them.
    for (const path of ['maps/level1.map', 'sprites/hero.png', 'notes.md']) {
      expect(workspacesGenerate([{path, contents: '{}'}], ok)).toBe(false);
    }
  });

  it('accepts a rule, which is a workspace like any other', () => {
    // Big imported rules are not shown to the agent, but a small one it writes
    // itself is exactly the interesting case.
    expect(
      workspacesGenerate([{path: 'rules/lava.rule', contents: '{}'}], ok),
    ).toBe(true);
  });

  it('does not judge an empty module a failure', () => {
    // An actor with no handlers yet generates almost nothing, and is fine.
    expect(
      workspacesGenerate([{path: 'actors/a.actor', contents: '{}'}], () => ''),
    ).toBe(true);
  });
});

const file = (over: Partial<ProjectFile>): ProjectFile =>
  ({
    id: '1',
    name: 'coin.actor',
    language: 'json',
    contents: '{"old":true}',
    folderId: '7',
    ...over,
  }) as ProjectFile;

const project = (files: ProjectFile[]): MultiFileSource =>
  ({
    files: Object.fromEntries(files.map(f => [f.id, f])),
    folders: {},
  }) as MultiFileSource;

describe('mergeProposedWorkspaces', () => {
  it('rewrites an existing file, keeping its id', () => {
    // The id is what every open tab and the editor's state refer to.
    const {source, changed} = mergeProposedWorkspaces(project([file({})]), [
      {path: 'actors/coin.actor', contents: '{"new":true}'},
    ]);

    expect(Object.keys(source.files)).toEqual(['1']);
    expect(source.files['1'].contents).toBe('{"new":true}');
    expect(changed[0].id).toBe('1');
  });

  it('matches by name, because folders are a convention here', () => {
    // The model is asked for the files it changed, not for a layout.
    const {source} = mergeProposedWorkspaces(project([file({})]), [
      {path: 'coin.actor', contents: '{"new":true}'},
    ]);

    expect(source.files['1'].contents).toBe('{"new":true}');
  });

  it('puts a new file among its own kind', () => {
    // A new rule lands in `rules/` without the model being told to put it
    // there: it goes wherever the other rules are.
    const {source, changed} = mergeProposedWorkspaces(
      project([
        file({id: '1', name: 'coin.actor', folderId: 'actors'}),
        file({id: '2', name: 'gravity.rule', folderId: 'rules'}),
      ]),
      [{path: 'lava.rule', contents: '{}'}],
    );

    expect(changed[0]).toMatchObject({name: 'lava.rule', folderId: 'rules'});
    expect(Object.keys(source.files)).toHaveLength(3);
  });

  it('puts the first of a kind at the root', () => {
    const {changed} = mergeProposedWorkspaces(
      project([file({name: 'coin.actor', folderId: 'actors'})]),
      [{path: 'lava.rule', contents: '{}'}],
    );

    expect(changed[0].folderId).toBe('0');
  });

  it('leaves the source it was given alone', () => {
    // The host keeps the original to put back on Reject.
    const source = project([file({})]);
    const before = JSON.stringify(source);

    mergeProposedWorkspaces(source, [
      {path: 'coin.actor', contents: '{"new":true}'},
    ]);

    expect(JSON.stringify(source)).toBe(before);
  });
});

// The reason, which used to be thrown away.
//
// A bare `catch {}` made every refusal look the same from outside: the student
// saw the workspace printed in the chat with no Accept button, and there was no
// way to tell a bad block type from a badly named file from the model simply
// choosing to explain. The generator knows which; it just had nowhere to say it.
describe('refusedWorkspaces', () => {
  const good = () => 'module code';
  const bad = (): string => {
    throw new Error('Unknown block type world_make_it_awesome');
  };

  it('is empty when every file generates', () => {
    expect(
      refusedWorkspaces([{path: 'actors/coin.actor', contents: '{}'}], good),
    ).toEqual([]);
  });

  it('keeps the generator’s own message, which names the block', () => {
    const refused = refusedWorkspaces(
      [{path: 'actors/coin.actor', contents: '{}'}],
      bad,
    );

    expect(refused).toEqual([
      {
        path: 'actors/coin.actor',
        reason: 'Unknown block type world_make_it_awesome',
      },
    ]);
  });

  it('names a file of a kind the agent may not write', () => {
    const refused = refusedWorkspaces(
      [{path: 'sprites/coin.png', contents: ''}],
      good,
    );

    expect(refused[0].path).toBe('sprites/coin.png');
    expect(refused[0].reason).toContain('may write');
  });

  it('reports every bad file, not only the first', () => {
    // One bad file disqualifies the whole offer, but a refusal that named one
    // of three would send somebody round the loop twice.
    const refused = refusedWorkspaces(
      [
        {path: 'actors/a.actor', contents: '{}'},
        {path: 'actors/b.actor', contents: '{}'},
      ],
      bad,
    );

    expect(refused.map(one => one.path)).toEqual([
      'actors/a.actor',
      'actors/b.actor',
    ]);
  });
});
