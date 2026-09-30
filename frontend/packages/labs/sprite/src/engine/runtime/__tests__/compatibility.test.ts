import {describe, expect, it} from 'vitest';

import {makeInstance} from '../../../sprites/__tests__/harness';
import CoreLibrary from '../CoreLibrary';

// The runtime's entries in docs/sprites/compatibility.md.
describe('runtime compatibility register', () => {
  it('CMP-9: burst and pop take a degree direction as radians', async () => {
    const lib = new CoreLibrary(await makeInstance());
    const burst = lib.addSprite({direction: 90, speed: 10, delay: -1});
    const pop = lib.addSprite({direction: 90, speed: 10});
    const burstSprite = lib.nativeSpriteMap[burst as number];
    const popSprite = lib.nativeSpriteMap[pop as number];

    lib.commands.burstFunc.apply(lib)({id: burst});
    lib.commands.popFunc.apply(lib)({id: pop});

    expect(burstSprite.x).toBeCloseTo(200 + Math.cos(90) * 10);
    expect(burstSprite.y).toBeCloseTo(200 + Math.sin(90) * 10);
    expect(popSprite.x).toBeCloseTo(200 + Math.cos(90) * 5);
    expect(popSprite.y).toBeCloseTo(200 + Math.sin(90) * 5 - 10);
  });

  it('CMP-47: the first spiral sprite never leaves the centre', async () => {
    const lib = new CoreLibrary(await makeInstance());
    lib.commands.makeBurst.apply(lib, [2, '', 'spiral']);
    const [first, second] = Object.values(lib.nativeSpriteMap);

    for (let i = 0; i < 20; i++) {
      lib.runBehaviors();
    }

    expect(first.delay).toBeNaN();
    expect([first.x, first.y]).toEqual([200, 200]);
    expect([second.x, second.y]).not.toEqual([200, 200]);
  });
});
