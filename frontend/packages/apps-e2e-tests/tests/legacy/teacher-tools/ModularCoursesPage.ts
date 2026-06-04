import {expect, type Locator, type Page} from '@playwright/test';

/**
 * Page object for modular-course course overview, unit overview, level header,
 * and teacher progress dashboard flows.
 */
export class ModularCoursesPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Runs the full course-context navigation sequence for one modular course.
   *
   * @param courseSlug - course slug, e.g. "ui-test-course-2017"
   */
  async runCourseNavigationSequence(courseSlug: string): Promise<void> {
    await this.page.goto(`/courses/${courseSlug}`);
    await expect(
      this.page
        .locator('.uitest-CourseScript')
        .filter({hasText: 'UI Test Shared Unit'}),
    ).toBeVisible({timeout: 15_000});

    await this.clickGoToUnit('UI Test Shared Unit');
    await this.page
      .locator('.unit-breadcrumb')
      .waitFor({state: 'visible', timeout: 20_000});
    await expect(this.page).toHaveURL(
      new RegExp(`/courses/${courseSlug}/units/`),
      {timeout: 15_000},
    );
    await expect(this.page.locator('.unit-breadcrumb')).toContainText(
      courseSlug,
      {timeout: 10_000},
    );

    await this.page
      .locator('#progress-lesson-1 .progress-bubble-link')
      .first()
      .click();
    await this.page
      .locator('#level-body')
      .waitFor({state: 'visible', timeout: 20_000});
    await expect(this.page).toHaveURL(
      new RegExp(`/courses/${courseSlug}/units/3/lessons/1/levels/1`),
      {timeout: 30_000},
    );

    await this.page.locator('.submitButton').click();
    await this.page
      .locator('#level-body')
      .waitFor({state: 'visible', timeout: 20_000});
    await expect(this.page).toHaveURL(
      new RegExp(`/courses/${courseSlug}/units/3/lessons/2/levels/1`),
      {timeout: 30_000},
    );

    await this.openProgressDropDown();
    await this.gotoVisibleLink(
      this.page.getByRole('link', {name: 'View Unit Overview'}),
    );
    await this.page
      .locator('.unit-breadcrumb')
      .waitFor({state: 'visible', timeout: 20_000});
    await expect(this.page).toHaveURL(
      new RegExp(`/courses/${courseSlug}/units/`),
      {timeout: 10_000},
    );

    await this.gotoVisibleLink(this.page.locator('.unit-breadcrumb a'));
    await this.page
      .locator('#course_overview')
      .waitFor({state: 'visible', timeout: 20_000});
    await expect(this.page).toHaveURL(new RegExp(`/courses/${courseSlug}$`), {
      timeout: 10_000,
    });
  }

  /**
   * Completes the first level in the shared modular unit as a student.
   */
  async completeFirstSharedUnitLevel(): Promise<void> {
    await this.page.goto(
      '/courses/ui-test-course-2017/units/3/lessons/1/levels/1',
    );
    await this.page
      .locator('.submitButton')
      .waitFor({state: 'visible', timeout: 30_000});
    await this.page.locator('.submitButton').click();
    // Wait for the level-body to reload, confirming navigation to the next level.
    await this.page
      .locator('#level-body')
      .waitFor({state: 'visible', timeout: 30_000});
  }

  /**
   * Opens the V2 progress page for a named section from the teacher homepage.
   *
   * @param sectionName - section card name
   */
  async openProgressForSection(sectionName: string): Promise<void> {
    const buttonId = `#task-button-View-progress-${sectionName.replaceAll(
      ' ',
      '-',
    )}`;
    await this.page.goto('/teacher_dashboard/home');
    await this.page
      .locator(buttonId)
      .waitFor({state: 'visible', timeout: 45_000});
    await this.page.locator(buttonId).click();
    await this.waitForProgressDashboard();
  }

  /**
   * Selects a section in the progress dashboard sidebar.
   *
   * @param sectionName - section name to select
   */
  async selectSidebarSection(sectionName: string): Promise<void> {
    await this.selectOptionContaining(
      '#uitest-sidebar-section-dropdown',
      sectionName,
    );
    await this.waitForProgressDashboard();
  }

  /**
   * Selects the shared unit and verifies the expected completed level cell.
   *
   * @param courseSlug - course slug expected in the completed level cell ID
   */
  async expectSharedUnitProgress(courseSlug: string): Promise<void> {
    await this.selectOptionContaining(
      '#unit-selector-v2',
      'UI Test Shared Unit',
    );
    await this.page.waitForSelector('#ui-test-skeleton-progress-column', {
      state: 'hidden',
      timeout: 60_000,
    });
    const lessonHeader = this.page.locator('#ui-test-lesson-header-1');
    const expandedHeader = this.page.locator(
      '#ui-test-expanded-progress-column-header-1',
    );
    await expect(lessonHeader).toBeVisible({timeout: 30_000});
    await expect(async () => {
      if (!(await expandedHeader.isVisible().catch(() => false))) {
        await lessonHeader.evaluate(element =>
          (element as HTMLElement).click(),
        );
      }
      await expect(expandedHeader).toBeVisible({timeout: 10_000});
    }).toPass({timeout: 45_000});
    await expect(
      this.page.locator(
        `#ui-test-courses-${courseSlug}-units-3-lessons-1-levels-1-cell-data`,
      ),
    ).toBeVisible({timeout: 30_000});
  }

  /**
   * Clicks the "Go to Unit" button inside the matching course-script card.
   *
   * @param unitName - display name of the unit card to find
   */
  private async clickGoToUnit(unitName: string): Promise<void> {
    const cards = this.page.locator('.uitest-CourseScript');
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      const text = await card.innerText().catch(() => '');
      if (text.includes(unitName)) {
        await card.getByRole('link', {name: 'Go to Unit'}).click();
        return;
      }
    }
    throw new Error(`No course-script card found containing "${unitName}"`);
  }

  /**
   * Opens the progress dropdown from a level page header.
   */
  private async openProgressDropDown(): Promise<void> {
    const menuLink = this.page.locator('.header_popup_link');
    const unitOverviewLink = this.page.getByRole('link', {
      name: 'View Unit Overview',
    });

    await expect(async () => {
      await expect(menuLink).toBeVisible({timeout: 10_000});
      await menuLink.evaluate(element => (element as HTMLElement).click());
      await expect(unitOverviewLink).toBeVisible({timeout: 10_000});
    }).toPass({timeout: 30_000});
  }

  /**
   * Navigates to a visible link's href without waiting on the click load event.
   *
   * @param link - visible link locator
   */
  private async gotoVisibleLink(link: Locator): Promise<void> {
    await expect(link).toBeVisible({timeout: 20_000});
    const href = await link.getAttribute('href');
    if (!href) {
      throw new Error('visible link did not have an href');
    }
    try {
      await this.page.goto(href, {
        waitUntil: 'domcontentloaded',
        timeout: 30_000,
      });
    } catch (error) {
      if (
        !(error instanceof Error) ||
        (!error.message.includes('ERR_ABORTED') &&
          !error.message.includes('NS_BINDING_ABORTED'))
      ) {
        throw error;
      }
    }
  }

  /**
   * Selects an option whose visible text contains the provided label text.
   *
   * @param selector - CSS selector for the HTML select element
   * @param labelText - visible option text to match
   */
  private async selectOptionContaining(
    selector: string,
    labelText: string,
  ): Promise<void> {
    const select = this.page.locator(selector);
    await select.waitFor({state: 'visible', timeout: 30_000});
    const option = select
      .locator('option')
      .filter({hasText: labelText})
      .first();
    await expect(option).toBeAttached({timeout: 30_000});
    const value = await option.getAttribute('value');
    if (!value) {
      throw new Error(`No value found for option containing "${labelText}"`);
    }
    await select.selectOption(value);
  }

  // ── Section-assignment helpers (assign_modular_course feature) ──────────

  /** Locator for the first #uitest-multi-assign-button on the page. */
  multiAssignButton(): Locator {
    return this.page.locator('#uitest-multi-assign-button');
  }

  /**
   * Locator for the Nth (0-indexed) #uitest-multi-assign-button inside a
   * .uitest-CourseScript container.  Maps jQuery :eq(n) to Playwright .nth(n).
   */
  courseScriptMultiAssignButton(index: number): Locator {
    return this.page
      .locator('.uitest-CourseScript #uitest-multi-assign-button')
      .nth(index);
  }

  /**
   * Opens the section-assignment dialog by clicking openButton and waits for
   * the confirm button to become visible.  Retries on transient React focus
   * loss that prevents the dialog from opening.
   */
  async openSectionAssignmentsDialog(openButton: Locator): Promise<void> {
    const confirmButton = this.page.getByRole('button', {
      name: 'Confirm section assignments',
    });

    await expect(async () => {
      await expect(openButton).toBeVisible({timeout: 10_000});
      await expect(openButton).toBeEnabled({timeout: 10_000});
      await openButton.scrollIntoViewIfNeeded();
      await openButton.click();

      if (
        !(await confirmButton.isVisible({timeout: 3_000}).catch(() => false))
      ) {
        await openButton.evaluate(element => (element as HTMLElement).click());
      }

      await expect(confirmButton).toBeVisible({timeout: 10_000});
    }).toPass({timeout: 30_000});
  }

  /** Returns whether the named section's checkbox is checked in the dialog. */
  async sectionCheckboxIsChecked(sectionName: string): Promise<boolean> {
    return this.page
      .getByRole('dialog')
      .getByRole('checkbox', {name: sectionName})
      .isChecked();
  }

  /**
   * Clicks the named section's checkbox in the dialog and asserts it is
   * checked afterwards.  Retries to handle React state settling.
   */
  async clickSectionCheckbox(sectionName: string): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    const checkbox = dialog.getByRole('checkbox', {name: sectionName});
    const labelText = dialog.locator('span', {hasText: sectionName}).first();

    await expect(checkbox).toBeVisible({timeout: 10_000});
    await expect(checkbox).toBeEnabled({timeout: 10_000});
    await expect(labelText).toBeVisible({timeout: 10_000});

    await expect(async () => {
      if (!(await checkbox.isChecked())) {
        await labelText.click({timeout: 1_000});
      }
      await expect(checkbox).toBeChecked({timeout: 1_000});
    }).toPass({timeout: 10_000});
  }

  /**
   * Clicks the "Confirm section assignments" button and waits for the
   * resulting PATCH to /dashboardapi/sections/.  Returns true when the
   * network request was observed and succeeded.
   */
  async confirmSectionAssignments(): Promise<boolean> {
    const sectionPatch = this.page
      .waitForResponse(
        response =>
          response.url().includes('/dashboardapi/sections/') &&
          response.request().method() === 'PATCH',
        {timeout: 15_000},
      )
      .catch(() => null);

    await this.page
      .getByRole('button', {name: 'Confirm section assignments'})
      .click();
    const response = await sectionPatch;
    if (!response) {
      return false;
    }
    expect(response.ok()).toBe(true);
    return true;
  }

  /**
   * Runs the full assign-Section-1 flow: opens the dialog, verifies both
   * checkboxes start unchecked, checks Section 1, verifies state, confirms.
   * Retries up to 3 times when the dialog closes without a PATCH event.
   */
  async assignSectionOneThroughDialog(openButton: Locator): Promise<void> {
    for (let attempt = 0; attempt < 3; attempt++) {
      await this.openSectionAssignmentsDialog(openButton);

      await expect(async () =>
        expect(await this.sectionCheckboxIsChecked('Section 1')).toBe(false),
      ).toPass({timeout: 10_000});
      await expect(async () =>
        expect(await this.sectionCheckboxIsChecked('Section 2')).toBe(false),
      ).toPass({timeout: 10_000});

      await this.clickSectionCheckbox('Section 1');

      await expect(async () =>
        expect(await this.sectionCheckboxIsChecked('Section 1')).toBe(true),
      ).toPass({timeout: 10_000});
      await expect(async () =>
        expect(await this.sectionCheckboxIsChecked('Section 2')).toBe(false),
      ).toPass({timeout: 10_000});

      if (await this.confirmSectionAssignments()) {
        return;
      }

      await openButton.waitFor({state: 'visible', timeout: 15_000});
    }

    throw new Error('Section assignment dialog closed without a section PATCH');
  }

  /** Waits for the "Success! Assignment updated!" toast to appear. */
  async waitForAssignmentSuccessToast(): Promise<void> {
    await this.page
      .locator('span')
      .filter({hasText: 'Success! Assignment updated!'})
      .waitFor({state: 'visible', timeout: 15_000});
  }

  /**
   * Waits for Section sectionName's course-content dropdown to become visible
   * in the teacher dashboard section table, then asserts it contains courseSlug.
   */
  async expectSectionAssignedToCourse(
    sectionName: string,
    courseSlug: string,
  ): Promise<void> {
    const dropdownId = `#course-content-dropdown-${sectionName.replaceAll(' ', '-')}`;
    await this.page
      .locator(dropdownId)
      .waitFor({state: 'visible', timeout: 45_000});
    await expect(this.page.locator(dropdownId)).toContainText(courseSlug);
  }

  /**
   * Asserts that sectionName's course-content dropdown is absent from the DOM
   * (courseId is null — the element is never rendered for unassigned sections).
   */
  async expectSectionNotAssigned(sectionName: string): Promise<void> {
    const dropdownId = `#course-content-dropdown-${sectionName.replaceAll(' ', '-')}`;
    await expect(this.page.locator(dropdownId)).not.toBeAttached({
      timeout: 10_000,
    });
  }

  /**
   * Waits for the V2 progress dashboard and unit selector to settle.
   *
   * The progress table can render while the "Lessons in" dropdown is still a
   * skeleton waiting on `/dashboardapi/section_courses/{id}`. Under CI shard
   * contention that endpoint occasionally hangs or returns stale empty data;
   * the reducer caches the latter via `loadedSectionId`, so the React selector
   * renders nothing and never refetches without a user-driven refresh.
   *
   * Reload acts as the user-equivalent recovery. Retry several times to ride
   * out transient backend slowness without inflating per-wait timeouts.
   */
  private async waitForProgressDashboard(): Promise<void> {
    const maxAttempts = 4;
    const perAttemptTimeoutMs = 30_000;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await this.waitForProgressShell();
      try {
        await this.page
          .locator('#unit-selector-v2')
          .waitFor({state: 'visible', timeout: perAttemptTimeoutMs});
        return;
      } catch (error) {
        if (attempt === maxAttempts) {
          throw error;
        }
        await this.page.reload({waitUntil: 'domcontentloaded'});
      }
    }
  }

  /**
   * Waits for the V2 progress page shell — the Progress heading and the
   * skeleton/loaded progress table — without requiring the unit dropdown.
   */
  private async waitForProgressShell(): Promise<void> {
    await this.page
      .locator('h1')
      .filter({hasText: 'Progress'})
      .waitFor({state: 'visible', timeout: 30_000});
    await this.page
      .locator('#ui-test-progress-table-v2')
      .waitFor({state: 'visible', timeout: 30_000});
  }
}
