/* global

draw
addBehavior
makeNewSprite
findBehavior
behaviorsEqual
whenUpArrow
whenMouseClicked
whenTouching
*/

import _ from 'lodash';
import GameLabP5 from '@cdo/apps/gamelab/GameLabP5';
import {expect} from '../../util/configuredChai';
import {stub} from 'sinon';
import "script-loader!@code-dot-org/p5.play/examples/lib/p5";
import "script-loader!@code-dot-org/p5.play/lib/p5.play";

describe('Game Lab Jr Helper Library', () => {
  const noop = () => {};
  let extraKeys, gameLabP5;
  before(() => {
    gameLabP5 = new GameLabP5();
    gameLabP5.init({
      onExecutionStarting: noop,
      onPreload: noop,
      onSetup: noop,
      onDraw: noop,
      scale: 1,
    });
    gameLabP5.startExecution();
    const oldKeys = Object.keys(window);
    const props = gameLabP5.getGlobalPropertyList();
    for (let propName in props) {
      if (propName === 'p5') {
        // The p5 exposed on window in "real javascript land" is different from
        // the p5 exposed as a global within the interpreter. Fortunately the
        // latter isn't needed
        continue;
      }
      const prop = props[propName];
      let value = prop[0];
      if (value && value.bind && prop.length >= 2) {
        value = value.bind(prop[1]);
      }
      window[propName] = value;
    }

    require('!!script-loader!@cdo/interpreted/GameLabJr.interpreted.js');

    const newKeys = Object.keys(window);
    extraKeys = _.difference(newKeys, oldKeys);
  });

  after(() => {
    gameLabP5.resetExecution();
    extraKeys.forEach(key => delete window[key]);
  });

  it ('defines some globals', () => {
    expect(makeNewSprite).to.exist;
    expect(addBehavior).to.exist;
    expect(findBehavior).to.exist;
    expect(behaviorsEqual).to.exist;
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
    it.skip ('says behaviors with different funcs are unequal', () => {
      // Skipped because function names are different inside and outside
      // JSInterpreter
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
    it.skip ('says behaviors with different extra args are unequal', () => {
      // Skipped because function names are different inside and outside
      // JSInterpreter
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

  it('runs things in the expected order', () => {
    const sprite = makeNewSprite(null, 200, 200);
    const otherSprite = makeNewSprite(null, 200, 200);
    const keyWentDownStub = stub(window, 'keyWentDown').returns(true);
    const mouseWentDownStub = stub(window, 'mouseWentDown').returns(true);
    const shouldUpdateStub = stub(window, 'shouldUpdate').returns(true);
    const overlapStub = stub(sprite, 'overlap').callsFake((other, callback) => {
      callback(sprite, other);
      return true;
    });

    const eventLog = [];
    addBehavior(sprite, () => eventLog.push('behavior 1 ran'));
    addBehavior(sprite, () => eventLog.push('behavior 2 ran'));
    whenUpArrow(() => eventLog.push('key event ran'));
    whenMouseClicked(() => eventLog.push('touch event ran'));
    whenTouching(() => sprite, () => otherSprite, () => eventLog.push('collision event ran'));

    draw();

    expect(eventLog).to.deep.equal([
      'behavior 1 ran',
      'behavior 2 ran',
      'key event ran',
      'touch event ran',
      'collision event ran',
    ]);

    shouldUpdateStub.restore();
    overlapStub.restore();
    keyWentDownStub.restore();
    mouseWentDownStub.restore();
  });

  it('does not run behaviors if shouldUpdate returns false', () => {
    const shouldUpdateStub = stub(window, 'shouldUpdate').returns(false);
    const sprite = makeNewSprite(null, 200, 200);
    const eventLog = [];
    addBehavior(sprite, () => eventLog.push('behavior 1 ran'));

    draw();
    expect(eventLog).to.be.empty;

    shouldUpdateStub.restore();
  });
});
