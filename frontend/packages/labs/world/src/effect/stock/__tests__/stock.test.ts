// The stock library's contract.
//
// These effects are shipped, not authored by a learner, so a broken one is a
// broken *product* — it would be imported and would not run. And because they
// exist to be read as much as to be run, "carries an explanation" is part of
// the contract, not a nicety: an effect with no notes teaches nothing, and a
// learner meeting their first shader has only these to learn from.

import {describe, expect, it} from 'vitest';

import {compileEffect} from '../../compiler';
import {effectDocumentSchema} from '../../model/schema';
import {STOCK_EFFECTS, stockEffect} from '../index';

describe('every stock effect', () => {
  it.each(STOCK_EFFECTS.map(effect => [effect.id, effect] as const))(
    '%s compiles to a shader',
    (_id, effect) => {
      // The one that matters: a stock effect that will not compile is one a
      // learner imports and cannot run, with an error they did not cause.
      const compiled = compileEffect(effect.document);

      expect(compiled.fragmentSource).toContain('void main');
      expect(compiled.fragmentSource).toContain('gl_FragColor');
    },
  );

  it.each(STOCK_EFFECTS.map(effect => [effect.id, effect] as const))(
    '%s is a valid document on disk',
    (_id, effect) => {
      // It will be written into a project as a `.effect` file and parsed back.
      expect(() => effectDocumentSchema.parse(effect.document)).not.toThrow();
    },
  );

  it.each(STOCK_EFFECTS.map(effect => [effect.id, effect] as const))(
    '%s introduces itself',
    (_id, effect) => {
      // Name and description are what an import dialog lists; an effect with
      // neither is an unlabelled row.
      expect(effect.document.name.trim()).not.toBe('');
      expect(effect.document.description?.trim()).toBeTruthy();
    },
  );

  it.each(STOCK_EFFECTS.map(effect => [effect.id, effect] as const))(
    '%s explains the graph as a whole',
    (_id, effect) => {
      const comments = effect.document.nodes.filter(
        node => node.type === 'comment' && node.note?.trim(),
      );
      expect(comments).not.toHaveLength(0);
    },
  );

  it.each(STOCK_EFFECTS.map(effect => [effect.id, effect] as const))(
    '%s explains every step',
    (_id, effect) => {
      // A note on each working node. The compiler carries these into the
      // generated GLSL, so this is also what makes the shader readable.
      const unexplained = effect.document.nodes
        .filter(node => node.type !== 'comment' && !node.note?.trim())
        .map(node => node.id);
      expect(unexplained).toEqual([]);
    },
  );

  it.each(STOCK_EFFECTS.map(effect => [effect.id, effect] as const))(
    '%s describes each knob it offers',
    (_id, effect) => {
      const undescribed = effect.document.parameters
        .filter(parameter => !parameter.description?.trim())
        .map(parameter => parameter.id);
      expect(undescribed).toEqual([]);
    },
  );

  it.each(STOCK_EFFECTS.map(effect => [effect.id, effect] as const))(
    '%s actually reads every knob it offers',
    (_id, effect) => {
      // A declared-but-unread parameter is a dial that does nothing — worse
      // than no dial, because the learner turns it and concludes the effect is
      // broken. `compileEffect` reports which ones the graph reaches.
      const unused = compileEffect(effect.document)
        .parameters.filter(parameter => !parameter.used)
        .map(parameter => parameter.label);
      expect(unused).toEqual([]);
    },
  );
});

describe('the library as a whole', () => {
  it('has unique file stems', () => {
    const ids = STOCK_EFFECTS.map(effect => effect.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has unique names, so a picker never shows two of the same', () => {
    const names = STOCK_EFFECTS.map(effect => effect.document.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('uses file-safe stems, since each becomes effects/<id>.effect', () => {
    for (const {id} of STOCK_EFFECTS) {
      expect(id).toMatch(/^[a-z][a-z0-9-]*$/);
    }
  });

  it('keeps its teaching order', () => {
    // The order is the order an import dialog lists them, and the order they
    // teach in: each introduces one idea the next one assumes.
    //
    //   tint      sample a color, multiply it
    //   fade      take a color apart; alpha is not like the other three
    //   grayscale measure brightness; Mix applies an effect PARTLY
    //   pulse     the clock, and turning it into a back-and-forth
    //   pixelate  change WHERE you read, not what you do with it
    //   ripple    all of the above at once
    //
    // Pinned rather than derived, because the obvious proxy is wrong: by node
    // count Grayscale (8) would follow Pulse (6), yet split-and-recombine is a
    // gentler idea than the clock, and Pixelate is only four nodes while asking
    // more of the reader than either. Complexity here is conceptual, and no
    // count measures it — so reordering the library is a deliberate act that
    // updates this list.
    expect(STOCK_EFFECTS.map(effect => effect.id)).toEqual([
      'tint',
      'fade',
      'grayscale',
      'pulse',
      'pixelate',
      'ripple',
    ]);
  });

  it('finds an effect by its stem', () => {
    expect(stockEffect('ripple')?.document.name).toBe('Ripple');
    expect(stockEffect('nope')).toBeUndefined();
  });
});
