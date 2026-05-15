import {expect, type Locator, type Page} from '@playwright/test';

/**
 * Page object for dashboard certificate and batch-certificate pages.
 */
export class CertificatePage {
  /** Playwright page under test. */
  private readonly page: Page;

  /** Certificate wrapper shown on congrats pages. */
  readonly certificate: Locator;

  /** Certificate image shown inside the certificate wrapper. */
  readonly certificateImage: Locator;

  /** Any generated certificate image. */
  readonly generatedCertificateImage: Locator;

  /** Personalized certificate thank-you message. */
  readonly thanksMessage: Locator;

  /** Certificate print link. */
  readonly printLink: Locator;

  /** Batch certificate form. */
  readonly batchForm: Locator;

  /** Batch certificate names textarea. */
  readonly batchNames: Locator;

  /** Batch certificate submit button. */
  readonly batchSubmitButton: Locator;

  /** Print-only action bar hidden from printed output. */
  readonly batchPrintActions: Locator;

  /** Generated batch certificate images. */
  readonly batchCertificateImages: Locator;

  constructor(page: Page) {
    this.page = page;
    this.certificate = page.locator('#uitest-certificate');
    this.certificateImage = page.locator('#uitest-certificate img').first();
    this.generatedCertificateImage = page
      .locator('img[src*="/certificate_images/"]')
      .first();
    this.thanksMessage = page.locator('#uitest-thanks');
    this.printLink = page.locator('.social-print-link');
    this.batchForm = page.locator('.batch-certificate-form');
    this.batchNames = this.batchForm.getByLabel('Student names');
    this.batchSubmitButton = page.getByRole('button', {
      name: 'Generate Certificates',
    });
    this.batchPrintActions = page.locator('.hide-print');
    this.batchCertificateImages = page.locator('#print-certificate-batch img');
  }

  /**
   * Reset the current session.
   */
  async resetSession(): Promise<void> {
    await this.page.goto('/reset_session');
  }

  /**
   * Open the generic congrats page and wait for the certificate UI.
   */
  async openCongrats(): Promise<void> {
    await this.page.goto('/congrats');
    await this.expectCertificateReady();
  }

  /**
   * Open the course-specific congrats route and wait for its redirect.
   *
   * @param course - course slug in /congrats/:course
   * @param encodedCourse - URL-encoded base64 course parameter expected after redirect
   */
  async openCourseCongrats(
    course: string,
    encodedCourse: string,
  ): Promise<void> {
    await this.page.goto(`/congrats/${course}`);
    await expect(this.page).toHaveURL(
      new RegExp(`/congrats\\?s=${encodedCourse}`),
    );
    await this.expectCertificateReady();
  }

  /**
   * Complete an Hour of Code tutorial through the finish endpoint.
   *
   * @param course - Hour of Code course slug
   */
  async finishHourOfCode(course: string): Promise<void> {
    await this.page.goto(`/api/hour/finish/${course}`);
    await expect(this.page).toHaveURL(/\/congrats/);
    await this.expectCertificateReady();
  }

  /**
   * Assert the core certificate UI is visible and its image has loaded.
   */
  async expectCertificateReady(): Promise<void> {
    await expect(this.certificate).toBeVisible();
    await expect(this.certificateImage).toBeVisible();
    await this.expectImageLoaded(this.certificateImage);
  }

  /**
   * Assert a generated certificate image is visible and loaded.
   */
  async expectGeneratedCertificateImage(): Promise<void> {
    await expect(this.generatedCertificateImage).toBeVisible();
    await this.expectImageLoaded(this.generatedCertificateImage);
  }

  /**
   * Assert the given image has completed loading in the browser.
   *
   * @param image - image locator
   */
  async expectImageLoaded(image: Locator): Promise<void> {
    await expect
      .poll(async () =>
        image.evaluate(
          img =>
            img instanceof HTMLImageElement &&
            img.complete &&
            img.naturalWidth > 0,
        ),
      )
      .toBe(true);
  }

  /**
   * Assert the visible social buttons and print link are present.
   */
  async expectSocialShareControls(): Promise<void> {
    await expect(this.page.locator('.fa-facebook')).toBeVisible();
    await expect(this.page.locator('.fa-x-twitter')).toBeVisible();
    await this.expectPrintLink();
  }

  /**
   * Assert the print link points to the certificate print route.
   */
  async expectPrintLink(): Promise<void> {
    await expect(this.printLink).toHaveAttribute(
      'href',
      /\/print_certificates\//,
    );
  }

  /**
   * Personalize the visible certificate and wait for the generated image.
   *
   * @param name - name to place on the certificate
   */
  async personalize(name: string): Promise<void> {
    await this.page.getByRole('textbox', {name: 'Your name'}).fill(name);
    await this.page.getByRole('button', {name: 'Submit'}).click();
    await expect(this.thanksMessage).toBeVisible();
    await this.expectGeneratedCertificateImage();
  }

  /**
   * Navigate from the old API certificate share URL to the new share page.
   */
  async navigateToSharePageFromQuery(): Promise<void> {
    const sessionId = new URL(this.page.url()).searchParams.get('i');
    expect(sessionId).toBeTruthy();

    await this.page.goto(`/api/hour/certificates/${sessionId}`);
    await expect(this.page).toHaveURL(/\/certificates\//);
    await this.expectGeneratedCertificateImage();
  }

  /**
   * Assert the generated certificate image encodes the expected name/course.
   *
   * @param expected - expected certificate fields
   */
  async expectCustomImageParams(expected: {
    name: string;
    course: string;
  }): Promise<void> {
    const src = await this.generatedCertificateImage.getAttribute('src');
    expect(src).toBeTruthy();

    const encoded = src?.match(/\/certificate_images\/([^/.]+)\.jpg/)?.[1];
    expect(encoded).toBeTruthy();

    const padded = (encoded ?? '').padEnd(
      Math.ceil((encoded ?? '').length / 4) * 4,
      '=',
    );
    const normalized = padded.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(
      Buffer.from(normalized, 'base64').toString('utf8'),
    ) as {name?: string; course?: string};

    expect(decoded.name).toBe(expected.name);
    expect(decoded.course).toBe(expected.course);
  }

  /**
   * Open the certificate image link as a certificate share page.
   */
  async openCertificateImagePage(): Promise<void> {
    const certificateLink = this.page
      .locator('#uitest-certificate a[href*="/certificates/"]')
      .first();
    await expect(certificateLink).toBeVisible();
    await expect(certificateLink).toHaveAttribute('href', /\/certificates\//);

    await Promise.all([
      this.page.waitForURL(/\/certificates\//),
      certificateLink.click(),
    ]);
    await this.expectGeneratedCertificateImage();
  }

  /**
   * Open the print page from a certificate share page.
   */
  async openPrintPageFromSharePage(): Promise<void> {
    const printLink = this.page
      .locator('#certificate-share a[href*="/print_certificates/"]')
      .first();
    await expect(printLink).toBeVisible();
    await expect(printLink).toHaveAttribute('href', /\/print_certificates\//);

    await Promise.all([
      this.page.waitForURL(/\/print_certificates\//),
      printLink.click(),
    ]);
    await this.expectGeneratedCertificateImage();
  }

  /**
   * Mark a CSF course unit complete using the same test API Cucumber uses.
   *
   * @param courseName - course name passed to /api/test/complete_unit
   * @param unitPosition - one-based unit position
   */
  async completeUnit(courseName: string, unitPosition: number): Promise<void> {
    const csrf = await this.page
      .locator('meta[name="csrf-token"]')
      .getAttribute('content');

    const response = await this.page.request.post('/api/test/complete_unit', {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrf ?? '',
      },
      data: {course_name: courseName, unit_position: unitPosition},
    });

    expect(response.ok()).toBe(true);
  }

  /**
   * Open the batch certificate page and wait for its form.
   *
   * @param courseParam - optional encoded course query parameter
   */
  async openBatchCertificates(courseParam?: string): Promise<void> {
    const query = courseParam ? `?course=${courseParam}` : '';
    await this.page.goto(`/certificates/batch${query}`);
    await expect(this.batchForm).toBeVisible();
  }

  /**
   * Submit names for a batch print and wait for all certificates to render.
   *
   * @param names - student names to print
   */
  async submitBatchCertificates(names: string[]): Promise<void> {
    await this.batchNames.fill(names.join('\n'));
    await this.batchSubmitButton.click();
    await expect(this.page).toHaveURL(/\/print_certificates\/batch/);
    await expect(this.batchPrintActions).toBeVisible();
    await expect(this.batchCertificateImages).toHaveCount(names.length);
  }
}
