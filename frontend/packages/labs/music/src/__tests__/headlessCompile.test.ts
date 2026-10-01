import * as Blockly from 'blockly/core';
import {javascriptGenerator} from 'blockly/javascript';
import {afterEach, beforeAll, describe, expect, it, vi} from 'vitest';

import {BlockMode} from '../constants';
import {compileSongHeadless} from '../headlessCompile';
import MusicLibrary from '../player/MusicLibrary';
import {libraryJson, projectSource} from '../player/__tests__/musicProject';

beforeAll(async () => {
  await MusicLibrary.loadLibrary(
    {music: {getLibrary: () => Promise.resolve(libraryJson)}} as never,
    'test-library',
  );
});

const compile = () =>
  compileSongHeadless(projectSource, BlockMode.SIMPLE2, e => {
    throw e;
  });

describe('compileSongHeadless', () => {
  const originalBlock = Blockly.Blocks['procedures_defnoreturn'];
  const originalGenerator =
    javascriptGenerator.forBlock['procedures_defnoreturn'];
  afterEach(() => {
    Blockly.Blocks['procedures_defnoreturn'] = originalBlock;
    javascriptGenerator.forBlock['procedures_defnoreturn'] = originalGenerator;
  });

  it('sequences a saved project, functions included', () => {
    const {playbackEvents, orderedFunctions, lastMeasure} = compile();

    const timeline = playbackEvents
      .map(e => [e.blockId, e.id, e.when])
      .sort((a, b) => (a[2] as number) - (b[2] as number));
    expect(timeline).toEqual([
      ['s1', 'pack1/beat', 1],
      ['s3', 'pack1/beat', 2],
      ['s2', 'pack1/lead', 3],
    ]);
    expect(orderedFunctions.map(f => f.name)).toContain('chorus');
    expect(lastMeasure).toBe(5);
  });

  it('compiles the same project twice', () => {
    // Procedure ids and invocation counters differ per load.
    const timeline = () =>
      compile().playbackEvents.map(e => [e.blockId, e.id, e.when, e.length]);
    expect(timeline()).toEqual(timeline());
  });

  it("restores the host's definitions and removes Music's", () => {
    const standInBlock = {init() {}};
    const standInGenerator = () => '/* host */';
    Blockly.Blocks['procedures_defnoreturn'] = standInBlock;
    javascriptGenerator.forBlock['procedures_defnoreturn'] = standInGenerator;
    const stockDefReturn = Blockly.Blocks['procedures_defreturn'];
    expect('when_run_simple2' in Blockly.Blocks).toBe(false);

    // Music's own definition must have been live: the function body sounded.
    expect(compile().playbackEvents.map(e => e.blockId)).toContain('s3');

    expect(Blockly.Blocks['procedures_defnoreturn']).toBe(standInBlock);
    expect(javascriptGenerator.forBlock['procedures_defnoreturn']).toBe(
      standInGenerator,
    );
    expect('when_run_simple2' in Blockly.Blocks).toBe(false);
    expect('when_run_simple2' in javascriptGenerator.forBlock).toBe(false);
    expect(Blockly.Blocks['procedures_defreturn']).toBe(stockDefReturn);
  });

  it('restores even when loading throws', () => {
    expect(() =>
      compileSongHeadless(
        {blocks: {blocks: [{type: 'no_such_block'}]}},
        BlockMode.SIMPLE2,
        vi.fn(),
      ),
    ).toThrow();
    expect('when_run_simple2' in Blockly.Blocks).toBe(false);
  });
});
