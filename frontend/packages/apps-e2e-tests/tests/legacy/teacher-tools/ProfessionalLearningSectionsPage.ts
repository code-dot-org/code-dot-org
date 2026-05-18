import {expect, type Locator, type Page} from '@playwright/test';

type ProfessionalLearningCenter = 'Instructor Center' | 'Facilitator Center';
type ParticipantType = 'student' | 'teacher' | 'facilitator';

/**
 * Page object for the professional-learning section management flows.
 */
export class ProfessionalLearningSectionsPage {
  private readonly page: Page;

  public constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigates to the professional-learning home page and waits for the visible
   * page heading. This is the same user-facing readiness signal Agent Browser
   * found before porting.
   */
  public async goto(): Promise<void> {
    await this.page.goto('/my-professional-learning');
    await expect(
      this.page.getByRole('heading', {
        name: 'Professional Learning',
        level: 1,
      }),
    ).toBeVisible();
  }

  /**
   * Opens the requested PL center tab and waits for its center heading.
   *
   * @param center - tab label to open
   */
  public async openCenter(center: ProfessionalLearningCenter): Promise<void> {
    const tab = this.page.getByRole('tab', {name: center});
    await tab.click();
    await expect(tab).toHaveAttribute('aria-selected', 'true');
    await expect(
      this.page.getByRole('heading', {
        name: 'Instructor Professional Learning Sections',
        level: 2,
      }),
    ).toBeVisible();
  }

  /**
   * Asserts that the create-section setup panel is ready.
   */
  public async expectSetupBox(): Promise<void> {
    await expect(this.page.locator('.uitest-set-up-sections')).toBeVisible();
    await expect(
      this.page.getByRole('button', {name: 'Create a section'}),
    ).toBeEnabled();
  }

  /**
   * Opens the new-section dialog.
   */
  public async openNewSectionDialog(): Promise<void> {
    await this.page.getByRole('button', {name: 'Create a section'}).click();
    await expect(this.page.locator('.uitest-new-section-dialog')).toBeVisible();
  }

  /**
   * Asserts which participant type buttons are visible in the dialog.
   *
   * @param visibleTypes - participant types expected to be visible
   * @param hiddenTypes - participant types expected to be hidden or absent
   */
  public async expectParticipantTypes(
    visibleTypes: ParticipantType[],
    hiddenTypes: ParticipantType[] = [],
  ): Promise<void> {
    await expect(
      this.page.locator('.uitest-participant-type-picker'),
    ).toBeVisible();
    for (const type of visibleTypes) {
      await expect(this.participantType(type)).toBeVisible();
    }
    for (const type of hiddenTypes) {
      await expect(this.participantType(type)).not.toBeVisible();
    }
  }

  /**
   * Completes the new PL section form.
   *
   * @param participantType - participant audience selected in the dialog
   * @param sectionName - name to enter on the section setup page
   */
  public async createSectionFromDialog(
    participantType: ParticipantType,
    sectionName: string,
  ): Promise<void> {
    await this.participantType(participantType).click();
    await expect(
      this.page.getByRole('heading', {
        name: 'Set up your class sections',
        level: 1,
      }),
    ).toBeVisible();
    await this.page.locator('#uitest-section-name-setup').fill(sectionName);
    await expect(
      this.page.getByRole('button', {name: /Professional Learning/}),
    ).toBeVisible();
    await this.page.locator('#uitest-save-section-changes').first().click();
    await this.page.waitForURL(/\/my-professional-learning/, {timeout: 30_000});
    await expect(
      this.page.getByRole('heading', {
        name: 'Professional Learning',
        level: 1,
      }),
    ).toBeVisible();
  }

  /**
   * Asserts the owned PL section table row count and section link target.
   *
   * @param sectionName - section link text
   * @param expectedRows - expected owned section rows
   */
  public async expectOwnedSection(
    sectionName: string,
    expectedRows: number,
  ): Promise<void> {
    const table = this.page.locator('.uitest-owned-pl-sections');
    await expect(table).toBeVisible();
    await expect(table.locator('tbody tr')).toHaveCount(expectedRows);
    const sectionLink = this.page
      .getByRole('link', {name: sectionName})
      .first();
    await expect(sectionLink).toBeVisible();
    await expect(sectionLink).toHaveAttribute(
      'href',
      /\/teacher_dashboard\/sections\//,
    );
  }

  /**
   * Joins a PL section by code from the visible join form.
   *
   * @param sectionCode - six-character section code
   */
  public async joinSection(sectionCode: string): Promise<void> {
    await expect(
      this.page.getByRole('heading', {
        name: 'Joined Professional Learning Sections',
        level: 2,
      }),
    ).toBeVisible();
    const codeInput = this.page.locator('input.ui-test-join-section');
    await codeInput.scrollIntoViewIfNeeded();
    await codeInput.fill(sectionCode);
    const joinButton = this.page.locator('button.ui-test-join-section');
    await expect(joinButton).toBeEnabled();
    await joinButton.click();
  }

  /**
   * Asserts the joined PL section table row count.
   *
   * @param expectedRows - expected joined section rows
   */
  public async expectJoinedSectionRows(expectedRows: number): Promise<void> {
    const table = this.page.locator('table.ui-test-joined-pl-sections-table');
    await expect(table).toBeVisible();
    await expect(table.locator('tbody tr.test-row')).toHaveCount(expectedRows);
  }

  /**
   * Asserts the visible permission error shown after an invalid join attempt.
   */
  public async expectJoinPermissionError(): Promise<void> {
    await expect(this.page.locator('.announcement-notification')).toContainText(
      'You do not have the permissions to join section',
    );
  }

  private participantType(type: ParticipantType): Locator {
    return this.page.locator(`.uitest-${type}-type`);
  }
}
