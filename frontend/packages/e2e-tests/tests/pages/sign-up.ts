import {type Locator, type Page} from '@playwright/test';

import {BasePage} from './base-page';

/** The sign-up account-type chooser page. */
export class SignUpPage extends BasePage {
  /**
   * Page heading ("Create your free account"). Scoped to #main_content and
   * first(): both account-type cards below also render an h1, so a bare
   * getByRole('heading', {level: 1}) would match three elements.
   */
  readonly heading: Locator;

  /** Student account-type card (data-testid="student-card"). */
  readonly studentCard: Locator;

  /** Student card heading ("I'm a student"). */
  readonly studentCardHeading: Locator;

  /** Student card sign-up button. */
  readonly studentCardButton: Locator;

  /** Teacher account-type card (data-testid="teacher-card"). */
  readonly teacherCard: Locator;

  /** Teacher card heading ("I'm a teacher"). */
  readonly teacherCardHeading: Locator;

  /** Teacher card sign-up button. */
  readonly teacherCardButton: Locator;

  /**
   * "Free curriculum. Forever." section heading. The only h2 within
   * #main_content (the banner and both card titles are h1; the OneTrust
   * dialog's h2 is outside #main_content), so role+level is unambiguous —
   * no dependency on the decorative icon's class.
   */
  readonly freeCurriculumHeading: Locator;

  /**
   * "Read our commitment to keeping curriculum free for everyone." button.
   * The last button in #main_content: it follows the two account-type card
   * buttons, and the FreeCurriculumDialog it opens portals outside
   * #main_content. Anchored on the content region rather than the icon class.
   */
  readonly readCommitmentButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = this.mainContent.getByRole('heading', {level: 1}).first();
    this.studentCard = page.getByTestId('student-card');
    this.studentCardHeading = this.studentCard.getByRole('heading', {
      level: 1,
    });
    this.studentCardButton = this.studentCard.getByRole('button');
    this.teacherCard = page.getByTestId('teacher-card');
    this.teacherCardHeading = this.teacherCard.getByRole('heading', {
      level: 1,
    });
    this.teacherCardButton = this.teacherCard.getByRole('button');
    this.freeCurriculumHeading = this.mainContent.getByRole('heading', {
      level: 2,
    });
    this.readCommitmentButton = this.mainContent.getByRole('button').last();
  }

  /** Navigate to /users/sign_up/account_type, optionally in a Global Edition region. */
  async goto({globalRegion}: {globalRegion?: string} = {}): Promise<void> {
    await super.goto({path: '/users/sign_up/account_type', globalRegion});
  }
}
