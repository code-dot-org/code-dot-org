import {
  expect,
  test,
  type APIRequestContext,
  type Locator,
  type Page,
} from '@playwright/test';

type Locale = 'es-MX' | 'pt-BR' | 'ar-SA';

const SPANISH = {
  locale: 'es-MX' as const,
  routeLocale: 'es-MX',
};

const PORTUGUESE = {
  locale: 'pt-BR' as const,
  routeLocale: 'pt-br',
};

const ARABIC = {
  locale: 'ar-SA' as const,
  routeLocale: 'ar-sa',
};

const TOOLBOX_CATEGORY_KEYS = [
  'Events',
  'Text',
  'Variables',
  'Effects',
  'Sprites',
  'Functions',
  'Variables',
];

const BEE_FUNCTION_KEY =
  'data.function_definitions.2-3 Bee Functions 2.get 5.name';

const PIXELATION_LONG_INSTRUCTIONS_KEY =
  'data.long_instructions.AllTheThings: Pixelation - Lesson 15 - Complete 3-bit color';

const PIXELATION_SHORT_INSTRUCTIONS_KEY =
  'data.short_instructions.AllTheThings: Pixelation - Lesson 15 - Complete 3-bit color';

/**
 * Page object for localized legacy Blockly levels.
 */
class I18nLevel {
  /** Underlying Playwright page. */
  readonly page: Page;

  /** Runs the current Blockly program. */
  readonly runButton: Locator;

  /** Reset button, hidden until after a run starts. */
  readonly resetButton: Locator;

  /** Minecraft Agent instruction toggle button. */
  readonly toggleButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.runButton = page.locator('#runButton');
    this.resetButton = page.locator('#resetButton');
    this.toggleButton = page.locator('#toggleButton');
  }

  /**
   * Navigate to a localized level and wait for the user-visible run control.
   *
   * @param url - localized Code.org level URL, relative to Playwright baseURL
   */
  async goto(url: string): Promise<void> {
    await this.page.goto(url, {waitUntil: 'domcontentloaded'});
    await expect(this.runButton).toBeVisible({timeout: 60_000});
    await this.dismissOptionalOverlays();
  }

  /**
   * Navigate to a localized non-runnable level and wait for a visible control.
   *
   * @param url - localized Code.org level URL, relative to Playwright baseURL
   * @param readySelector - visible selector that marks the level ready for use
   */
  async gotoNonRunnableLevel(
    url: string,
    readySelector: string,
  ): Promise<void> {
    await this.page.goto(url, {waitUntil: 'domcontentloaded'});
    await expect(this.page.locator(readySelector)).toBeVisible({
      timeout: 60_000,
    });
    await this.dismissOptionalOverlays();
  }

  /**
   * Close optional first-load overlays that can cover otherwise-ready controls.
   */
  async dismissOptionalOverlays(): Promise<void> {
    const videoModal = this.page.locator('.video-modal');
    if (await videoModal.isVisible({timeout: 1000}).catch(() => false)) {
      await videoModal.locator('#x-close').click();
      await expect(videoModal).toBeHidden({timeout: 10_000});
    }

    const modalCloseButton = this.page.locator('.modal #x-close').first();
    if (await modalCloseButton.isVisible({timeout: 1000}).catch(() => false)) {
      await modalCloseButton.click();
      await expect(this.page.locator('.modal-backdrop')).toBeHidden({
        timeout: 10_000,
      });
    }

    const overlay = this.page.locator('#overlay');
    if (await overlay.isVisible({timeout: 1000}).catch(() => false)) {
      await this.page.evaluate(() =>
        (document.querySelector('#overlay') as HTMLElement)?.click(),
      );
    }
  }

  /**
   * Return normalized text from a selector, matching the legacy Cucumber helper.
   *
   * @param selector - CSS selector for the element to read
   * @returns trimmed text with non-breaking spaces normalized to regular spaces
   */
  async normalizedText(selector: string): Promise<string> {
    return this.page
      .locator(selector)
      .evaluate(element =>
        (element.textContent ?? '').replace(/\u00a0/g, ' ').trim(),
      );
  }
}

/**
 * Fetch a localized string through the same endpoint used by Cucumber.
 *
 * @param request - Playwright request context
 * @param locale - target locale
 * @param key - i18n key
 * @returns localized string
 */
async function getI18nText(
  request: APIRequestContext,
  locale: Locale,
  key: string,
): Promise<string> {
  let translatedText = '';
  await expect
    .poll(
      async () => {
        const response = await request.get('/api/test/get_i18n_t', {
          params: {key, locale},
        });
        if (!response.ok()) {
          return '';
        }

        translatedText = (await response.text()).trim();
        return translatedText.startsWith('translation missing:')
          ? ''
          : translatedText;
      },
      {timeout: 15_000},
    )
    .not.toBe('');

  return translatedText;
}

/**
 * Assert an element's normalized text equals the localized string for key.
 *
 * @param level - i18n level page object
 * @param request - Playwright request context
 * @param selector - CSS selector for the element to compare
 * @param locale - target locale
 * @param key - i18n key
 */
async function expectI18nText(
  level: I18nLevel,
  request: APIRequestContext,
  selector: string,
  locale: Locale,
  key: string,
  options: {rtl?: boolean} = {},
): Promise<void> {
  const expectedText = await getI18nText(request, locale, key);
  await expect(level.page.locator(selector)).toBeVisible({timeout: 30_000});
  const actualText = expect.poll(
    async () => await level.normalizedText(selector),
    {timeout: 30_000},
  );
  if (options.rtl) {
    await actualText.toContain(expectedText);
  } else {
    await actualText.toBe(expectedText);
  }
}

/**
 * Assert the standard run/reset state used by localized CSF levels.
 *
 * @param level - i18n level page object
 */
async function expectInitialRunState(level: I18nLevel): Promise<void> {
  await expect(level.runButton).toBeVisible();
  await expect(level.resetButton).toBeHidden();
}

/**
 * Run the HoC tutorial language scenario.
 *
 * @param page - Playwright page
 * @param request - Playwright request context
 * @param locale - canonical locale from the Cucumber scenario
 * @param routeLocale - locale slug used in the level URL
 */
async function expectLocalizedHocTutorial(
  page: Page,
  request: APIRequestContext,
  locale: Locale,
  routeLocale: string,
): Promise<void> {
  const level = new I18nLevel(page);
  await level.goto(`/hoc/15/lang/${routeLocale}`);
  await expectI18nText(
    level,
    request,
    '.csf-top-instructions p',
    locale,
    'data.level.instructions.maze_2_14',
  );
  await expectInitialRunState(level);
  await expectI18nText(
    level,
    request,
    '.csf-top-instructions p',
    locale,
    'data.level.instructions.maze_2_14',
  );
}

/**
 * Run the Frozen tutorial language scenario.
 *
 * @param page - Playwright page
 * @param request - Playwright request context
 * @param locale - canonical locale from the Cucumber scenario
 * @param routeLocale - locale slug used in the level URL
 */
async function expectLocalizedFrozenTutorial(
  page: Page,
  request: APIRequestContext,
  locale: Locale,
  routeLocale: string,
): Promise<void> {
  const level = new I18nLevel(page);
  await level.goto(
    `/courses/frozen/units/1/lessons/1/levels/2/lang/${routeLocale}`,
  );
  await expectI18nText(
    level,
    request,
    '.csf-top-instructions p',
    locale,
    'data.short_instructions.frozen perpendicular',
  );
  await expectInitialRunState(level);
  await expectI18nText(
    level,
    request,
    '.csf-top-instructions p',
    locale,
    'data.short_instructions.frozen perpendicular',
  );
}

/**
 * Run the Minecraft Agent tutorial language scenario.
 *
 * @param page - Playwright page
 * @param request - Playwright request context
 * @param locale - canonical locale from the Cucumber scenario
 * @param routeLocale - locale slug used in the level URL
 */
async function expectLocalizedMinecraftAgentTutorial(
  page: Page,
  request: APIRequestContext,
  locale: Locale,
  routeLocale: string,
): Promise<void> {
  const level = new I18nLevel(page);
  await level.goto(
    `/courses/hero/units/1/lessons/1/levels/1/lang/${routeLocale}`,
  );
  await expect(level.toggleButton).toBeVisible({timeout: 30_000});
  await level.toggleButton.click();
  await expectI18nText(
    level,
    request,
    '.csf-top-instructions p',
    locale,
    'data.short_instructions.MC_HOC_2017_01_RETRY',
  );
}

/**
 * Run the toolbox category language scenario.
 *
 * @param page - Playwright page
 * @param request - Playwright request context
 * @param locale - canonical locale from the Cucumber scenario
 * @param routeLocale - locale slug used in the level URL
 */
async function expectLocalizedToolboxCategories(
  page: Page,
  request: APIRequestContext,
  locale: Locale,
  routeLocale: string,
): Promise<void> {
  const level = new I18nLevel(page);
  await level.goto(
    `/courses/allthethingscourse/units/1/lessons/45/levels/4/lang/${routeLocale}`,
  );

  for (const [index, categoryKey] of TOOLBOX_CATEGORY_KEYS.entries()) {
    await expectI18nText(
      level,
      request,
      `.blocklyToolboxCategoryContainer#blockly-${index + 1}`,
      locale,
      `data.block_categories.${categoryKey}`,
    );
  }
}

/**
 * Run the Bee function-name language scenario.
 *
 * @param page - Playwright page
 * @param request - Playwright request context
 * @param locale - canonical locale from the Cucumber scenario
 * @param routeLocale - locale slug used in the level URL
 */
async function expectLocalizedFunctionNames(
  page: Page,
  request: APIRequestContext,
  locale: Locale,
  routeLocale: string,
  options: {rtl?: boolean} = {},
): Promise<void> {
  const level = new I18nLevel(page);
  await level.goto(
    `/courses/allthethingscourse/units/1/lessons/4/levels/6/lang/${routeLocale}`,
  );

  await expectI18nText(
    level,
    request,
    "[data-id='toolboxCallBlock'] .blocklyText",
    locale,
    BEE_FUNCTION_KEY,
    options,
  );
  await expectI18nText(
    level,
    request,
    "[data-id='workspaceCallBlock'] .blocklyText",
    locale,
    BEE_FUNCTION_KEY,
    options,
  );
  await expectI18nText(
    level,
    request,
    "[data-id='definitionBlock'] > .blocklyNonEditableField > .blocklyText",
    locale,
    BEE_FUNCTION_KEY,
    options,
  );
}

/**
 * Convert the simple localized markdown in the pixelation fixture to text.
 *
 * @param markdown - markdown returned by the test i18n endpoint
 * @returns rendered-text equivalent with markdown syntax removed
 */
function textFromPixelationMarkdown(markdown: string): string {
  return markdown
    .replace(/^#+\s*/gm, '')
    .replace(/^\s*-\s*/gm, '')
    .replace(/\*\*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Return normalized visible text from a locator.
 *
 * @param locator - Playwright locator to read
 * @returns text with collapsed whitespace
 */
async function normalizedLocatorText(locator: Locator): Promise<string> {
  return locator.evaluate(element =>
    (element.textContent ?? '').replace(/\s+/g, ' ').trim(),
  );
}

/**
 * Run the Pixelation localized markdown scenario.
 *
 * @param page - Playwright page
 * @param request - Playwright request context
 */
async function expectLocalizedPixelationInstructions(
  page: Page,
  request: APIRequestContext,
): Promise<void> {
  const level = new I18nLevel(page);
  await level.gotoNonRunnableLevel(
    '/courses/allthethingscourse/units/1/lessons/17/levels/2/lang/es-MX',
    '#below_viz_instructions',
  );

  const belowInstructions = page.locator('#below_viz_instructions');
  await belowInstructions.click();
  const markdownContainer = page.locator(
    '.markdown-instructions-container .instructions-markdown > div',
  );
  await expect(markdownContainer).toBeVisible({timeout: 30_000});

  const expectedMarkdown = await getI18nText(
    request,
    SPANISH.locale,
    PIXELATION_LONG_INSTRUCTIONS_KEY,
  );
  await expect
    .poll(async () => normalizedLocatorText(markdownContainer), {
      timeout: 30_000,
    })
    .toBe(textFromPixelationMarkdown(expectedMarkdown));

  await expectI18nText(
    level,
    request,
    '#below_viz_instructions',
    SPANISH.locale,
    PIXELATION_SHORT_INSTRUCTIONS_KEY,
  );
}

test.describe('Legacy i18n localized tutorials', () => {
  /**
   * Source: dashboard/test/ui/features/foundations/i18n.feature
   * Scenario: HoC tutorial in Spanish
   */
  test('HoC tutorial in Spanish', async ({page, request}) => {
    await expectLocalizedHocTutorial(
      page,
      request,
      SPANISH.locale,
      SPANISH.routeLocale,
    );
  });

  /**
   * Source: dashboard/test/ui/features/foundations/i18n.feature
   * Scenario: Frozen tutorial in Spanish
   */
  test('Frozen tutorial in Spanish', async ({page, request}) => {
    await expectLocalizedFrozenTutorial(
      page,
      request,
      SPANISH.locale,
      SPANISH.routeLocale,
    );
  });

  /**
   * Source: dashboard/test/ui/features/foundations/i18n.feature
   * Scenario: Minecraft:Agent tutorial in Spanish
   */
  test('Minecraft:Agent tutorial in Spanish', async ({page, request}) => {
    await expectLocalizedMinecraftAgentTutorial(
      page,
      request,
      SPANISH.locale,
      SPANISH.routeLocale,
    );
  });

  /**
   * Source: dashboard/test/ui/features/foundations/i18n.feature
   * Scenario: Toolbox Categories in Spanish
   */
  test('Toolbox Categories in Spanish', async ({page, request}) => {
    await expectLocalizedToolboxCategories(
      page,
      request,
      SPANISH.locale,
      SPANISH.routeLocale,
    );
  });

  /**
   * Source: dashboard/test/ui/features/foundations/i18n.feature
   * Scenario: Translated function names in Spanish
   */
  test('Translated function names in Spanish', async ({page, request}) => {
    await expectLocalizedFunctionNames(
      page,
      request,
      SPANISH.locale,
      SPANISH.routeLocale,
    );
  });

  /**
   * Source: dashboard/test/ui/features/foundations/i18n.feature
   * Scenario: HoC tutorial in Portuguese
   */
  test('HoC tutorial in Portuguese', async ({page, request}) => {
    await expectLocalizedHocTutorial(
      page,
      request,
      PORTUGUESE.locale,
      PORTUGUESE.routeLocale,
    );
  });

  /**
   * Source: dashboard/test/ui/features/foundations/i18n.feature
   * Scenario: Frozen tutorial in Portuguese
   * @no_ci
   */
  test('Frozen tutorial in Portuguese', async ({page, request}) => {
    await expectLocalizedFrozenTutorial(
      page,
      request,
      PORTUGUESE.locale,
      PORTUGUESE.routeLocale,
    );
  });

  /**
   * Source: dashboard/test/ui/features/foundations/i18n.feature
   * Scenario: Minecraft:Agent tutorial in Portuguese
   */
  test('Minecraft:Agent tutorial in Portuguese', async ({page, request}) => {
    await expectLocalizedMinecraftAgentTutorial(
      page,
      request,
      PORTUGUESE.locale,
      PORTUGUESE.routeLocale,
    );
  });

  /**
   * Source: dashboard/test/ui/features/foundations/i18n.feature
   * Scenario: Toolbox Categories in Portuguese
   */
  test('Toolbox Categories in Portuguese', async ({page, request}) => {
    await expectLocalizedToolboxCategories(
      page,
      request,
      PORTUGUESE.locale,
      PORTUGUESE.routeLocale,
    );
  });

  /**
   * Source: dashboard/test/ui/features/foundations/i18n.feature
   * Scenario: Translated function names in Portuguese
   */
  test('Translated function names in Portuguese', async ({page, request}) => {
    await expectLocalizedFunctionNames(
      page,
      request,
      PORTUGUESE.locale,
      'pt-BR',
    );
  });

  /**
   * Source: dashboard/test/ui/features/foundations/i18n.feature
   * Scenario: HoC tutorial in Arabic (RTL)
   */
  test('HoC tutorial in Arabic (RTL)', async ({page, request}) => {
    await expectLocalizedHocTutorial(
      page,
      request,
      ARABIC.locale,
      ARABIC.routeLocale,
    );
  });

  /**
   * Source: dashboard/test/ui/features/foundations/i18n.feature
   * Scenario: Frozen tutorial in Arabic (RTL)
   */
  test('Frozen tutorial in Arabic (RTL)', async ({page, request}) => {
    await expectLocalizedFrozenTutorial(
      page,
      request,
      ARABIC.locale,
      ARABIC.routeLocale,
    );
  });

  /**
   * Source: dashboard/test/ui/features/foundations/i18n.feature
   * Scenario: Minecraft:Agent tutorial in Arabic (RTL)
   */
  test('Minecraft:Agent tutorial in Arabic (RTL)', async ({page, request}) => {
    await expectLocalizedMinecraftAgentTutorial(
      page,
      request,
      ARABIC.locale,
      ARABIC.routeLocale,
    );
  });

  /**
   * Source: dashboard/test/ui/features/foundations/i18n.feature
   * Scenario: Translated function names in Arabic
   */
  test('Translated function names in Arabic', async ({page, request}) => {
    await expectLocalizedFunctionNames(page, request, ARABIC.locale, 'ar-SA', {
      rtl: true,
    });
  });

  /**
   * Source: dashboard/test/ui/features/foundations/i18n.feature
   * Scenario: Toolbox Categories in Arabic (RTL)
   */
  test('Toolbox Categories in Arabic (RTL)', async ({page, request}) => {
    await expectLocalizedToolboxCategories(
      page,
      request,
      ARABIC.locale,
      ARABIC.routeLocale,
    );
  });

  /**
   * Source: dashboard/test/ui/features/foundations/i18n.feature
   * Scenario: Pixelation Widget long and short instructions in Spanish
   */
  test('Pixelation Widget long and short instructions in Spanish', async ({
    page,
    request,
  }) => {
    await expectLocalizedPixelationInstructions(page, request);
  });
});
