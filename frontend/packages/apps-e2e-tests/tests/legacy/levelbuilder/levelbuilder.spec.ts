import {expect, test} from '../../shared/fixtures';

import {LevelbuilderPage} from './LevelbuilderPage';

/**
 * Levelbuilder editor scenarios.
 *
 * Sources:
 *   dashboard/test/ui/features/teacher_tools/levelbuilder/create_and_delete_data_docs.feature
 *   dashboard/test/ui/features/teacher_tools/levelbuilder/lesson_edit_page.feature
 *   dashboard/test/ui/features/teacher_tools/levelbuilder/level_edit_page.feature
 *   dashboard/test/ui/features/teacher_tools/levelbuilder/modular_courses.feature
 *   dashboard/test/ui/features/teacher_tools/levelbuilder/new_unit_page.feature
 *   dashboard/test/ui/features/teacher_tools/levelbuilder/script_edit_page.feature
 */

test.describe('Levelbuilder — data docs', {tag: '@no_mobile'}, () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/levelbuilder/create_and_delete_data_docs.feature
   * Scenario: Create new data doc, see it on index page, and delete it
   */
  test('creates, edits, and deletes a data doc', async ({page}) => {
    const levelbuilder = new LevelbuilderPage(page);
    await levelbuilder.createLevelbuilder('Angela');
    const key = levelbuilder.uniqueSlug('temp-data-doc');
    const name = `A Name: ${key}`;

    await page.goto('/data_docs/edit', {waitUntil: 'domcontentloaded'});
    await expect(page.locator('#edit-all-data-docs')).toBeVisible({
      timeout: 30_000,
    });
    await page.locator('#create_new_data_doc').click();
    await expect(page.locator('#form')).toBeVisible({timeout: 30_000});

    await page.locator("input[name='key']").fill(key);
    await page.locator("input[name='name']").fill(name);
    await page.locator('textarea').fill('Description of Doc');
    await Promise.all([
      page.waitForURL(`/data_docs/${key}`, {timeout: 30_000}),
      page.locator("button[type='submit']").click(),
    ]);
    await expect(levelbuilder.dataDocView).toBeVisible({timeout: 30_000});
    await expect(page.locator('h1')).toContainText(name);
    await expect(page.locator('div#data-doc-content')).toContainText(
      'Description of Doc',
    );

    await page.goto('/data_docs', {waitUntil: 'domcontentloaded'});
    await expect(page.locator('#see-data-docs')).toBeVisible({
      timeout: 30_000,
    });
    const dataDocLink = page.locator('a', {hasText: name});
    await expect(dataDocLink).toBeVisible();
    await expect(dataDocLink).toHaveAttribute('href', new RegExp(key));

    await page.goto('/data_docs/edit', {waitUntil: 'domcontentloaded'});
    await expect(page.locator('a', {hasText: name})).toBeVisible({
      timeout: 30_000,
    });
    await page.locator(`#edit_${key}`).click();
    await expect(levelbuilder.dataDocEdit).toBeVisible({timeout: 30_000});
    await page.locator('textarea').fill('New description of Doc');
    await Promise.all([
      page.waitForURL(`/data_docs/${key}`, {timeout: 30_000}),
      page.locator("button[type='submit']").click(),
    ]);
    await expect(levelbuilder.dataDocView).toBeVisible({timeout: 30_000});
    await expect(page.locator('h1')).toContainText(name);
    await expect(page.locator('div#data-doc-content')).toContainText(
      'New description of Doc',
    );

    await page.goto('/data_docs/edit', {waitUntil: 'domcontentloaded'});
    await expect(page.locator('#edit-all-data-docs')).toBeVisible({
      timeout: 30_000,
    });
    await page.locator(`#delete_${key}`).click();
    await expect(page.locator('.modal-body')).toBeVisible({timeout: 30_000});
    await expect(page.locator('.modal-body button').last()).toContainText(
      'Delete',
    );
    await page.locator('.modal-body button').last().click();
    await expect(page.locator('.modal-body')).toBeHidden({timeout: 30_000});
    await expect(page.locator('a', {hasText: name})).toHaveCount(0);
  });
});

test.describe('Levelbuilder — lesson edit page', {tag: '@no_mobile'}, () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/levelbuilder/lesson_edit_page.feature
   * Scenario: Save changes using the lesson edit page for lesson without lesson plan
   */
  test('saves a lesson without lesson plan', async ({page}) => {
    const levelbuilder = new LevelbuilderPage(page);
    await levelbuilder.createLevelbuilder('Levi');
    const unit = await levelbuilder.createTempMigratedUnit();
    try {
      await levelbuilder.gotoLessonEdit(unit.lessonWithoutLessonPlanId);
      await expect(page.locator('h1')).toContainText('Editing Lesson');
      await expect(page.locator('h1')).toContainText(
        'Temp Lesson Without Lesson Plan',
      );
      await expect(page.locator('.uitest-activity-card')).toBeVisible({
        timeout: 30_000,
      });
      await expect(page.locator('.uitest-open-add-level-button')).toBeVisible();
      await expect(page.locator('.progress-bubble')).toHaveCount(0);

      await levelbuilder.submitAndWaitFor(
        page.locator("button[type='submit']"),
        page.locator('#script-title'),
      );
    } finally {
      await levelbuilder.destroyTempUnit(unit.scriptName);
    }
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/levelbuilder/lesson_edit_page.feature
   * Scenario: Save changes using the lesson edit page
   */
  test('saves activity name and duration changes', async ({page}) => {
    const levelbuilder = new LevelbuilderPage(page);
    await levelbuilder.createLevelbuilder('Levi');
    const unit = await levelbuilder.createTempMigratedUnit();
    try {
      await levelbuilder.gotoLessonEdit(unit.lessonId);
      await expect(page.locator('h1')).toContainText('Editing Lesson');
      await expect(page.locator('h1')).toContainText('Temp Lesson');
      await expect(page.locator('.uitest-activity-card')).toBeVisible({
        timeout: 30_000,
      });

      await page.locator('.uitest-activity-name-input').fill('Temp Activity');
      await page.locator('.uitest-activity-duration-input').fill('15');
      await levelbuilder.submitAndWaitFor(
        page.locator("button[type='submit']"),
        levelbuilder.lessonShowContainer,
      );
      await expect(
        page.getByRole('heading', {name: 'Temp Activity (15 minutes)'}),
      ).toBeVisible({timeout: 30_000});

      await levelbuilder.gotoLessonEdit(unit.lessonId);
      await expect(page.locator('.uitest-activity-name-input')).toHaveValue(
        'Temp Activity',
      );
      await expect(page.locator('.uitest-activity-duration-input')).toHaveValue(
        '15',
      );
    } finally {
      await levelbuilder.destroyTempUnit(unit.scriptName);
    }
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/levelbuilder/lesson_edit_page.feature
   * Scenario: Add a level using the lesson edit page
   */
  test('adds an Artist level to a lesson', async ({page}) => {
    const levelbuilder = new LevelbuilderPage(page);
    await levelbuilder.createLevelbuilder('Levi');
    const unit = await levelbuilder.createTempMigratedUnit();
    try {
      await levelbuilder.gotoLessonEdit(unit.lessonId);
      await expect(page.locator('.uitest-activity-card')).toBeVisible({
        timeout: 30_000,
      });
      await expect(page.locator('.uitest-open-add-level-button')).toBeVisible();
      await expect(
        page.locator('.progress-bubble').filter({hasText: /^1$/}).first(),
      ).toBeVisible();
      await expect(
        page.locator('.progress-bubble').filter({hasText: /^2$/}),
      ).toHaveCount(0);

      await page.locator('.uitest-open-add-level-button').first().click();
      const addLevelsHeading = page.getByRole('heading', {name: 'Add Levels'});
      await expect(addLevelsHeading).toBeVisible({timeout: 30_000});
      await expect(page.locator('#add-level-type')).toBeVisible();
      await page.locator('#add-level-type').selectOption({label: 'Artist'});
      await page
        .locator('.uitest-add-level-name-input')
        .fill('Standalone_Artist_1');
      await page.locator('.fa-magnifying-glass').click();
      const artistRow = page
        .locator('.uitest-level-dialog-content tr')
        .filter({hasText: 'Standalone_Artist_1'})
        .first();
      await expect(artistRow).toBeVisible({timeout: 30_000});
      await artistRow.locator('.fa-plus').click();
      await page.locator('.save-add-levels-button').click();
      await expect(addLevelsHeading).toBeHidden({
        timeout: 30_000,
      });

      await expect(
        page.locator('.progress-bubble').filter({hasText: /^2$/}).first(),
      ).toBeVisible();
      await expect(
        page
          .locator('.uitest-level-token-name')
          .filter({hasText: 'Standalone_Artist_1'}),
      ).toBeVisible();
      await levelbuilder.submitAndWaitFor(
        page.locator("button[type='submit']"),
        levelbuilder.lessonShowContainer,
      );
      await expect(
        page.locator('.progress-bubble').filter({hasText: /^2$/}).first(),
      ).toBeVisible();
    } finally {
      await levelbuilder.destroyTempUnit(unit.scriptName);
    }
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/levelbuilder/lesson_edit_page.feature
   * Scenario: Update script level properties
   */
  test(
    'updates script level properties',
    {tag: '@no_firefox'},
    async ({browserName, page}) => {
      test.skip(
        browserName === 'firefox',
        'Source scenario is tagged @no_firefox.',
      );
      const levelbuilder = new LevelbuilderPage(page);
      await levelbuilder.createLevelbuilder('Levi');
      const unit = await levelbuilder.createTempMigratedUnit();
      try {
        await levelbuilder.gotoLessonEdit(unit.lessonId);
        await expect(page.locator('.uitest-activity-card')).toBeVisible({
          timeout: 30_000,
        });
        await page.locator('.uitest-level-token-name').click();
        await expect(page.locator('.level-token-checkboxes')).toBeVisible({
          timeout: 30_000,
        });
        const named = page
          .locator('.level-token-checkboxes input[type=checkbox]')
          .nth(1);
        await expect(named).not.toBeChecked();
        await named.check();
        await expect(named).toBeChecked();

        await levelbuilder.submitAndWaitFor(
          page.locator("button[type='submit']"),
          levelbuilder.lessonShowContainer,
        );
        await expect(
          page.locator('.uitest-ProgressPill .fa-check'),
        ).toBeVisible({timeout: 30_000});

        await levelbuilder.gotoLessonEdit(unit.lessonId);
        await page.locator('.uitest-level-token-name').click();
        await expect(page.locator('.level-token-checkboxes')).toBeVisible({
          timeout: 30_000,
        });
        await expect(
          page.locator('.level-token-checkboxes input[type=checkbox]').nth(1),
        ).toBeChecked();
      } finally {
        await levelbuilder.destroyTempUnit(unit.scriptName);
      }
    },
  );
});

test.describe('Levelbuilder — level edit page', {tag: '@no_mobile'}, () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/levelbuilder/level_edit_page.feature
   * Scenario: Update a Multi level
   */
  test('updates a Multi level', async ({page}) => {
    const levelbuilder = new LevelbuilderPage(page);
    await levelbuilder.createLevelbuilder('Levi');
    const level = await levelbuilder.createTempMultiLevel();
    try {
      await expect(page).toHaveURL(new RegExp(`/levels/${level.id}/edit`));
      await levelbuilder.fillMultiDsl(level.name);
      await page.locator("input[type='submit']").click();
      await expect(page).toHaveURL(new RegExp(`/levels/${level.id}`), {
        timeout: 30_000,
      });
      await expect(page.locator('body')).toContainText('incorrect answer', {
        timeout: 30_000,
      });
    } finally {
      await levelbuilder.destroyTempLevel(level.id);
    }
  });
});

test.describe('Levelbuilder — modular courses', {tag: '@no_mobile'}, () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/levelbuilder/modular_courses.feature
   * Scenario: Create a new course assigned to a shared unit
   */
  test('creates a course assigned to a shared unit', async ({page}) => {
    const levelbuilder = new LevelbuilderPage(page);
    await levelbuilder.createLevelbuilder('Levi');
    const unit = await levelbuilder.createTempMigratedUnit();
    const familyName = levelbuilder.uniqueSlug('temp-course');
    try {
      await page.goto('/courses/new', {waitUntil: 'domcontentloaded'});
      await expect(page.locator('.familyNameSelector')).toBeVisible({
        timeout: 30_000,
      });
      await page.locator('.familyNameInput').fill(familyName);
      await expect(page.locator('.isVersionedSelector')).toBeVisible({
        timeout: 30_000,
      });
      await page.locator('.isVersionedSelector').selectOption({label: 'No'});
      await Promise.all([
        page.waitForURL(`/courses/${familyName}/edit`, {timeout: 30_000}),
        page.locator("button[type='submit']").click(),
      ]);
      await expect(levelbuilder.courseEditForm).toBeVisible({timeout: 30_000});

      await page
        .locator('.uitest-unit-selector')
        .last()
        .selectOption(unit.scriptName);
      await page
        .locator('.uitest-unit-selector')
        .last()
        .selectOption('ui-test-shared-unit');
      await Promise.all([
        page.waitForURL(`/courses/${familyName}`, {timeout: 30_000}),
        page.locator("button[type='submit']").click(),
      ]);
      await expect(levelbuilder.courseOverview).toBeVisible({timeout: 30_000});
      await expect(
        page
          .locator('.uitest-CourseScript')
          .filter({hasText: 'UI Test Shared Unit'}),
      ).toBeVisible();

      await page.goto('/courses/ui-test-course-2017', {
        waitUntil: 'domcontentloaded',
      });
      await expect(
        page
          .locator('.uitest-CourseScript')
          .filter({hasText: 'UI Test Shared Unit'}),
      ).toBeVisible({timeout: 30_000});
    } finally {
      await levelbuilder.destroyTempUnit(unit.scriptName);
      await levelbuilder.destroyTempCourse(familyName);
    }
  });
});

test.describe('Levelbuilder — new unit page', {tag: '@no_mobile'}, () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/levelbuilder/new_unit_page.feature
   * Scenario: Create a new unit
   */
  test('creates a new unit', async ({page}) => {
    const levelbuilder = new LevelbuilderPage(page);
    await levelbuilder.createLevelbuilder('Levi');
    const scriptName = levelbuilder.uniqueSlug('temp-script');
    let created = false;
    try {
      await page.goto('/s/new', {waitUntil: 'domcontentloaded'});
      await expect(page.locator("input[name='script[name]']")).toBeVisible({
        timeout: 30_000,
      });
      await page.locator("input[name='script[name]']").fill(scriptName);
      await page.getByRole('button', {name: 'Save Changes'}).click();
      await expect(page.locator('.submitDialog')).toBeVisible({
        timeout: 30_000,
      });
      await Promise.all([
        page.waitForURL(`/s/${scriptName}/edit`, {timeout: 30_000}),
        page.getByRole('button', {name: 'Submit'}).click(),
      ]);
      await expect(levelbuilder.unitEditForm).toBeVisible({timeout: 30_000});
      created = true;

      await levelbuilder.submitAndWaitFor(
        page.locator("button[type='submit']"),
        page.locator('.unit-overview-top-row'),
      );
      await expect(page).toHaveURL(new RegExp(`/s/${scriptName}`));
    } finally {
      if (created) {
        await levelbuilder.destroyTempUnit(scriptName);
      }
    }
  });
});

test.describe(
  'Levelbuilder — unit edit page',
  {tag: ['@no_mobile', '@no_safari']},
  () => {
    test.beforeEach(({browserName}) => {
      test.skip(
        browserName === 'webkit',
        'Source feature is tagged @no_safari.',
      );
    });

    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/teacher_tools/levelbuilder/script_edit_page.feature
     * Scenario: View the unit edit page
     */
    test('views the unit edit page', async ({page}) => {
      const levelbuilder = new LevelbuilderPage(page);
      await levelbuilder.createLevelbuilder('Levi');
      const unit = await levelbuilder.createTempMigratedUnit();
      try {
        await levelbuilder.gotoUnitOverview(unit.scriptName);
        await levelbuilder.gotoUnitEdit(unit.scriptName);
      } finally {
        await levelbuilder.destroyTempUnit(unit.scriptName);
      }
    });

    /**
     * Migration status: SKIPPED
     * Source: dashboard/test/ui/features/teacher_tools/levelbuilder/script_edit_page.feature
     * Scenario: View the unit edit page in locale besides en-US
     */
    test.skip('redirects non-English levelbuilder edit page to home', async () => {
      test.skip(
        true,
        'Source Cucumber scenario is tagged @skip pending TEACH-2134 toast behavior.',
      );
    });

    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/teacher_tools/levelbuilder/script_edit_page.feature
     * Scenario: Save changes to a unit
     */
    test('saves lesson deletion on a unit', async ({page}) => {
      const levelbuilder = new LevelbuilderPage(page);
      await levelbuilder.createLevelbuilder('Levi');
      const unit = await levelbuilder.createTempMigratedUnit();
      try {
        await levelbuilder.gotoUnitOverview(unit.scriptName);
        await expect(
          page.locator('.uitest-progress-lesson').first(),
        ).toContainText('Lesson 1:');
        await expect(
          page.locator('.uitest-progress-lesson').nth(1),
        ).toContainText('Lesson 2:');

        await levelbuilder.gotoUnitEdit(unit.scriptName);
        await page.locator('.uitest-unit-card').scrollIntoViewIfNeeded();
        await expect(
          page.locator('.uitest-lesson-token-contents').first(),
        ).toContainText('Temp Lesson With Lesson Plan');
        await expect(
          page.locator('.uitest-lesson-token-contents').last(),
        ).toContainText('Temp Lesson Without Lesson Plan');

        await page
          .locator('.uitest-lesson-token-contents')
          .filter({hasText: 'Temp Lesson Without Lesson Plan'})
          .locator('xpath=.//*[contains(@class, "fa-xmark")]/parent::*')
          .click();
        await expect(page.locator('.modal-body')).toBeVisible({
          timeout: 30_000,
        });
        await expect(page.locator('.modal-body button').last()).toContainText(
          'Delete',
        );
        await page.locator('.modal-body button').last().click();
        await expect(page.locator('.modal-body')).toBeHidden({timeout: 30_000});
        await expect(page.locator('.uitest-lesson-token-contents')).toHaveCount(
          1,
        );
        await levelbuilder.invalidateTempUnit(unit.scriptName);
        await levelbuilder.submitAndWaitFor(
          page.locator('.btn-primary'),
          page.locator('#script-title'),
        );

        await expect(
          page.locator('.uitest-progress-lesson').first(),
        ).toContainText('Lesson 1:');
        await expect(
          page
            .locator('.uitest-progress-lesson')
            .filter({hasText: 'Lesson 2:'}),
        ).toHaveCount(0);
      } finally {
        await levelbuilder.destroyTempUnit(unit.scriptName);
      }
    });

    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/teacher_tools/levelbuilder/script_edit_page.feature
     * Scenario: Navigate from unit edit page for migrated unit to lesson edit page
     */
    test('navigates from unit edit page to lesson edit page', async ({
      context,
      page,
    }) => {
      const levelbuilder = new LevelbuilderPage(page);
      await levelbuilder.createLevelbuilder('Levi');
      const unit = await levelbuilder.createTempMigratedUnit();
      try {
        await levelbuilder.gotoUnitOverview(unit.scriptName);
        await levelbuilder.gotoUnitEdit(unit.scriptName);
        await expect(page.locator('.fa-pen').first()).toBeVisible({
          timeout: 30_000,
        });
        await page.locator('.fa-pen').first().scrollIntoViewIfNeeded();
        const [newPage] = await Promise.all([
          context.waitForEvent('page', {timeout: 30_000}),
          page.locator('.fa-pen').first().click(),
        ]);
        await newPage.waitForLoadState('domcontentloaded');
        await expect(newPage.locator('#edit-container')).toBeVisible({
          timeout: 30_000,
        });
        await expect(newPage.locator('h1')).toContainText('Editing Lesson');
        await expect(newPage.locator('h1')).toContainText('Temp Lesson');
        await newPage.close();
      } finally {
        await levelbuilder.destroyTempUnit(unit.scriptName);
      }
    });
  },
);
