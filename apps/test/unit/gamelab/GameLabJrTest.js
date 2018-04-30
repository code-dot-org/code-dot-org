/* global

addBehavior
makeNewSprite
findBehavior
behaviorsEqual
*/

import GameLabJrLib from '@cdo/apps/gamelab/GameLabJr.interpreted';
import GameLabP5 from '@cdo/apps/gamelab/GameLabP5';
import {expect} from '../../util/configuredChai';
import "script-loader!@code-dot-org/p5.play/examples/lib/p5";
import "script-loader!@code-dot-org/p5.play/lib/p5.play";

describe('Game Lab Jr Helper Library', () => {
  const noop = () => {};
  before(() => {
    const gameLabP5 = new GameLabP5();
    gameLabP5.init({
      onExecutionStarting: noop,
      onPreload: noop,
      onSetup: noop,
      onDraw: noop,
      scale: 1,
    });
    gameLabP5.startExecution();
    const props = gameLabP5.getGlobalPropertyList();
    for (let propName in props) {
      const prop = props[propName];
      let value = prop[0];
      if (value && value.bind && prop.length >= 2) {
        value = value.bind(prop[1]);
      }
      window[propName] = value;
    }

    // Awful hack :(
    // Declarations within eval() aren't applied to the calling scope in
    // strict mode. Replace global variable/function declarations with explicit
    // window property declarations.
    const lib = GameLabJrLib
        .replace(/^function (\w*)/gm, 'window.$1 = function ')
        .replace(/^var /gm, 'window.');

    eval(lib); // eslint-disable-line no-eval
  });

  describe('findBehavior', () => {
    it ('returns -1 if behavior is not found', () => {
      const sprite = makeNewSprite(null, 200, 200);
      const behavior = {
        func: noop,
        extraArgs: [],
      };
      expect(findBehavior(sprite, behavior)).to.equal(-1);
    });

    it ('returns behavior index if found', () => {
      const sprite = makeNewSprite(null, 200, 200);
      const behavior = {
        func: noop,
        extraArgs: [],
      };
      addBehavior(sprite, behavior);
      expect(findBehavior(sprite, behavior)).to.equal(0);
    });
  });

  describe('behaviorsEqual', () => {
    it ('says behaviors with different funcs are unequal', () => {
      const b1 = {
        func: () => { return 1; },
        extraArgs: [],
      };
      const b2 = {
        func: () => { return 2; },
        extraArgs: [],
      };
      expect(behaviorsEqual(b1, b2)).to.be.false;
    });
    it ('says behaviors without extra args are equal', () => {
      const func = () => {};
      const b1 = {
        func,
        extraArgs: [],
      };
      const b2 = {
        func,
        extraArgs: [],
      };
      expect(behaviorsEqual(b1, b2)).to.be.true;
    });
    it ('says behaviors with different extra args are unequal', () => {
      const func = () => {};
      const b1 = {
        func,
        extraArgs: [1],
      };
      const b2 = {
        func,
        extraArgs: [2],
      };
      expect(behaviorsEqual(b1, b2)).to.be.false;
    });
    it ('says behaviors with the same extra args are equal', () => {
      const func = () => {};
      const b1 = {
        func,
        extraArgs: [1],
      };
      const b2 = {
        func,
        extraArgs: [1],
      };
      expect(behaviorsEqual(b1, b2)).to.be.true;
    });
  });
});
