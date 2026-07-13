import {expect, test} from '../fixtures';
import {SketchLab, type SketchLabShapeType} from '../pages/sketch-lab';
import {analyze, WCAG_AA_TAGS} from '../shared/axe';
import {cssColorMatchesVar} from '../shared/colors';

/**
 * Net-new coverage (no Cucumber source): the Sketch Lab React Flow canvas —
 * rendering, adding each node type, connecting nodes, and changing a shape's
 * background color. Backed by "allthethings sketchlab 1" (lesson 54, level 1),
 * seeded with no start_sources so every test begins on an empty canvas.
 */

const SHAPE_TYPES: SketchLabShapeType[] = [
  'rectangle',
  'triangle',
  'circle',
  'diamond',
];

// The Background palette's Blue swatch applies var(--sketchlab-bg-blue)
// (elementToolbars/toolbarPalettes.ts), whose resolved color depends on the
// lab's light/dark theme — compare against the variable, not a literal.
const BACKGROUND_BLUE_VAR = '--sketchlab-bg-blue';

test.describe('Sketch Lab React Flow canvas', () => {
  test('Loading the level renders an empty canvas and its tools', async ({
    page,
  }) => {
    const lab = new SketchLab(page);

    await lab.gotoLevel();

    for (const shapeType of SHAPE_TYPES) {
      await expect(lab.addButton(`Add ${shapeType}`)).toBeVisible();
    }
    await expect(lab.addButton('Add text')).toBeVisible();
    await expect(lab.addButton('Add arrow')).toBeVisible();
    await expect(lab.addButton('Add image')).toBeVisible();
    await expect(lab.nodes).toHaveCount(0);
    await expect(lab.edges).toHaveCount(0);
  });

  test('The canvas passes a WCAG AA scan', async ({page}) => {
    const lab = new SketchLab(page);

    await lab.gotoLevel();

    expect(
      await analyze(page, {include: lab.rootSelector, tags: WCAG_AA_TAGS}),
    ).toEqual({});
  });

  test('Adding each node type to the canvas', async ({page}) => {
    const lab = new SketchLab(page);

    await lab.gotoLevel();

    for (const shapeType of SHAPE_TYPES) {
      await lab.addShape(shapeType);
    }
    await lab.addText();
    await lab.addArrow();

    // 4 shapes + 1 text + the arrow's 2 line-anchor endpoints.
    await expect(lab.nodes).toHaveCount(7);
    await expect(lab.lineAnchorNodes).toHaveCount(2);
    await expect(lab.textNodes).toHaveCount(1);
    await expect(lab.edges).toHaveCount(1);
  });

  test('Connecting two shapes with a line', async ({page}) => {
    const lab = new SketchLab(page);

    await lab.gotoLevel();

    await lab.addShape('circle');
    await lab.addShape('diamond');

    // New nodes stagger only 20px apart, and adding one leaves it focused;
    // nudge it clear with arrow keys rather than a mouse drag, which would
    // grab the still-overlapping node's centered label instead.
    await lab.nudgeFocusedNodeClearOf(
      lab.shapeNode('diamond'),
      lab.shapeNode('circle'),
    );
    await expect(lab.edges).toHaveCount(0);

    await lab.connectNodes(lab.shapeNode('circle'), lab.shapeNode('diamond'));

    await expect(lab.edges).toHaveCount(1);
  });

  test("Changing a shape's background color", async ({page}) => {
    const lab = new SketchLab(page);

    await lab.gotoLevel();

    // Adding a node auto-selects it and opens its style toolbar.
    await lab.addShape('circle');
    await expect(lab.styleToolbar).toBeVisible();

    await lab.setBackgroundColor('Blue');

    await expect
      .poll(() =>
        cssColorMatchesVar({
          locator: lab.shapePaintElement(lab.shapeNode('circle')),
          colorProperty: 'fill',
          cssVar: BACKGROUND_BLUE_VAR,
        }),
      )
      .toBe(true);
  });

  test(
    'Sketch Lab canvas visual checks',
    {tag: ['@visual', '@no_mobile']},
    async ({page, visualCheck}) => {
      const lab = new SketchLab(page);

      await lab.gotoLevel();
      // Park the pointer between steps so MUI tooltips on the toolbar
      // buttons never appear in a checkpoint.
      await page.mouse.move(0, 0);
      await visualCheck('initial load', {mask: [lab.lessonHeaderInfo]});

      await lab.addShape('rectangle');
      await lab.addShape('circle');
      await expect(lab.styleToolbar).toBeVisible();
      await page.mouse.move(0, 0);
      await visualCheck('nodes added', {mask: [lab.lessonHeaderInfo]});

      await lab.setBackgroundColor('Blue');
      await expect
        .poll(() =>
          cssColorMatchesVar({
            locator: lab.shapePaintElement(lab.shapeNode('circle')),
            colorProperty: 'fill',
            cssVar: BACKGROUND_BLUE_VAR,
          }),
        )
        .toBe(true);
      await page.mouse.move(0, 0);
      await visualCheck('background color changed', {
        mask: [lab.lessonHeaderInfo],
      });
    },
  );
});
