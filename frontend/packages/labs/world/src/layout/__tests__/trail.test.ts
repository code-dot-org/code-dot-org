// The way back to the Main Screen (specs/SHELL_PLAN.md, step 1).

import {describe, expect, it} from 'vitest';

import {follow, scriptOf, withScript, type Trail} from '../trail';

const MAIN = 'main';
const LEVEL = 'level';
const HERO = 'hero';

describe('the trail', () => {
  it('starts at the entry, with the file in front after it', () => {
    expect(follow([], MAIN, MAIN)).toEqual([{fileId: MAIN}]);
    expect(follow([], LEVEL, MAIN)).toEqual([{fileId: MAIN}, {fileId: LEVEL}]);
  });

  it('gains a step for each file opened, and cuts back to one opened again', () => {
    let trail = follow([], MAIN, MAIN);
    trail = follow(trail, LEVEL, MAIN);
    trail = follow(trail, HERO, MAIN);
    expect(trail.map(step => step.fileId)).toEqual([MAIN, LEVEL, HERO]);

    expect(follow(trail, LEVEL, MAIN).map(step => step.fileId)).toEqual([
      MAIN,
      LEVEL,
    ]);
    expect(follow(trail, MAIN, MAIN)).toEqual([{fileId: MAIN}]);
  });

  it('is the same trail when nothing changed', () => {
    const trail: Trail = [{fileId: MAIN}, {fileId: LEVEL}];
    expect(follow(trail, LEVEL, MAIN)).toBe(trail);
  });

  it('drops the steps whose files are gone', () => {
    const trail: Trail = [{fileId: MAIN}, {fileId: LEVEL}, {fileId: HERO}];
    expect(follow(trail, HERO, MAIN, id => id !== LEVEL)).toEqual([
      {fileId: MAIN},
      {fileId: HERO},
    ]);
  });

  it('starts again at a new entry', () => {
    const trail: Trail = [{fileId: 'old'}, {fileId: LEVEL}];
    expect(follow(trail, LEVEL, MAIN)).toEqual([
      {fileId: MAIN},
      {fileId: LEVEL},
    ]);
  });
});

describe('a script on the trail', () => {
  const onLevel: Trail = [{fileId: MAIN}, {fileId: LEVEL}];

  it('is a step within its file, open while it is the last', () => {
    const trail = withScript(onLevel, LEVEL, {kind: 'placement', id: 'Hero'});
    expect(trail).toEqual([
      {fileId: MAIN},
      {fileId: LEVEL},
      {fileId: LEVEL, script: {kind: 'placement', id: 'Hero'}},
    ]);
    expect(scriptOf(trail, LEVEL)).toEqual({kind: 'placement', id: 'Hero'});
    expect(scriptOf(trail, MAIN)).toBeNull();
    // The file in front is still the level, so following it changes nothing.
    expect(follow(trail, LEVEL, MAIN)).toBe(trail);
  });

  it('replaces another open in the same file, and closes', () => {
    const hero = withScript(onLevel, LEVEL, {kind: 'placement', id: 'Hero'});
    const own = withScript(hero, LEVEL, {kind: 'map'});
    expect(own[own.length - 1]).toEqual({
      fileId: LEVEL,
      script: {kind: 'map'},
    });
    expect(own).toHaveLength(3);
    expect(withScript(own, LEVEL, null)).toEqual(onLevel);
  });

  it('is left behind when another file is opened, and closed by going back', () => {
    const hero = withScript(onLevel, LEVEL, {kind: 'placement', id: 'Hero'});
    const onward = follow(hero, 'chaser', MAIN);
    expect(onward).toHaveLength(4);
    expect(scriptOf(onward, LEVEL)).toBeNull();
    // Opening the level itself again is going back to it, not to its script.
    expect(follow(onward, LEVEL, MAIN)).toEqual(onLevel);
  });
});
