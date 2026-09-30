import {expect, type Page, test} from 'playwright/test';

// Drives the engine demo (engine-demo.html): the engine, the sprite library
// and upstream p5 in a real browser, where jsdom tests cannot reach.

async function open(page: Page, query = ''): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`/engine-demo.html${query}`);
  await expect(page.locator('#status')).toHaveText('Running');
  return errors;
}

function sprites(page: Page) {
  return page.evaluate(() => {
    const engine = (
      window as unknown as {
        spriteLabEngine: {
          library: {
            nativeSpriteMap: Record<
              string,
              {x: number; y: number; tint: unknown; group?: string}
            >;
            speechBubbles: {text: unknown}[];
          };
          platform: {zoom: number};
        };
      }
    ).spriteLabEngine;
    return {
      sprites: Object.values(engine.library.nativeSpriteMap).map(s => ({
        x: s.x,
        y: s.y,
        tint: s.tint ?? null,
        group: s.group ?? null,
      })),
      bubbles: engine.library.speechBubbles.map(b => b.text),
      zoom: engine.platform.zoom,
    };
  });
}

test.describe('Sprite Lab engine', () => {
  test('keys move a sprite into a touch event', async ({page}) => {
    const errors = await open(page);
    const before = await sprites(page);
    await page.keyboard.down('ArrowRight');
    await expect
      .poll(async () => (await sprites(page)).bubbles, {timeout: 10_000})
      .toEqual(['Hi!']);
    await page.keyboard.up('ArrowRight');
    const after = await sprites(page);
    expect(after.sprites[0].x).toBeGreaterThan(before.sprites[0].x);
    expect(after.sprites[1].tint).toBe('red');
    expect(errors).toEqual([]);
  });

  test('a draggable sprite follows the mouse', async ({page}) => {
    await open(page);
    const box = await page.locator('canvas').boundingBox();
    if (!box) {
      throw new Error('no canvas');
    }
    await page.mouse.move(box.x + 300, box.y + 200);
    // A press is seen only at a frame boundary (CMP-35): hold it a frame.
    await page.mouse.down();
    await page.waitForTimeout(100);
    await page.mouse.move(box.x + 200, box.y + 320, {steps: 10});
    await page.waitForTimeout(100);
    await page.mouse.up();
    await expect
      .poll(async () => {
        const fish = (await sprites(page)).sprites[1];
        return [Math.round(fish.x), Math.round(fish.y)];
      })
      .toEqual([200, 320]);
  });

  test('a platform player lands on the blocks under a zoom', async ({page}) => {
    await open(page, '?scene=platform');
    await expect
      .poll(async () => (await sprites(page)).zoom, {timeout: 10_000})
      .toBe(2);
    const player = async () =>
      (await sprites(page)).sprites.find(s => s.group === 'players');
    await expect
      .poll(async () => Math.round((await player())?.y ?? 0))
      .toBe(339);
  });
});
