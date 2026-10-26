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

/** A project with the folders a world has, and whatever files are given. */
const generatable = (
  files: Record<string, {name: string; contents: string}> = {},
): MultiFileSource => ({
  files: Object.fromEntries(
    Object.entries(files).map(([id, file]) => [
      id,
      {id, language: 'actor', folderId: 'actors', ...file},
    ]),
  ),
  folders: {
    actors: {id: 'actors', name: 'actors', parentId: '0'},
    rules: {id: 'rules', name: 'rules', parentId: '0'},
  },
  openFiles: [],
});

const ok = () => ({});
const throws = () => {
  throw new Error('Invalid block definition for type world_nonsense');
};

describe('workspacesGenerate', () => {
  it('accepts a workspace the generator can build', () => {
    expect(
      workspacesGenerate(
        generatable(),
        [{path: 'actors/coin.actor', contents: '{}'}],
        ok,
      ),
    ).toBe(true);
  });

  it('refuses one that throws — an unknown block type, or bad JSON', () => {
    const quiet = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(
      workspacesGenerate(
        generatable(),
        [{path: 'actors/coin.actor', contents: '{'}],
        throws,
      ),
    ).toBe(false);

    quiet.mockRestore();
  });

  it('refuses a kind the agent may not write', () => {
    const quiet = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(
      workspacesGenerate(
        generatable(),
        [{path: 'sprites/coin.png', contents: ''}],
        ok,
      ),
    ).toBe(false);

    quiet.mockRestore();
  });
});

describe('refusedWorkspaces', () => {
  it('is empty when the project it would produce generates', () => {
    expect(
      refusedWorkspaces(
        generatable(),
        [{path: 'actors/coin.actor', contents: '{}'}],
        ok,
      ),
    ).toEqual([]);
  });

  it('names the file, by trying each again when the whole fails', () => {
    // The generator is handed a whole project and can only say what went
    // wrong, not which file carried it. So a failure is followed by one pass
    // per file to attribute it.
    const bad = '{"blocks":{"blocks":[{"type":"world_nonsense"}]}}';
    const generate = (files: Record<string, string>) => {
      if (Object.values(files).some(one => one.includes('world_nonsense'))) {
        throw new Error('Invalid block definition for type world_nonsense');
      }
      return {};
    };

    const refused = refusedWorkspaces(
      generatable(),
      [
        {path: 'actors/good.actor', contents: '{}'},
        {path: 'actors/bad.actor', contents: bad},
      ],
      generate,
    );

    expect(refused).toEqual([
      {
        path: 'actors/bad.actor',
        reason: 'Invalid block definition for type world_nonsense',
      },
    ]);
  });

  it('still reports when each file is fine alone and the set is not', () => {
    // An empty list would read as "nothing wrong", and the offer would be
    // made over a project that does not generate.
    let seen = 0;
    const generate = () => {
      // Fails only the first call, which is the whole-set pass.
      if (seen++ === 0) {
        throw new Error('two actors cannot both be called Coin');
      }
      return {};
    };

    const refused = refusedWorkspaces(
      generatable(),
      [
        {path: 'actors/a.actor', contents: '{}'},
        {path: 'actors/b.actor', contents: '{}'},
      ],
      generate,
    );

    expect(refused).toHaveLength(1);
    expect(refused[0].reason).toContain('cannot both be called');
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
