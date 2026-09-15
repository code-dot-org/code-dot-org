import {expect, test} from '../fixtures';
import {CraftLab} from '../pages/craft-lab';
import {LegacyBlocklyLab} from '../pages/legacy-blockly-lab';
import {PixelationLevel} from '../pages/pixelation-level';
import {
  expectElementHasI18nMarkdown,
  expectElementHasI18nText,
} from '../shared/i18n';

/** Toolbox categories asserted by every "Toolbox Categories in ..." scenario, in DOM order. */
const TOOLBOX_CATEGORY_KEYS = [
  'Events',
  'Text',
  'Variables',
  'Effects',
  'Sprites',
  'Functions',
  'Variables',
];

test.describe('Maze, Frozen, and Minecraft:Agent tutorials in various languages', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/foundations/i18n.feature "Maze tutorial in Spanish"
   */
  test('Maze tutorial in Spanish', async ({page}) => {
    const lab = new LegacyBlocklyLab(page);
    await lab.gotoLevel({
      course: 'ui-test-maze',
      lesson: 1,
      level: 5,
      lang: 'es-MX',
    });

    await expectElementHasI18nText({
      locator: lab.instructionsText,
      locale: 'es-MX',
      key: 'data.level.instructions.maze_2_14',
    });
    await expect(lab.runButton).toBeVisible();
    await expect(lab.resetButton).toBeHidden();
    await expectElementHasI18nText({
      locator: lab.instructionsText,
      locale: 'es-MX',
      key: 'data.level.instructions.maze_2_14',
    });
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/foundations/i18n.feature "Frozen tutorial in Spanish"
   */
  test('Frozen tutorial in Spanish', async ({page}) => {
    const lab = new LegacyBlocklyLab(page);
    await lab.gotoLevel({lesson: 3, level: 10, lang: 'es-MX'});

    await expectElementHasI18nText({
      locator: lab.instructionsText,
      locale: 'es-MX',
      key: 'data.short_instructions.frozen square loop 3x',
    });
    await expect(lab.runButton).toBeVisible();
    await expect(lab.resetButton).toBeHidden();
    await expectElementHasI18nText({
      locator: lab.instructionsText,
      locale: 'es-MX',
      key: 'data.short_instructions.frozen square loop 3x',
    });
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/foundations/i18n.feature "Minecraft:Agent tutorial in Spanish"
   */
  test('Minecraft:Agent tutorial in Spanish', async ({page}) => {
    const lab = new CraftLab(page);
    await lab.gotoLevel({lesson: 25, level: 7, lang: 'es-MX'});

    await expect(lab.instructionsToggleButton).toBeVisible();
    await lab.instructionsToggleButton.click();

    // The toggle swaps this paragraph's text in place, so the ready signal is
    // the text changing rather than the element appearing.
    await expectElementHasI18nText({
      locator: lab.instructionsText,
      locale: 'es-MX',
      key: 'data.short_instructions.MC_HOC_2017_01_RETRY',
    });
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/foundations/i18n.feature "Toolbox Categories in Spanish"
   */
  test('Toolbox Categories in Spanish', async ({page}) => {
    const lab = new LegacyBlocklyLab(page);
    await lab.gotoLevel({lesson: 45, level: 4, lang: 'es-MX'});

    for (const [i, category] of TOOLBOX_CATEGORY_KEYS.entries()) {
      await expectElementHasI18nText({
        locator: lab.toolboxCategoryLabel(i + 1),
        locale: 'es-MX',
        key: `data.block_categories.${category}`,
      });
    }
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/foundations/i18n.feature "Translated function names in Spanish"
   */
  test('Translated function names in Spanish', async ({page}) => {
    const lab = new LegacyBlocklyLab(page);
    await lab.gotoLevel({lesson: 4, level: 6, lang: 'es-MX'});

    // These block ids are authored in this one level's startBlocks XML, not a
    // generic lab concept, so they stay inline rather than becoming POM methods.
    const key = 'data.function_definitions.2-3 Bee Functions 2.get 5.name';
    await expectElementHasI18nText({
      locator: page.locator("[data-id='toolboxCallBlock'] .blocklyText"),
      locale: 'es-MX',
      key,
    });
    await expectElementHasI18nText({
      locator: page.locator("[data-id='workspaceCallBlock'] .blocklyText"),
      locale: 'es-MX',
      key,
    });
    await expectElementHasI18nText({
      locator: page.locator(
        "[data-id='definitionBlock'] > .blocklyNonEditableField > .blocklyText",
      ),
      locale: 'es-MX',
      key,
    });
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/foundations/i18n.feature "Maze tutorial in Portuguese"
   */
  test('Maze tutorial in Portuguese', async ({page}) => {
    const lab = new LegacyBlocklyLab(page);
    await lab.gotoLevel({
      course: 'ui-test-maze',
      lesson: 1,
      level: 5,
      lang: 'pt-br',
    });

    await expectElementHasI18nText({
      locator: lab.instructionsText,
      locale: 'pt-BR',
      key: 'data.level.instructions.maze_2_14',
    });
    await expect(lab.runButton).toBeVisible();
    await expect(lab.resetButton).toBeHidden();
    await expectElementHasI18nText({
      locator: lab.instructionsText,
      locale: 'pt-BR',
      key: 'data.level.instructions.maze_2_14',
    });
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/foundations/i18n.feature "Frozen tutorial in Portuguese"
   */
  test('Frozen tutorial in Portuguese', async ({page}) => {
    const lab = new LegacyBlocklyLab(page);
    await lab.gotoLevel({lesson: 3, level: 10, lang: 'pt-br'});

    await expectElementHasI18nText({
      locator: lab.instructionsText,
      locale: 'pt-BR',
      key: 'data.short_instructions.frozen square loop 3x',
    });
    await expect(lab.runButton).toBeVisible();
    await expect(lab.resetButton).toBeHidden();
    await expectElementHasI18nText({
      locator: lab.instructionsText,
      locale: 'pt-BR',
      key: 'data.short_instructions.frozen square loop 3x',
    });
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/foundations/i18n.feature "Minecraft:Agent tutorial in Portuguese"
   */
  test('Minecraft:Agent tutorial in Portuguese', async ({page}) => {
    const lab = new CraftLab(page);
    await lab.gotoLevel({lesson: 25, level: 7, lang: 'pt-br'});

    await expect(lab.instructionsToggleButton).toBeVisible();
    await lab.instructionsToggleButton.click();

    await expectElementHasI18nText({
      locator: lab.instructionsText,
      locale: 'pt-BR',
      key: 'data.short_instructions.MC_HOC_2017_01_RETRY',
    });
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/foundations/i18n.feature "Toolbox Categories in Portuguese"
   */
  test('Toolbox Categories in Portuguese', async ({page}) => {
    const lab = new LegacyBlocklyLab(page);
    await lab.gotoLevel({lesson: 45, level: 4, lang: 'pt-br'});

    for (const [i, category] of TOOLBOX_CATEGORY_KEYS.entries()) {
      await expectElementHasI18nText({
        locator: lab.toolboxCategoryLabel(i + 1),
        locale: 'pt-BR',
        key: `data.block_categories.${category}`,
      });
    }
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/foundations/i18n.feature "Translated function names in Portuguese"
   */
  test('Translated function names in Portuguese', async ({page}) => {
    const lab = new LegacyBlocklyLab(page);
    await lab.gotoLevel({lesson: 4, level: 6, lang: 'pt-BR'});

    const key = 'data.function_definitions.2-3 Bee Functions 2.get 5.name';
    await expectElementHasI18nText({
      locator: page.locator("[data-id='toolboxCallBlock'] .blocklyText"),
      locale: 'pt-BR',
      key,
    });
    await expectElementHasI18nText({
      locator: page.locator("[data-id='workspaceCallBlock'] .blocklyText"),
      locale: 'pt-BR',
      key,
    });
    await expectElementHasI18nText({
      locator: page.locator(
        "[data-id='definitionBlock'] > .blocklyNonEditableField > .blocklyText",
      ),
      locale: 'pt-BR',
      key,
    });
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/foundations/i18n.feature "Maze tutorial in Arabic (RTL)"
   */
  test('Maze tutorial in Arabic (RTL)', async ({page}) => {
    const lab = new LegacyBlocklyLab(page);
    await lab.gotoLevel({
      course: 'ui-test-maze',
      lesson: 1,
      level: 5,
      lang: 'ar-sa',
    });

    await expectElementHasI18nText({
      locator: lab.instructionsText,
      locale: 'ar-SA',
      key: 'data.level.instructions.maze_2_14',
    });
    await expect(lab.runButton).toBeVisible();
    await expect(lab.resetButton).toBeHidden();
    await expectElementHasI18nText({
      locator: lab.instructionsText,
      locale: 'ar-SA',
      key: 'data.level.instructions.maze_2_14',
    });
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/foundations/i18n.feature "Frozen tutorial in Arabic (RTL)"
   */
  test('Frozen tutorial in Arabic (RTL)', async ({page}) => {
    const lab = new LegacyBlocklyLab(page);
    await lab.gotoLevel({lesson: 3, level: 10, lang: 'ar-sa'});

    await expectElementHasI18nText({
      locator: lab.instructionsText,
      locale: 'ar-SA',
      key: 'data.short_instructions.frozen square loop 3x',
    });
    await expect(lab.runButton).toBeVisible();
    await expect(lab.resetButton).toBeHidden();
    await expectElementHasI18nText({
      locator: lab.instructionsText,
      locale: 'ar-SA',
      key: 'data.short_instructions.frozen square loop 3x',
    });
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/foundations/i18n.feature "Minecraft:Agent tutorial in Arabic (RTL)"
   */
  test('Minecraft:Agent tutorial in Arabic (RTL)', async ({page}) => {
    const lab = new CraftLab(page);
    await lab.gotoLevel({lesson: 25, level: 7, lang: 'ar-sa'});

    await expect(lab.instructionsToggleButton).toBeVisible();
    await lab.instructionsToggleButton.click();

    await expectElementHasI18nText({
      locator: lab.instructionsText,
      locale: 'ar-SA',
      key: 'data.short_instructions.MC_HOC_2017_01_RETRY',
    });
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/foundations/i18n.feature "Translated function names in Arabic"
   */
  test('Translated function names in Arabic', async ({page}) => {
    const lab = new LegacyBlocklyLab(page);
    await lab.gotoLevel({lesson: 4, level: 6, lang: 'ar-SA'});

    const key = 'data.function_definitions.2-3 Bee Functions 2.get 5.name';
    await expectElementHasI18nText({
      locator: page.locator("[data-id='toolboxCallBlock'] .blocklyText"),
      locale: 'ar-SA',
      key,
      rtl: true,
    });
    await expectElementHasI18nText({
      locator: page.locator("[data-id='workspaceCallBlock'] .blocklyText"),
      locale: 'ar-SA',
      key,
      rtl: true,
    });
    await expectElementHasI18nText({
      locator: page.locator(
        "[data-id='definitionBlock'] > .blocklyNonEditableField > .blocklyText",
      ),
      locale: 'ar-SA',
      key,
      rtl: true,
    });
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/foundations/i18n.feature "Toolbox Categories in Arabic (RTL)"
   */
  test('Toolbox Categories in Arabic (RTL)', async ({page}) => {
    const lab = new LegacyBlocklyLab(page);
    await lab.gotoLevel({lesson: 45, level: 4, lang: 'ar-sa'});

    for (const [i, category] of TOOLBOX_CATEGORY_KEYS.entries()) {
      await expectElementHasI18nText({
        locator: lab.toolboxCategoryLabel(i + 1),
        locale: 'ar-SA',
        key: `data.block_categories.${category}`,
      });
    }
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/foundations/i18n.feature "Pixelation Widget long and short instructions in Spanish"
   */
  test('Pixelation Widget long and short instructions in Spanish', async ({
    page,
    browserName,
  }) => {
    // WebKit/Safari crashes on Ubuntu 20.04 resolving our 22-family Noto font
    // fallback chain. Fixed in Ubuntu 24.04 — remove when Drone is upgraded.
    // https://github.com/code-dot-org/code-dot-org/issues/73740
    test.fixme(browserName === 'webkit');

    const level = new PixelationLevel(page);
    await level.gotoLevel({lesson: 17, level: 2, lang: 'es-MX'});

    await expectElementHasI18nMarkdown({
      locator: level.instructionsDialog,
      locale: 'es-MX',
      key: 'data.long_instructions.AllTheThings: Pixelation - Lesson 15 - Complete 3-bit color',
    });
    await expectElementHasI18nText({
      locator: level.shortInstructions,
      locale: 'es-MX',
      key: 'data.short_instructions.AllTheThings: Pixelation - Lesson 15 - Complete 3-bit color',
    });
  });
});
