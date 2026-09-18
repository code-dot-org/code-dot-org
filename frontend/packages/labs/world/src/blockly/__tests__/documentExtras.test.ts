// What a file holds beside its workspace comes back on every save
// (`documentExtras`, specs/MAIN_MAP_PLAN.md).

import {describe, expect, it} from 'vitest';

import {documentExtras, withDocumentExtras} from '../documentExtras';

describe('documentExtras', () => {
  it('is what is not the workspace’s', () => {
    const extras = documentExtras(
      JSON.stringify({
        blocks: {blocks: []},
        variables: [],
        procedures: [],
        workspaceComments: [],
        map: {actors: [{id: 'c'}]},
      }),
    );
    expect(extras).toEqual({map: {actors: [{id: 'c'}]}});
  });

  it('is nothing for an empty, broken or non-object file', () => {
    expect(documentExtras('')).toEqual({});
    expect(documentExtras('{not json')).toEqual({});
    expect(documentExtras('[1]')).toEqual({});
  });
});

describe('withDocumentExtras', () => {
  it('puts the extras beside a saved workspace, the workspace winning', () => {
    const saved = {blocks: {blocks: [{type: 'world_world'}]}};
    expect(
      withDocumentExtras(saved, {map: {actors: []}, blocks: 'stale'}),
    ).toEqual({
      map: {actors: []},
      blocks: {blocks: [{type: 'world_world'}]},
    });
  });
});
