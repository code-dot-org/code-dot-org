import {expect, type Page} from '@playwright/test';

import {
  expectCodeStudioHeaderReady,
  waitForStableVisualLayout,
} from '../shared/visualReadiness';

/**
 * Page object for Cucumber's visual page-view smoke scenarios.
 */
export class PageViewsPage {
  /** Playwright page under test. */
  private readonly page: Page;

  /**
   * @param page - Playwright page under test
   */
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Open a dashboard URL and wait for one of the user-visible readiness signals.
   *
   * @param url - absolute or dashboard-relative URL
   * @param selectors - visible selectors that indicate the page is ready
   */
  async openAndExpectReady(url: string, selectors: string[]): Promise<void> {
    await this.page.goto(this.relativeUrl(url), {
      waitUntil: 'domcontentloaded',
    });
    await this.expectAnyVisible(selectors);
    await this.expectLabChromeIfNeeded(selectors);
    await this.dismissOptionalOverlays();
    await this.dismissInstructionsOkIfPresent();
    await this.dismissProjectTemplateCallout();
    await this.expectVideoIframeReadyIfPresent(selectors);
    await this.waitForStableVisualLayout([
      '#visualizationColumn',
      '.editor-column',
      '.csf-top-instructions',
    ]);
    await this.expectAnyVisible(selectors);
  }

  /**
   * Assert the encrypted Play Lab level parsed soft-button properties.
   */
  async expectEncryptedPlayLabButtons(): Promise<void> {
    await expect(this.page.locator('#runButton')).toBeVisible();
    await expect(this.page.locator('#leftButton')).toBeVisible();
  }

  /**
   * Dismiss the language selector overlay if the page presents one.
   */
  async dismissLanguageSelector(): Promise<void> {
    const closeButtons = [
      '.modal-dialog [aria-label="Close"]',
      '.modal-dialog .close',
      '#ui-close-dialog',
    ];

    for (const selector of closeButtons) {
      const button = this.page.locator(selector).first();
      if (await button.isVisible({timeout: 500}).catch(() => false)) {
        await button.click();
        return;
      }
    }
  }

  /**
   * Assert the free-response attachment is not covering the page.
   */
  async expectAttachmentHidden(): Promise<void> {
    await expect(this.page.locator('.uitest-attachment')).toBeHidden();
  }

  /**
   * Wait for the signed-in course overview's next-step CTA to settle.
   *
   * Agent Browser showed the authenticated allthethingscourse overview exposes
   * "Continue" once the page has resolved the user's next level. Capturing
   * earlier can freeze the transient "Try Now" label.
   */
  async expectCourseOverviewContinueReady(): Promise<void> {
    await expect(this.page.getByRole('link', {name: 'Continue'})).toBeVisible({
      timeout: 30_000,
    });
    await waitForStableVisualLayout(this.page, [
      'main',
      '.uitest-summary-progress-table',
      '#course_overview',
    ]);
  }

  /**
   * Wait for dashboard project controls to include their Font Awesome icons.
   */
  async expectStudentHomepageProjectControlsReady(): Promise<void> {
    await this.page.waitForFunction(
      () => {
        const selectors = [
          'a[href="/projects"] i.fa-chevron-right',
          '#uitest-view-full-list i.fa-chevron-down',
        ];

        return selectors.every(selector => {
          const element = document.querySelector(selector);
          if (!element) return false;
          const rect = element.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        });
      },
      undefined,
      {timeout: 30_000},
    );
    await waitForStableVisualLayout(this.page, [
      'a[href="/projects"]',
      '#uitest-view-full-list',
    ]);
  }

  /**
   * Convert a studio.code.org URL to the configured Playwright base URL.
   *
   * @param url - absolute or dashboard-relative URL
   * @returns URL suitable for page.goto()
   */
  private relativeUrl(url: string): string {
    if (url.startsWith('http://studio.code.org')) {
      return url.replace('http://studio.code.org', '');
    }
    if (url.startsWith('https://studio.code.org')) {
      return url.replace('https://studio.code.org', '');
    }
    return url;
  }

  /**
   * Dismiss user-visible overlays that obscure the page after initial load.
   */
  private async dismissOptionalOverlays(): Promise<void> {
    for (let attempt = 0; attempt < 3; attempt++) {
      const overlay = this.page.locator('#overlay');
      if (await overlay.isVisible({timeout: 1000}).catch(() => false)) {
        const modalBackdrop = this.page.locator(
          '.modal-backdrop.in, .modal-backdrop.show',
        );
        if (await modalBackdrop.isVisible({timeout: 500}).catch(() => false)) {
          break;
        }

        await overlay.click({position: {x: 5, y: 5}});
        await expect(overlay).toBeHidden({timeout: 5000});
        continue;
      }

      break;
    }

    await this.dismissLanguageSelector();
  }

  /**
   * Match Cucumber's shared "lab page fully load" readiness signal.
   *
   * @param selectors - readiness selectors requested by the scenario
   */
  private async expectLabChromeIfNeeded(selectors: string[]): Promise<void> {
    if (!selectors.includes('#runButton')) {
      return;
    }

    await expect(this.page.locator('.header_user').first()).toBeVisible();
    await this.expectCodeStudioHeaderReady();
  }

  /**
   * Wait for lab header chrome and progress bubbles when this page view is a
   * Code Studio level page.
   */
  private async expectCodeStudioHeaderReady(): Promise<void> {
    const isCourseLevel = /\/courses\/.*\/lessons\//.test(
      new URL(this.page.url()).pathname,
    );
    if (!isCourseLevel) {
      return;
    }

    await expectCodeStudioHeaderReady(this.page);
  }

  /**
   * Dismiss the auto-open project-template callout when it obscures the
   * workspace. The related-video scenario is about the left help area, not
   * this first-load hint.
   */
  private async dismissProjectTemplateCallout(): Promise<void> {
    const callout = this.page
      .locator('.qtip')
      .filter({hasText: 'This icon means that this level is part'});
    if (!(await callout.isVisible({timeout: 1_000}).catch(() => false))) {
      return;
    }

    const closeButton = callout.getByRole('button').first();
    if (await closeButton.isVisible({timeout: 500}).catch(() => false)) {
      await closeButton.click();
    } else {
      await this.page.keyboard.press('Escape');
    }
    await expect(callout).toBeHidden({timeout: 5_000});
  }

  /**
   * Wait for embedded YouTube chrome when a standalone video page is under
   * test. The page is visible before the iframe paints its play control.
   */
  private async expectVideoIframeReadyIfPresent(
    selectors: string[],
  ): Promise<void> {
    if (
      !selectors.some(selector =>
        ['.video-modal', '.video-player'].includes(selector),
      )
    ) {
      return;
    }

    const videoFrame = this.page
      .locator('iframe.video-player, iframe#video')
      .first();
    if (!(await videoFrame.isVisible({timeout: 500}).catch(() => false))) {
      return;
    }

    await expect(
      this.page
        .frameLocator('iframe.video-player, iframe#video')
        .getByRole('button', {name: 'Play video'})
        .first(),
    ).toBeVisible({timeout: 30_000});
  }

  /**
   * Dismiss the visible instructions OK card when it covers the workspace.
   */
  private async dismissInstructionsOkIfPresent(): Promise<void> {
    const houseSelectionDialog = this.page.locator(
      '#craft-popup-house-selection',
    );
    if (
      await houseSelectionDialog.isVisible({timeout: 500}).catch(() => false)
    ) {
      return;
    }

    const okButton = this.page.getByRole('button', {name: 'OK'});
    if (!(await okButton.isVisible({timeout: 1_000}).catch(() => false))) {
      return;
    }

    await okButton.click();
    await expect(okButton).toBeHidden({timeout: 5_000});
  }

  /**
   * Wait for major legacy lab columns to finish their post-load resizing.
   */
  private async waitForStableVisualLayout(selectors: string[]): Promise<void> {
    await waitForStableVisualLayout(this.page, selectors);
  }

  /**
   * Wait for at least one visible selector from a page-specific readiness set.
   *
   * @param selectors - selectors to test in priority order
   */
  private async expectAnyVisible(selectors: string[]): Promise<void> {
    await expect
      .poll(
        async () => {
          for (const selector of selectors) {
            const locator = this.page.locator(selector).first();
            if (await locator.isVisible({timeout: 500}).catch(() => false)) {
              return selector;
            }
          }
          return '';
        },
        {timeout: 45_000},
      )
      .not.toBe('');
  }
}
