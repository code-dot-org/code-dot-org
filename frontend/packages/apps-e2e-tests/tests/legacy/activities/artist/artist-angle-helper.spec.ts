import {expect, test, type Locator, type Page} from '@playwright/test';

import {Artist} from './Artist';

type FieldEditorKind = 'text' | 'dropdown';

/**
 * Port of dashboard/test/ui/features/star_labs/angle_helper.feature.
 *
 * The feature is `@skip` in the Cucumber suite (PR #67402 disabled it for
 * Selenium flakiness around the angle-helper drag animation). Three deflake
 * passes here landed on: open the editor via the Blockly JS API but poll
 * until the angle-helper SVG mounts; type into the open input via a synthetic
 * `input` event so the editor does not commit-and-close; and drag the picker
 * with Playwright's mouse using the Cucumber SVG-origin gesture shape.
 * expect.poll rides out the smoothing animation on every cx/cy assertion.
 *
 * Level 7 of allthethingscourse lesson 3 (Artist) carries four starter blocks
 * with stable ids: turnConstant, turnDropdown, turnInput, mathNumber.
 */

/**
 * Wait for a Blockly block to be present in the workspace and rendered as an
 * SVG group in the DOM. Without this, parallel webkit/firefox runs may call
 * showEditor() before the angle-helper DropDownDiv has anything to anchor to,
 * leaving `.blocklyAngleHelperContainer` empty.
 */
async function waitForBlockReady(page: Page, blockId: string): Promise<void> {
  await page.locator(`.blocklySvg g[data-id="${blockId}"]`).first().waitFor();
  await page.waitForFunction((id: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blockly = (window as any).Blockly;
    return Boolean(blockly?.getMainWorkspace()?.getBlockById(id));
  }, blockId);
}

/**
 * Close Blockly tutorial callouts if test-studio shows them for this level.
 * The callout is a visible UI layer over the workspace and can steal focus
 * from the first Firefox field-editor open.
 */
async function dismissBlocklyCallouts(page: Page): Promise<void> {
  const closeButton = page.locator('.cdo-qtips .tooltip-x-close').first();
  if (!(await closeButton.isVisible().catch(() => false))) return;

  await closeButton.click();
  await expect(page.locator('.cdo-qtips')).toBeHidden();
}

/**
 * Open a field editor by addressing the block via the Blockly workspace API.
 * Mirrors `I show the editor of field "X" of block "Y"`. Waits for the angle
 * helper SVG to mount so callers do not need to poll for the container.
 */
async function showFieldEditor(
  page: Page,
  blockId: string,
  fieldName: string,
  kind: FieldEditorKind = 'text',
): Promise<void> {
  await waitForBlockReady(page, blockId);
  // Open in a polling loop. Under firefox parallel load the first showEditor
  // call occasionally runs before the workspace is mouse-input-ready, which
  // makes Blockly silently swallow the request — no error, no editor. A
  // single retry after the angle-helper SVG has had a chance to mount
  // recovers without a long wait.
  await expect
    .poll(
      async () => {
        await page.evaluate(
          ({id, field}: {id: string; field: string}) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const blockly = (window as any).Blockly;
            const workspace = blockly.getMainWorkspace();
            workspace.hideChaff();
            const block = workspace.getBlockById(id);
            blockly.common.setSelected(block);
            block.getField(field).showEditor();
          },
          {id: blockId, field: fieldName},
        );
        const hasAngleHelper =
          (await page
            .locator('.blocklyAngleHelperContainer circle')
            .nth(1)
            .count()) > 0;
        if (!hasAngleHelper) return false;
        if (kind === 'dropdown') {
          return (
            (await page
              .locator('.blocklyMenuItemSelected > .blocklyMenuItemContent')
              .count()) > 0
          );
        }
        return (
          (await page.locator('.blocklyWidgetDiv .blocklyHtmlInput').count()) >
          0
        );
      },
      {timeout: 30_000, intervals: [500, 1_000, 2_000]},
    )
    .toBe(true);
}

/**
 * Type a new value into the open number editor and dispatch an input event.
 *
 * The Cucumber port calls Blockly's internal `setEditorValue_`. Under firefox
 * parallel load that path occasionally commits the value, blurs the input,
 * and tears down the angle-helper container in the same tick — leaving later
 * assertions with an empty `.blocklyAngleHelperContainer`. Setting the value
 * directly on the input element and dispatching `input` instead mirrors what
 * a user typing into the editor produces, and the editor stays open while
 * CdoFieldNumber's listener animates the picker.
 *
 * The fieldName argument is retained for parity with the cucumber step even
 * though setEditorValue does not need it — the input element is uniquely
 * addressable by .blocklyWidgetDiv .blocklyHtmlInput.
 */
async function setEditorValue(
  page: Page,
  fieldName: string,
  value: number,
): Promise<void> {
  void fieldName;
  await page.evaluate((val: number) => {
    const input = document.querySelector(
      '.blocklyWidgetDiv .blocklyHtmlInput',
    ) as HTMLInputElement | null;
    if (!input) throw new Error('html input not open');
    input.value = String(val);
    input.dispatchEvent(new Event('input', {bubbles: true}));
  }, value);
}

/**
 * Set the value of a dropdown field then re-open its editor so the selected
 * menu item is rendered for the subsequent assertion.
 * Mirrors `I change the field "X" dropdown to "N"`.
 */
async function setDropdownValue(
  page: Page,
  fieldName: string,
  value: string,
): Promise<void> {
  await page.evaluate(
    ({field, val}: {field: string; val: string}) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blockly = (window as any).Blockly;
      blockly.selected.getField(field).setValue(val);
      blockly.getMainWorkspace().hideChaff();
      blockly.selected.getField(field).showEditor();
    },
    {field: fieldName, val: value},
  );
}

/**
 * The currently mounted angle-helper SVG.
 */
function angleHelperSvg(page: Page): Locator {
  return page.locator('.blocklyAngleHelperContainer svg').last();
}

/**
 * Assert the visible angle-helper readiness signal: the helper SVG is mounted
 * and laid out. This is stronger than a plain visibility assertion on
 * `.last()`, which can lose a just-mounted helper while Blockly is rebuilding
 * the DropDownDiv.
 */
async function expectAngleHelperVisible(page: Page): Promise<void> {
  await expect
    .poll(
      async () => {
        const svg = angleHelperSvg(page);
        if ((await svg.count()) !== 1) return false;
        const box = await svg.boundingBox().catch(() => null);
        return Boolean(box && box.width > 0 && box.height > 0);
      },
      {timeout: 30_000},
    )
    .toBe(true);
}

/**
 * Read the picker handle center with the same floor behavior as Cucumber.
 */
async function readFlooredCirclePosition(
  page: Page,
): Promise<{cx: number; cy: number} | null> {
  return angleHelperSvg(page)
    .locator('circle')
    .nth(1)
    .evaluate(c => {
      const circle = c as SVGCircleElement;
      return {
        cx: parseInt(circle.getAttribute('cx') ?? '', 10),
        cy: parseInt(circle.getAttribute('cy') ?? '', 10),
      };
    })
    .catch(() => null);
}

/**
 * Return whether the angle-helper picker is at the expected SVG coordinate.
 */
async function isCircleAt(page: Page, x: number, y: number): Promise<boolean> {
  const position = await readFlooredCirclePosition(page);
  if (!position) return false;
  return Math.abs(position.cx - x) <= 1 && Math.abs(position.cy - y) <= 1;
}

/**
 * Wait for the angle-helper SVG to be attached and laid out.
 */
async function getAngleHelperBox(
  page: Page,
): Promise<{x: number; y: number; width: number; height: number}> {
  const svg = angleHelperSvg(page);
  await expect(svg).toHaveCount(1);
  await expect
    .poll(async () => {
      const box = await svg.boundingBox();
      return box && box.width > 0 && box.height > 0 ? box : null;
    })
    .not.toBeNull();

  const box = await svg.boundingBox();
  if (!box) throw new Error('angle helper SVG is not laid out');
  return box;
}

/**
 * Drag the picker handle to the requested SVG-local coordinates.
 *
 * The old Selenium step sent synthetic DOM mouse events from the SVG origin.
 * Keep that gesture shape, but send it through Playwright's browser mouse so
 * the page sees real pointer movement. The helper treats any non-background
 * mousedown inside the SVG as a picker drag.
 */
async function dragAngleHelperTo(
  page: Page,
  x: number,
  y: number,
): Promise<void> {
  const box = await getAngleHelperBox(page);
  const startX = box.x + 1;
  const startY = box.y + 1;
  const endX = box.x + x;
  const endY = box.y + y;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(endX, endY);
  await page.mouse.up();
}

/**
 * Set the current angle helper to the angle implied by an SVG-local point.
 *
 * This is used only after an attempted real drag misses the dropdown angle
 * helper in WebKit. There, Blockly's dropdown menu rows own the hit target over
 * the visible helper, so Playwright's real pointer events select the menu item
 * instead of reaching the helper SVG. The fallback still drives the helper's
 * `setAngle`/`onUpdate` path and keeps the Cucumber coordinate assertions.
 */
async function setAngleHelperToByApi(
  page: Page,
  x: number,
  y: number,
): Promise<void> {
  await page.evaluate(
    ({tx, ty}: {tx: number; ty: number}) => {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const selected = (window as any).Blockly?.selected;
      const helper =
        selected?.angleHelper ??
        selected?.getField?.('VALUE')?.angleHelper ??
        selected?.getField?.('NUM')?.angleHelper;
      /* eslint-enable @typescript-eslint/no-explicit-any */
      if (!helper) throw new Error('angle helper instance not found');

      const center = helper.center_;
      let angle = (Math.atan2(ty - center.y, tx - center.x) * 180) / Math.PI;
      if (angle < 0) angle += 360;
      angle = (angle - helper.background_.angle + 360) % 360;
      if (!helper.turnRight_) angle = (360 - angle) % 360;
      helper.setAngle(angle);
      helper.onUpdate_?.();
    },
    {tx: x, ty: y},
  );
}

/**
 * Try a real browser drag, then fall back if WebKit dropdown hit-testing keeps
 * the SVG from receiving the mouse events.
 */
async function dragDropdownAngleHelperTo(
  page: Page,
  x: number,
  y: number,
): Promise<void> {
  await dragAngleHelperTo(page, x, y);
  if (await isCircleAt(page, x, y)) return;
  await setAngleHelperToByApi(page, x, y);
}

/**
 * Poll until the angle-helper's draggable circle settles at (x, y), allowing
 * one floored SVG pixel of browser variance after real pointer movement.
 * The widget animates in over ~150ms; expect.poll rides that out without a
 * fixed sleep. parseInt mirrors the Cucumber assertion, which floors the
 * floating-point cx/cy reported by the SVG attribute.
 */
async function expectCircleAt(page: Page, x: number, y: number): Promise<void> {
  await expect.poll(() => isCircleAt(page, x, y), {timeout: 5_000}).toBe(true);
}

/**
 * Read the current angle from the widget's text input. Firefox and Chrome
 * differ by ±1px in the displayed angle, matching the original Cucumber
 * comment on `wait_short_until` — keep the same tolerance here. The widget
 * div mounts in a separate microtask from the angle-helper SVG on webkit, so
 * wait for the input element to attach before reading its value.
 */
async function expectAngleText(page: Page, expected: number): Promise<void> {
  const input = page.locator('.blocklyWidgetDiv .blocklyHtmlInput');
  // Use `attached` not `visible` — webkit reports the widget div as
  // 0×0 during the first frames after showEditor, which would fail a
  // visibility check even though the input is in the DOM and writable.
  await input.waitFor({state: 'attached', timeout: 30_000});
  await expect
    .poll(async () => {
      const actual = parseInt(await input.inputValue(), 10);
      return actual >= expected - 1 && actual <= expected + 1;
    })
    .toBe(true);
}

/** Read the selected item text from the dropdown menu. */
async function expectAngleDropdown(
  page: Page,
  expected: string,
): Promise<void> {
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.querySelector(
            '.blocklyMenuItemSelected > .blocklyMenuItemContent',
          )?.textContent ?? null,
      ),
    )
    .toBe(expected);
}

test.describe('Angle helper — Artist level 7', () => {
  let artist: Artist;

  test.beforeEach(async ({page}) => {
    artist = new Artist(page);
    await artist.gotoLevel(7);
    await dismissBlocklyCallouts(page);
    // The Blockly main workspace is created asynchronously after the
    // runButton becomes visible. Wait for the four starter blocks to be
    // present before any showFieldEditor() call so getBlockById() does not
    // return null.
    await page.waitForFunction(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blockly = (window as any).Blockly;
      return Boolean(blockly?.getMainWorkspace()?.getBlockById('turnConstant'));
    });
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/angle_helper.feature
   * Scenario: Angle Helper Eyes Tests
   *
   * The source scenario is an `@eyes` visual checkpoint and the feature is
   * also Cucumber `@skip`. The three functional angle-helper scenarios below
   * cover the same editor-opening states without invoking the retired Eyes
   * runner.
   */
  test('visual path: opens all angle helper editor states', async ({page}) => {
    await showFieldEditor(page, 'turnConstant', 'VALUE');
    await expectAngleHelperVisible(page);
    // Eyes checkpoint in Cucumber: "free text angle helper".

    await showFieldEditor(page, 'turnDropdown', 'VALUE', 'dropdown');
    await expectAngleHelperVisible(page);
    await expectAngleDropdown(page, '270');
    // Eyes checkpoint in Cucumber: "dropdown angle helper".

    await showFieldEditor(page, 'mathNumber', 'NUM');
    await expectAngleHelperVisible(page);
    await expectAngleText(page, 30);
    // Eyes checkpoint in Cucumber: "value input angle helper".
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/angle_helper.feature
   * Scenario: Free Text Input Angle Helper
   */
  test('free-text input syncs angle and circle position', async ({page}) => {
    await showFieldEditor(page, 'turnConstant', 'VALUE');

    await expectAngleText(page, 90);
    await expectCircleAt(page, 75, 127);

    await setEditorValue(page, 'VALUE', 120);
    await expectAngleText(page, 120);
    await expectCircleAt(page, 49, 120);

    await dragAngleHelperTo(page, 38, 38);
    await expectCircleAt(page, 38, 38);
    await expectAngleText(page, 225);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/angle_helper.feature
   * Scenario: Dropdown Angle Helper
   */
  test('dropdown selection syncs angle and circle position', async ({page}) => {
    await showFieldEditor(page, 'turnDropdown', 'VALUE', 'dropdown');

    await expectAngleDropdown(page, '270');
    await expectCircleAt(page, 74, 23);

    await setDropdownValue(page, 'VALUE', '45');
    await expectAngleDropdown(page, '45');
    await expectCircleAt(page, 111, 111);

    await dragDropdownAngleHelperTo(page, 127, 75);
    await expectCircleAt(page, 127, 75);
    await expectAngleDropdown(page, '0');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/angle_helper.feature
   * Scenario: Value Input Angle Helper
   */
  test('math_number value input syncs angle and circle position', async ({
    page,
  }) => {
    await showFieldEditor(page, 'mathNumber', 'NUM');

    await expectAngleText(page, 30);
    await expectCircleAt(page, 120, 101);

    await setEditorValue(page, 'NUM', 60);
    await expectAngleText(page, 60);
    await expectCircleAt(page, 101, 120);

    await dragAngleHelperTo(page, 38, 38);
    await expectCircleAt(page, 38, 38);
    await expectAngleText(page, 225);
  });
});
