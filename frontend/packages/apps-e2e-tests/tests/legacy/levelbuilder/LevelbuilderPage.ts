import {
  expect,
  type APIResponse,
  type Locator,
  type Page,
} from '@playwright/test';

import {createTeacher, type UserCredentials} from '../../shared/auth';

interface TempUnit {
  scriptName: string;
  lessonId: number;
  lessonWithoutLessonPlanId: number;
}

interface TempCourse {
  courseName: string;
}

interface TempLevel {
  id: string;
  name: string;
}

/**
 * Page object and test-only API helpers for levelbuilder migration ports.
 */
export class LevelbuilderPage {
  readonly page: Page;
  readonly unitEditForm: Locator;
  readonly lessonEditContainer: Locator;
  readonly lessonShowContainer: Locator;
  readonly courseOverview: Locator;
  readonly courseEditForm: Locator;
  readonly dataDocView: Locator;
  readonly dataDocEdit: Locator;
  private cachedCsrfToken?: string;

  /**
   * @param page - Playwright page for the current levelbuilder scenario
   */
  constructor(page: Page) {
    this.page = page;
    this.unitEditForm = page.locator('.edit_unit');
    this.lessonEditContainer = page.locator('#edit-container');
    this.lessonShowContainer = page.locator('#show-container');
    this.courseOverview = page.locator('#course_overview');
    this.courseEditForm = page.locator('.edit_unit_group');
    this.dataDocView = page.locator('#view-data-doc');
    this.dataDocEdit = page.locator('#edit-data-doc');
  }

  /**
   * Create a teacher, grant levelbuilder access, and leave the session signed in.
   *
   * @param name - levelbuilder display name
   */
  async createLevelbuilder(name: string): Promise<UserCredentials> {
    const credentials = await createTeacher(this.page, {name});
    await this.postTestEndpoint(
      '/api/test/levelbuilder_access',
      {},
      'grant levelbuilder access',
    );
    return credentials;
  }

  /**
   * Create a temporary migrated unit with lessons via the Cucumber test API.
   */
  async createTempMigratedUnit(): Promise<TempUnit> {
    const response = await this.postTestEndpoint<{
      script_name: string;
      lesson_id: number;
      lesson_without_lesson_plan_id: number;
    }>('/api/test/create_migrated_script', {}, 'create migrated unit');
    return {
      scriptName: response.script_name,
      lessonId: response.lesson_id,
      lessonWithoutLessonPlanId: response.lesson_without_lesson_plan_id,
    };
  }

  /**
   * Remove a temporary unit created by the test controller.
   *
   * @param scriptName - unit slug
   */
  async destroyTempUnit(scriptName: string): Promise<void> {
    await this.postTestEndpoint(
      '/api/test/destroy_script',
      {script_name: scriptName},
      'destroy unit',
    );
  }

  /**
   * Invalidate a temporary unit cache entry after editing its lessons.
   *
   * @param scriptName - unit slug
   */
  async invalidateTempUnit(scriptName: string): Promise<void> {
    await this.postTestEndpoint(
      '/api/test/invalidate_script',
      {script_name: scriptName},
      'invalidate unit',
    );
  }

  /**
   * Create a temporary course via the Cucumber test API.
   */
  async createTempCourse(): Promise<TempCourse> {
    const response = await this.postTestEndpoint<{course_name: string}>(
      '/api/test/create_course',
      {},
      'create course',
    );
    return {courseName: response.course_name};
  }

  /**
   * Remove a temporary course created by the test controller.
   *
   * This is cleanup-only. A missing course means an earlier cleanup attempt
   * already removed it.
   *
   * @param courseName - course slug
   */
  async destroyTempCourse(courseName: string): Promise<void> {
    const csrf = await this.csrfToken();
    const response = await this.page.request.post('/api/test/destroy_course', {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrf,
      },
      data: {course_name: courseName},
    });

    if (response.status() === 404) {
      return;
    }

    await this.parseJson(response, 'destroy course');
  }

  /**
   * Create a temporary Multi level through the levelbuilder UI.
   */
  async createTempMultiLevel(): Promise<TempLevel> {
    const name = this.uniqueSlug('temp-level');
    await this.page.goto('/levels/new?type=Multi', {
      waitUntil: 'domcontentloaded',
    });
    await expect(this.page.locator('#level_dsl_text')).toBeVisible({
      timeout: 30_000,
    });
    await this.fillMultiDsl(name);
    await Promise.all([
      this.page.waitForURL(/\/levels\/\d+\/edit/, {timeout: 30_000}),
      this.page.locator("input[type='submit']").click(),
    ]);
    const match = this.page.url().match(/\/levels\/(\d+)\/edit/);
    if (!match) {
      throw new Error(`could not parse temp level id from ${this.page.url()}`);
    }
    return {id: match[1], name};
  }

  /**
   * Remove a temporary level created through the levelbuilder UI.
   *
   * @param levelId - numeric level id as a string
   */
  async destroyTempLevel(levelId: string): Promise<void> {
    await this.postTestEndpoint(
      '/api/test/destroy_level',
      {id: levelId},
      'destroy level',
    );
  }

  /**
   * Visit the unit edit page and wait for its visible form.
   *
   * @param scriptName - unit slug
   */
  async gotoUnitEdit(scriptName: string): Promise<void> {
    await this.page.goto(`/s/${scriptName}/edit`, {
      waitUntil: 'domcontentloaded',
    });
    await expect(this.unitEditForm).toBeVisible({timeout: 30_000});
  }

  /**
   * Visit the unit overview page and wait for its visible title row.
   *
   * @param scriptName - unit slug
   */
  async gotoUnitOverview(scriptName: string): Promise<void> {
    await this.page.goto(`/s/${scriptName}`, {waitUntil: 'domcontentloaded'});
    await expect(this.page.locator('#script-title')).toBeVisible({
      timeout: 30_000,
    });
  }

  /**
   * Visit a lesson edit page and wait for the lesson editor shell.
   *
   * @param lessonId - lesson id
   */
  async gotoLessonEdit(lessonId: number): Promise<void> {
    await this.page.goto(`/lessons/${lessonId}/edit`, {
      waitUntil: 'domcontentloaded',
    });
    await expect(this.lessonEditContainer).toBeVisible({timeout: 30_000});
  }

  /**
   * Submit the current Rails form and wait for a visible selector on the next page.
   *
   * @param submit - submit button locator
   * @param ready - selector expected after navigation
   */
  async submitAndWaitFor(submit: Locator, ready: Locator): Promise<void> {
    await submit.click();
    await this.page.waitForLoadState('domcontentloaded');
    await expect(ready).toBeVisible({timeout: 30_000});
  }

  /**
   * Fill the temporary Multi level DSL.
   *
   * @param name - level name
   */
  async fillMultiDsl(name: string): Promise<void> {
    const dsl = [
      `name '${name}'`,
      "title 'title'",
      "description 'description here'",
      "question 'Question'",
      "wrong 'incorrect answer'",
      "right 'correct answer'",
      '',
    ].join('\n');
    await this.page.locator('#level_dsl_text').fill(dsl);
  }

  /**
   * Generate a Cucumber-compatible temporary slug.
   *
   * @param prefix - slug prefix
   */
  uniqueSlug(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
  }

  /**
   * POST JSON to a test-only endpoint using the current session.
   *
   * @param url - dashboard path
   * @param data - JSON request body
   * @param action - label for failure messages
   */
  private async postTestEndpoint<T = object>(
    url: string,
    data: object,
    action: string,
  ): Promise<T> {
    const csrf = await this.csrfToken();
    return this.parseJson<T>(
      await this.page.request.post(url, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrf,
        },
        data,
      }),
      action,
    );
  }

  /**
   * Read the current page CSRF token.
   */
  private async csrfToken(): Promise<string> {
    this.cachedCsrfToken ??=
      (await this.page
        .locator('meta[name="csrf-token"]')
        .getAttribute('content')) ?? '';
    return this.cachedCsrfToken;
  }

  /**
   * Parse a response body and throw with status text on failure.
   *
   * @param response - API response
   * @param action - label for failure messages
   */
  private async parseJson<T>(
    response: APIResponse,
    action: string,
  ): Promise<T> {
    const text = await response.text();
    if (!response.ok()) {
      throw new Error(`${action} failed: ${response.status()} - ${text}`);
    }
    return (text ? JSON.parse(text) : {}) as T;
  }
}
