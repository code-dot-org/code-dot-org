import {type Page} from '@playwright/test';

import {createTeacher} from '../shared/auth';
import {expect, test} from '../shared/fixtures';

type SectionName = 'Section 1' | 'Section 2';
type NamedSectionIds = Record<SectionName, number>;

type CatalogFilterId =
  | 'grade'
  | 'duration'
  | 'topic'
  | 'device'
  | 'marketingInitiative';

/**
 * Curriculum Catalog — signed-out, student, teacher, and assign/unassign flows.
 *
 * Sources:
 *   dashboard/test/ui/features/acquisition_products/curriculum_catalog.feature
 *   dashboard/test/ui/features/acquisition_products/curriculum_catalog_assign_unassign.feature
 */

/**
 * Wait for the catalog to load (AI for Oceans card visible).
 *
 * @param page - Playwright page navigated to /catalog
 */
async function waitForCatalog(page: Page): Promise<void> {
  await page
    .locator('h4', {hasText: 'AI for Oceans'})
    .waitFor({state: 'visible', timeout: 30_000});
}

/**
 * Page object for curriculum catalog filters.
 */
class CatalogFiltersPage {
  private readonly page: Page;

  /**
   * @param page - Playwright page on /catalog
   */
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigates to the catalog and waits for visible catalog-card readiness.
   *
   * @param path - catalog path, including optional locale segment
   */
  async goto(path = '/catalog'): Promise<void> {
    await this.page.goto(path);
    await this.waitForReady();
  }

  /**
   * Waits for user-visible catalog readiness signals: the topic filter and a
   * known offering card.
   */
  async waitForReady(): Promise<void> {
    await expect(this.dropdownButton('topic')).toBeVisible({timeout: 30_000});
  }

  /**
   * Opens one filter dropdown.
   *
   * @param filter - filter id prefix from the catalog DOM
   */
  async openFilter(filter: CatalogFilterId): Promise<void> {
    await this.dropdownButton(filter).click();
    await expect(this.dropdown(filter)).toBeVisible({timeout: 10_000});
  }

  /**
   * Selects a visible option from the open filter dropdown.
   *
   * @param text - option label
   */
  async selectVisibleOption(text: string): Promise<void> {
    await this.checkbox(text).click();
  }

  /**
   * Clicks the Select all command in an open dropdown.
   */
  async selectAll(): Promise<void> {
    await this.page.getByRole('button', {name: 'Select all'}).click();
  }

  /**
   * Clicks the Clear all command in an open dropdown.
   */
  async clearAll(): Promise<void> {
    await this.page.getByRole('button', {name: 'Clear all'}).click();
  }

  /**
   * Clears all selected filters through the page-level Clear filters button.
   */
  async clearFilters(): Promise<void> {
    await this.page.locator('#clear-filters').click();
  }

  /**
   * Assert an offering card heading is visible.
   *
   * @param name - visible offering title
   */
  async expectOfferingVisible(name: string): Promise<void> {
    await expect(this.page.locator('h4', {hasText: name})).toBeVisible({
      timeout: 30_000,
    });
  }

  /**
   * Assert an offering card heading is no longer visible.
   *
   * @param name - visible offering title
   */
  async expectOfferingHidden(name: string): Promise<void> {
    await expect(this.page.locator('h4', {hasText: name})).not.toBeVisible({
      timeout: 30_000,
    });
  }

  /**
   * Assert the no-results state is visible.
   *
   * @param text - localized no-results heading
   */
  async expectNoMatchingCurricula(text: string | RegExp): Promise<void> {
    await expect(this.page.getByRole('heading', {name: text})).toBeVisible({
      timeout: 30_000,
    });
  }

  /**
   * Assert a named filter checkbox state.
   *
   * @param label - checkbox label
   * @param checked - expected state
   */
  async expectCheckbox(label: string, checked: boolean): Promise<void> {
    const checkbox = this.checkbox(label);
    if (checked) {
      await expect(checkbox).toBeChecked();
    } else {
      await expect(checkbox).not.toBeChecked();
    }
  }

  /**
   * Returns a filter dropdown button.
   *
   * @param filter - filter id prefix from the catalog DOM
   */
  dropdownButton(filter: CatalogFilterId) {
    return this.page.locator(`#${filter}-dropdown-button`);
  }

  /**
   * Returns a checkbox by option text, allowing checked checkmarks and
   * parenthetical duration labels while avoiding prefix collisions such as
   * Grade 1 vs Grade 10.
   *
   * @param label - option text from the source scenario
   */
  private checkbox(label: string) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return this.page.getByRole('checkbox', {
      name: new RegExp(`(^|\\s)${escaped}(\\s|$|\\s*\\()`, 'i'),
    });
  }

  /**
   * Returns a filter dropdown container.
   *
   * @param filter - filter id prefix from the catalog DOM
   */
  private dropdown(filter: CatalogFilterId) {
    return this.page.locator(`#${filter}-dropdown`);
  }
}

/**
 * Page object for expanded curriculum catalog cards.
 */
class CatalogDetailsPage {
  private readonly page: Page;

  /**
   * @param page - Playwright page on /catalog
   */
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigates to the catalog and waits for a known offering card.
   */
  async goto(): Promise<void> {
    await this.page.goto('/catalog');
    await waitForCatalog(this.page);
  }

  /**
   * Opens the details panel for one offering.
   *
   * @param curriculumName - visible curriculum title
   */
  async expand(curriculumName: string): Promise<void> {
    await this.page
      .getByRole('button', {name: `View details about ${curriculumName}`})
      .click();
    await expect(
      this.page.getByRole('heading', {name: curriculumName, level: 3}),
    ).toBeVisible({timeout: 30_000});
  }

  /**
   * Asserts the Professional Learning section is visible.
   */
  async expectProfessionalLearningVisible(): Promise<void> {
    await expect(
      this.page.getByRole('heading', {name: 'Professional Learning'}),
    ).toBeVisible({timeout: 30_000});
  }

  /**
   * Asserts the Professional Learning section is hidden.
   */
  async expectProfessionalLearningHidden(): Promise<void> {
    await expect(
      this.page.getByRole('heading', {name: 'Professional Learning'}),
    ).not.toBeVisible();
  }

  /**
   * Asserts the expanded-card assignment control is hidden.
   *
   * @param curriculumName - visible curriculum title
   */
  async expectAssignToClassSectionsHidden(
    curriculumName: string,
  ): Promise<void> {
    await expect(
      this.page
        .getByRole('button', {
          name: `Assign ${curriculumName} to your classroom`,
        })
        .filter({hasText: 'Assign to class sections'}),
    ).not.toBeVisible();
  }

  /**
   * Clicks the expanded-card assignment control and waits for the create-section
   * dialog heading.
   *
   * @param curriculumName - visible curriculum title
   */
  async openCreateSectionDialog(curriculumName: string): Promise<void> {
    await this.page
      .getByRole('button', {
        name: `Assign ${curriculumName} to your classroom`,
      })
      .filter({hasText: 'Assign to class sections'})
      .click();
    await expect(
      this.page.getByRole('heading', {
        name: 'Create class section to assign a curriculum',
      }),
    ).toBeVisible({timeout: 15_000});
  }
}

/**
 * Create two named sections for the currently signed-in teacher.
 * Mirrors `I am a teacher with student sections named Section 1 and Section 2`
 * from section_management_steps.rb.
 *
 * @param page - Playwright page holding the teacher session
 */
async function createNamedSections(page: Page): Promise<NamedSectionIds> {
  const csrf = await page
    .locator('meta[name="csrf-token"]')
    .getAttribute('content');

  for (const sectionName of ['Section 1', 'Section 2']) {
    const response = await page.request.post(
      '/api/test/create_student_section_with_name',
      {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrf ?? '',
        },
        data: {section_name: sectionName},
      },
    );

    if (!response.ok()) {
      throw new Error(
        `create section "${sectionName}" failed: ${response.status()} — ${await response.text()}`,
      );
    }
  }

  const sectionsResponse = await page.request.get('/dashboardapi/sections');
  expect(sectionsResponse.ok()).toBe(true);
  const sections = (await sectionsResponse.json()) as Array<{
    id: number;
    name: string;
  }>;

  return {
    'Section 1': expectSectionId(sections, 'Section 1'),
    'Section 2': expectSectionId(sections, 'Section 2'),
  };
}

/**
 * Find a named section id in /dashboardapi/sections.
 *
 * @param sections - sections returned by dashboardapi
 * @param sectionName - expected section name
 */
function expectSectionId(
  sections: Array<{id: number; name: string}>,
  sectionName: SectionName,
): number {
  const section = sections.find(s => s.name === sectionName);
  expect(section).toBeTruthy();
  return section!.id;
}

/**
 * Open the assignment dialog from a catalog card or expanded card.
 *
 * @param page - Playwright page on the curriculum catalog
 * @param curriculumName - visible curriculum card title
 * @param expandedCard - when true, use the card's details view first
 */
async function openAssignmentDialog(
  page: Page,
  curriculumName: string,
  {expandedCard = false}: {expandedCard?: boolean} = {},
): Promise<void> {
  if (expandedCard) {
    await page
      .getByRole('button', {name: `View details about ${curriculumName}`})
      .click();
    await page
      .getByRole('button', {
        name: `Assign ${curriculumName} to your classroom`,
      })
      .filter({hasText: 'Assign to class sections'})
      .click();
  } else {
    await page
      .getByRole('button', {
        name: `Assign ${curriculumName} to your classroom`,
      })
      .click();
  }

  await expect(
    page.getByRole('button', {name: 'Confirm section assignments'}),
  ).toBeVisible({timeout: 15_000});
}

/**
 * Assert the named section checkbox state in the assignment dialog.
 *
 * @param page - Playwright page with assignment dialog open
 * @param sectionName - accessible checkbox name
 * @param checked - expected selected state
 */
async function expectSectionCheckbox(
  page: Page,
  sectionName: string,
  checked: boolean,
): Promise<void> {
  const checkbox = page.getByRole('checkbox', {name: sectionName});
  if (checked) {
    await expect(checkbox).toBeChecked();
  } else {
    await expect(checkbox).not.toBeChecked();
  }
}

/**
 * Toggle one section in the assignment dialog and confirm.
 *
 * @param page - Playwright page with assignment dialog open
 * @param sectionName - accessible checkbox name
 * @param checked - target selected state for the section
 * @param sectionId - id used by the section PATCH endpoint
 */
async function confirmSectionAssignment(
  page: Page,
  sectionName: SectionName,
  checked: boolean,
  sectionId: number,
): Promise<void> {
  const checkbox = page.getByRole('checkbox', {name: sectionName});
  if ((await checkbox.isChecked()) !== checked) {
    await checkbox.click();
  }
  await expectSectionCheckbox(page, sectionName, checked);

  const confirmButton = page.getByRole('button', {
    name: 'Confirm section assignments',
  });
  const sectionUpdateResponse = page.waitForResponse(
    response => {
      return (
        response.url().includes(`/dashboardapi/sections/${sectionId}`) &&
        response.request().method() === 'PATCH'
      );
    },
    {timeout: 30_000},
  );
  await confirmButton.click();
  const response = await sectionUpdateResponse;
  expect(response.ok()).toBe(true);
  const section = (await response.json()) as {course_id: number | null};
  if (checked) {
    expect(section.course_id).not.toBeNull();
  } else {
    expect(section.course_id).toBeNull();
  }
  await expect(confirmButton).toBeHidden({timeout: 30_000});
}

/**
 * Confirm a checkbox change and retry if the section update races.
 *
 * @param page - Playwright page
 * @param curriculumName - visible curriculum card title
 * @param sectionName - accessible checkbox name
 * @param checked - target selected state for the section
 * @param sectionId - id used by the section PATCH endpoint
 * @param expandedCard - when true, use expanded-card details for a retry
 */
async function confirmSectionAssignmentWithRetry(
  page: Page,
  curriculumName: string,
  sectionName: SectionName,
  checked: boolean,
  sectionId: number,
  {expandedCard = false}: {expandedCard?: boolean} = {},
): Promise<void> {
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) {
      await page.goto('/catalog');
      await waitForCatalog(page);
      await openAssignmentDialog(page, curriculumName, {expandedCard});
      if (
        (await page.getByRole('checkbox', {name: sectionName}).isChecked()) ===
        checked
      ) {
        return;
      }
    }

    try {
      await confirmSectionAssignment(page, sectionName, checked, sectionId);
      return;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

/**
 * Assert that a section card on teacher home is or is not assigned to a course.
 *
 * @param page - Playwright page
 * @param sectionName - section name shown in the section table
 * @param courseName - course display name to find in the section's assignment
 * @param assigned - whether the course should be present
 */
async function expectSectionCourseAssignment(
  page: Page,
  sectionName: string,
  courseName: string,
  assigned: boolean,
): Promise<void> {
  const sectionAssignment = page.locator(
    `#course-content-dropdown-${sectionName.replaceAll(' ', '-')}`,
  );

  if (assigned) {
    await expect(sectionAssignment).toContainText(courseName, {
      timeout: 45_000,
    });
    return;
  }

  await expect(async () => {
    const text = await sectionAssignment
      .textContent({timeout: 1_000})
      .catch(() => '');
    expect(text ?? '').not.toContain(courseName);
  }).toPass({timeout: 30_000, intervals: [500, 1_000, 2_000]});
}

/**
 * Complete one catalog assign/unassign scenario.
 *
 * @param page - Playwright page
 * @param expandedCard - when true, assign from expanded-card details
 */
async function assignAndUnassignCatalogOfferings(
  page: Page,
  {expandedCard = false}: {expandedCard?: boolean} = {},
): Promise<void> {
  await createTeacher(page);
  await page.goto('/home');
  const sectionIds = await createNamedSections(page);

  await page.goto('/catalog');
  await waitForCatalog(page);

  await openAssignmentDialog(page, 'AI for Oceans', {expandedCard});
  await expectSectionCheckbox(page, 'Section 1', false);
  await expectSectionCheckbox(page, 'Section 2', false);
  await confirmSectionAssignmentWithRetry(
    page,
    'AI for Oceans',
    'Section 1',
    true,
    sectionIds['Section 1'],
    {expandedCard},
  );

  await openAssignmentDialog(page, 'UI Test CSP', {expandedCard});
  await expectSectionCheckbox(page, 'Section 1', false);
  await expectSectionCheckbox(page, 'Section 2', false);
  await confirmSectionAssignmentWithRetry(
    page,
    'UI Test CSP',
    'Section 2',
    true,
    sectionIds['Section 2'],
    {expandedCard},
  );

  await page.goto('/teacher_dashboard/home');
  await expectSectionCourseAssignment(page, 'Section 1', 'AI for Oceans', true);
  await expectSectionCourseAssignment(page, 'Section 2', 'UI Test CSP', true);

  await page.goto('/catalog');
  await waitForCatalog(page);

  await openAssignmentDialog(page, 'AI for Oceans', {expandedCard});
  await expectSectionCheckbox(page, 'Section 1', true);
  await expectSectionCheckbox(page, 'Section 2', false);
  await confirmSectionAssignmentWithRetry(
    page,
    'AI for Oceans',
    'Section 1',
    false,
    sectionIds['Section 1'],
    {expandedCard},
  );

  await openAssignmentDialog(page, 'UI Test CSP', {expandedCard});
  await expectSectionCheckbox(page, 'Section 1', false);
  await expectSectionCheckbox(page, 'Section 2', true);
  await confirmSectionAssignmentWithRetry(
    page,
    'UI Test CSP',
    'Section 2',
    false,
    sectionIds['Section 2'],
    {expandedCard},
  );
  await expect(
    page.locator('p', {hasText: 'You have successfully assigned'}),
  ).not.toBeVisible();

  await page.goto('/teacher_dashboard/home');
  await expectSectionCourseAssignment(
    page,
    'Section 1',
    'AI for Oceans',
    false,
  );
  await expectSectionCourseAssignment(page, 'Section 2', 'UI Test CSP', false);
}

test.describe('Curriculum Catalog — signed-out', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/curriculum_catalog.feature
   * Scenario: Signed-out user is redirected to sign-in page when clicking Assign
   */
  test('signed-out user is redirected to sign-in when clicking Assign', async ({
    page,
  }) => {
    await page.goto('/catalog');

    await page
      .locator('h4', {hasText: 'AI for Oceans'})
      .waitFor({state: 'visible'});

    // Click the assign button for "AI for Oceans".
    await page
      .locator('[aria-label="Assign AI for Oceans to your classroom"]')
      .click();

    await expect(
      page.locator('h3', {
        hasText: 'Sign in or create account to assign a curriculum',
      }),
    ).toBeVisible();

    // Follow the sign-in link and verify the sign-in page loads.
    await page.locator('a', {hasText: 'Sign in or create account'}).click();
    await expect(
      page.locator('h2', {hasText: 'Have an account already? Sign in'}),
    ).toBeVisible();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/curriculum_catalog.feature
   * Scenario: Signed-out user sees the curriculum catalog with offerings and can expand card and view recommendations
   */
  test(
    'signed-out user expands a catalog card and sees recommendations',
    {tag: '@no_mobile'},
    async ({page}) => {
      await page.goto('/catalog');
      await waitForCatalog(page);

      await page
        .getByRole('button', {name: 'View details about AI for Oceans'})
        .click();

      await expect(
        page.getByRole('heading', {name: 'AI for Oceans', level: 3}),
      ).toBeVisible({timeout: 30_000});
      await expect(
        page.getByRole('link', {name: 'View details about AI for Oceans'}),
      ).toBeVisible({timeout: 30_000});
      await expect(
        page.getByRole('heading', {name: 'Related Curricula'}),
      ).toBeVisible({timeout: 30_000});
      await expect(
        page.locator('a[href="#curriculum-catalog-card-mix-move-ai"]'),
      ).toBeVisible();
      await expect(
        page.locator('a[href="#curriculum-catalog-card-customizing-llms"]'),
      ).toBeVisible();
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/curriculum_catalog.feature
   * Scenario: Signed-out user sees course offering page when clicking on see curriculum details on expanded card
   */
  test(
    'signed-out user opens course offering page from expanded card',
    {tag: '@no_mobile'},
    async ({page}) => {
      await page.goto('/catalog');
      await waitForCatalog(page);

      await page
        .getByRole('button', {name: 'View details about AI for Oceans'})
        .click();
      await page
        .getByRole('link', {name: 'View details about AI for Oceans'})
        .waitFor({state: 'visible', timeout: 30_000});
      await page
        .getByRole('link', {name: 'View details about AI for Oceans'})
        .click();

      await expect(
        page.getByRole('heading', {name: 'AI for Oceans'}),
      ).toBeVisible({
        timeout: 30_000,
      });
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/curriculum_catalog.feature
   * Scenario: Signed-out user can navigate to facilitator led workshop through expanded card
   */
  test(
    'signed-out user opens facilitator-led workshops from expanded card',
    {tag: '@no_mobile'},
    async ({page}) => {
      await page.goto('/catalog');
      await page
        .locator('h4', {hasText: 'UI Test CSF'})
        .waitFor({state: 'visible', timeout: 30_000});

      await page
        .getByRole('button', {name: 'View details about UI Test CSF'})
        .click();
      await page.getByRole('link', {name: 'Facilitator led workshops'}).click();

      await expect(page).toHaveURL(/\/professional-learning\/workshops/, {
        timeout: 30_000,
      });
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/curriculum_catalog.feature
   * Scenario: On expanded card, Signed-out user is redirected to sign-in page when clicking Assign to class sections
   */
  test(
    'signed-out user is redirected to sign-in from expanded-card Assign button',
    {tag: '@no_mobile'},
    async ({page}) => {
      await page.goto('/catalog');
      await waitForCatalog(page);

      await page
        .getByRole('button', {name: 'View details about AI for Oceans'})
        .click();
      await page
        .getByRole('button', {
          name: 'Assign AI for Oceans to your classroom',
        })
        .filter({hasText: 'Assign to class sections'})
        .click();

      await expect(
        page.locator('h3', {
          hasText: 'Sign in or create account to assign a curriculum',
        }),
      ).toBeVisible();

      await page.locator('a', {hasText: 'Sign in or create account'}).click();
      await expect(
        page.locator('h2', {hasText: 'Have an account already? Sign in'}),
      ).toBeVisible();
    },
  );
});

test.describe('Curriculum Catalog — filters', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/curriculum_catalog_filters.feature
   * Scenario: Signed-out user sees the curriculum catalog with offerings and can filter
   */
  test('signed-out user filters offerings by topic and grade', async ({
    page,
  }) => {
    const catalog = new CatalogFiltersPage(page);
    await catalog.goto('/catalog');
    await catalog.expectOfferingVisible('AI for Oceans');
    // Visual checkpoint stub: "Curriculum Catalog: All Offerings".

    await catalog.openFilter('topic');
    await catalog.selectVisibleOption('Digital Literacy');
    await catalog.expectOfferingHidden('AI for Oceans');
    // Visual checkpoint stub: "Curriculum Catalog: One Offering".

    await catalog.openFilter('grade');
    await catalog.selectVisibleOption('Grade 12');
    await catalog.expectNoMatchingCurricula('No matching curricula');
    // Visual checkpoint stub: "Curriculum Catalog: No Offerings".
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/curriculum_catalog_filters.feature
   * Scenario: Signed-out user sees the curriculum catalog with offerings and can filter
   * Locale: Spanish version.
   */
  test('signed-out user filters Spanish offerings by topic and grade', async ({
    page,
  }) => {
    const catalog = new CatalogFiltersPage(page);
    await catalog.goto('/catalog/lang/es');
    await expect(page).toHaveURL(/\/catalog\?lang=es/, {timeout: 30_000});
    await catalog.expectOfferingVisible('Inteligencia Artificial para Océanos');
    // Visual checkpoint stub: "Curriculum Catalog: All Offerings in Spanish".

    await catalog.openFilter('topic');
    await catalog.selectVisibleOption('Alfabetización Digital');
    await catalog.expectOfferingHidden('Inteligencia Artificial para Océanos');
    // Visual checkpoint stub: "Curriculum Catalog: One Offering in Spanish".

    await catalog.openFilter('grade');
    await catalog.selectVisibleOption('Grado 12');
    await expect(page.locator('figure ~ h2')).toBeVisible({timeout: 30_000});
    // Visual checkpoint stub: "Curriculum Catalog: No Offerings in Spanish".
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/curriculum_catalog_filters.feature
   * Scenario: User can Select all and Clear all in Curriculum Catalog filters
   */
  test('grade filter supports select all and clear all', async ({page}) => {
    const catalog = new CatalogFiltersPage(page);
    await catalog.goto('/catalog');

    await catalog.openFilter('grade');
    await catalog.selectAll();
    for (const label of [
      'Kindergarten',
      'Grade 1',
      'Grade 2',
      'Grade 3',
      'Grade 4',
      'Grade 5',
      'Grade 6',
      'Grade 7',
      'Grade 8',
      'Grade 9',
      'Grade 10',
      'Grade 11',
      'Grade 12',
    ]) {
      await catalog.expectCheckbox(label, true);
    }

    await catalog.clearAll();
    for (const label of [
      'Kindergarten',
      'Grade 1',
      'Grade 2',
      'Grade 3',
      'Grade 4',
      'Grade 5',
      'Grade 6',
      'Grade 7',
      'Grade 8',
      'Grade 9',
      'Grade 10',
      'Grade 11',
      'Grade 12',
    ]) {
      await catalog.expectCheckbox(label, false);
    }
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/curriculum_catalog_filters.feature
   * Scenario: User can use Clear filters button to clear all selected filters
   */
  test('clear filters clears selected filter checkboxes', async ({page}) => {
    const catalog = new CatalogFiltersPage(page);
    await catalog.goto('/catalog');

    for (const [filter, label] of [
      ['grade', 'Kindergarten'],
      ['duration', 'School Year'],
      ['topic', 'Interdisciplinary'],
      ['device', 'Computer'],
      ['marketingInitiative', 'AP CSA'],
    ] as const) {
      await catalog.openFilter(filter);
      await catalog.selectVisibleOption(label);
      await catalog.expectCheckbox(label, true);
    }

    await catalog.clearFilters();

    for (const [filter, label] of [
      ['grade', 'Kindergarten'],
      ['duration', 'School Year'],
      ['topic', 'Interdisciplinary'],
      ['device', 'Computer'],
      ['marketingInitiative', 'AP CSA'],
    ] as const) {
      await catalog.openFilter(filter);
      await catalog.expectCheckbox(label, false);
    }
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/curriculum_catalog_filters.feature
   * Scenario: User can use Tab navigation on filters, Space to select and escape to close
   * @chrome
   */
  test('keyboard navigation selects and closes filter options', async ({
    page,
  }) => {
    const catalog = new CatalogFiltersPage(page);
    await catalog.goto('/catalog');

    await catalog.openFilter('grade');
    await catalog.selectVisibleOption('Kindergarten');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Space');
    await catalog.expectCheckbox('Grade 1', true);
    await page.keyboard.press('Escape');
    await expect(page.locator('.dropdown-menu')).not.toBeVisible();
  });
});

test.describe('Curriculum Catalog — signed-in student', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/curriculum_catalog.feature
   * Scenario: Signed-in student does not see Assign button
   * @as_student
   *
   * Students are not allowed to assign curricula; the Assign button must not
   * appear on the catalog page for a signed-in student account.
   */
  test('signed-in student does not see Assign button', async ({
    studentPage,
  }) => {
    await studentPage.goto('/catalog');
    await waitForCatalog(studentPage);
    await expect(
      studentPage.locator('button', {hasText: 'Assign'}),
    ).not.toBeVisible();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/curriculum_catalog.feature
   * Scenario: On expanded card, Signed-in student does not see professional learning section
   * @as_student
   * @no_mobile
   */
  test(
    'signed-in student does not see Professional Learning on expanded card',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      const catalog = new CatalogDetailsPage(studentPage);

      await catalog.goto();
      await catalog.expand('UI Test CSF');
      await catalog.expectProfessionalLearningHidden();
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/curriculum_catalog.feature
   * Scenario: On expanded card, Signed-in student does not see Assign button
   * @as_student
   * @no_mobile
   */
  test(
    'signed-in student does not see expanded-card Assign button',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      const catalog = new CatalogDetailsPage(studentPage);

      await catalog.goto();
      await catalog.expand('AI for Oceans');
      await catalog.expectAssignToClassSectionsHidden('AI for Oceans');
    },
  );
});

test.describe('Curriculum Catalog — signed-in teacher', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/curriculum_catalog.feature
   * Scenario: Signed-in teacher without sections is prompted to created sections when clicking Assign
   * @as_teacher
   *
   * A teacher with no sections who clicks Assign should see a "Create class
   * section" dialog, and following the Create Section link should land on /home
   * with the "New class section" button visible.
   */
  test('teacher without sections is prompted to create a section', async ({
    teacherPage,
  }) => {
    await teacherPage.goto('/catalog');
    await waitForCatalog(teacherPage);

    await teacherPage
      .locator('[aria-label="Assign AI for Oceans to your classroom"]')
      .click();
    await expect(
      teacherPage.locator('h3', {
        hasText: 'Create class section to assign a curriculum',
      }),
    ).toBeVisible();

    await teacherPage.locator('a', {hasText: 'Create Section'}).click();
    await teacherPage.waitForURL('**/home', {timeout: 15_000});
    await expect(
      teacherPage.locator('button', {hasText: 'New class section'}),
    ).toBeVisible({timeout: 15_000});
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/curriculum_catalog.feature
   * Scenario: On expanded card, Signed-in teacher sees professional learning section
   * @as_teacher
   * @no_mobile
   */
  test(
    'signed-in teacher sees Professional Learning on expanded card',
    {tag: '@no_mobile'},
    async ({teacherPage}) => {
      const catalog = new CatalogDetailsPage(teacherPage);

      await catalog.goto();
      await catalog.expand('UI Test CSF');
      await catalog.expectProfessionalLearningVisible();
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/curriculum_catalog.feature
   * Scenario: On the expanded card, Signed-in teacher without sections is prompted to created sections when clicking Assign to class sections
   * @as_teacher
   * @no_mobile
   */
  test(
    'teacher without sections is prompted from expanded-card Assign button',
    {tag: '@no_mobile'},
    async ({teacherPage}) => {
      const catalog = new CatalogDetailsPage(teacherPage);

      await catalog.goto();
      await catalog.expand('AI for Oceans');
      await catalog.openCreateSectionDialog('AI for Oceans');
      await teacherPage.getByRole('link', {name: 'Create Section'}).click();
      await teacherPage.waitForURL('**/home', {timeout: 15_000});
      await expect(
        teacherPage.getByRole('button', {name: 'New class section'}),
      ).toBeVisible({timeout: 15_000});
    },
  );
});

test.describe('Curriculum Catalog — assign and unassign', () => {
  test.describe.configure({mode: 'serial'});

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/curriculum_catalog_assign_unassign.feature
   * Scenario: Signed-in teacher with sections assigns and unassigns offerings to sections
   *
   * Creates a teacher with two named sections, assigns AI for Oceans to
   * Section 1 and UI Test CSP to Section 2, verifies on /home, then
   * unassigns both and verifies again.
   */
  test('teacher assigns and unassigns courses to named sections', async ({
    page,
  }) => {
    await assignAndUnassignCatalogOfferings(page);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/curriculum_catalog_assign_unassign.feature
   * Scenario: On expanded card, Signed-in teacher with sections assigns and unassigns offerings to sections
   * @no_mobile
   *
   * Same assign/unassign assertions as above, but starts each assignment from
   * the expanded catalog card's details view.
   */
  test(
    'teacher assigns and unassigns courses from expanded cards',
    {tag: '@no_mobile'},
    async ({page}) => {
      await assignAndUnassignCatalogOfferings(page, {expandedCard: true});
    },
  );
});
