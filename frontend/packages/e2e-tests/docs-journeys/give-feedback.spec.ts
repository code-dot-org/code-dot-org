import {test, expect, type Page} from '@playwright/test';

import {requestWithCsrf} from '../tests/shared/api';
import {
  createUser,
  createStudent,
  signIn,
  resetSession,
  type UserCredentials,
} from '../tests/shared/auth';

import {docsScreenshot} from './helpers';

/**
 * POST a milestone (progress report) for the current user on a level.
 * Uses form-encoded body like the real client does.
 */
async function postMilestone(
  page: Page,
  opts: {
    userId: number;
    scriptLevelId: number;
    levelId: number;
    courseId?: number;
    program?: string;
    testResult: number;
    submitted?: boolean;
  },
): Promise<{ok: boolean; status: number}> {
  const qs = opts.courseId ? `?course_id=${opts.courseId}` : '';
  const url = `/milestone/${opts.userId}/${opts.scriptLevelId}/${opts.levelId}${qs}`;
  const body = new URLSearchParams({
    result: 'true',
    testResult: String(opts.testResult),
    submitted: String(opts.submitted ?? false),
    app: 'free_response',
    level: '1',
    lines: '0',
    attempt: '1',
    time: '5000',
    timeSinceLastMilestone: '5000',
    ...(opts.program ? {program: opts.program} : {}),
  }).toString();

  return page.evaluate(
    async ({url, body}) => {
      const csrfToken =
        document
          .querySelector('meta[name="csrf-token"]')
          ?.getAttribute('content') ?? '';
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'X-CSRF-Token': csrfToken,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      });
      return {ok: resp.ok, status: resp.status};
    },
    {url, body},
  );
}

// csd2-2024 level IDs (from rails runner).
const FR_SCRIPT_LEVEL_ID = 20455; // FreeResponse "CSD L2 Assess FR"
const FR_LEVEL_ID = 30128;
const MULTI_SCRIPT_LEVEL_ID = 20460; // Multi "CSD Header Size MC"
const MULTI_LEVEL_ID = 12757;
const CSD_COURSE_ID = 53;

// Activity result constant (lib/cdo/activity_constants.rb).
const BEST_PASS_RESULT = 100;

interface SeededState {
  teacher: UserCredentials;
  student: UserCredentials;
  sectionId: number;
  sectionCode: string;
  studentUserId: number;
}

test.describe('Feedback and grading screenshots', () => {
  let state: SeededState;

  test.beforeAll(async ({browser}) => {
    const page = await browser.newPage();
    await page.goto('/');

    // Create teacher.
    const teacher = await createUser(page, {
      type: 'teacher',
      name: 'Ms. Reyes',
    });
    await page.goto('/');

    // Grant the teacher verified/authorized status so feedback controls are enabled.
    const authResp = await requestWithCsrf(
      page,
      'POST',
      '/api/test/authorized_teacher_access',
    );
    expect(authResp.ok).toBe(true);

    // Create section.
    const sectionResp = await requestWithCsrf(
      page,
      'POST',
      '/dashboardapi/sections',
      {
        login_type: 'email',
        participant_type: 'student',
        name: 'Period 2 - Web Development',
        grades: ['7', '8'],
      },
    );
    expect(sectionResp.ok).toBe(true);
    const {id: sectionId, code: sectionCode} = JSON.parse(sectionResp.body) as {
      id: number;
      code: string;
    };

    // Assign csd2-2024 to the section.
    const assignResp = await requestWithCsrf(
      page,
      'POST',
      '/api/test/assign_section_to_course_and_unit',
      {course_name: 'csd-2024', unit_position: 2, section_position: 1},
    );
    expect(assignResp.ok).toBe(true);

    // Enroll three filler students.
    for (const name of ['Priya Patel', 'Jordan Lee', 'Alex Kim']) {
      await resetSession(page);
      await page.goto('/');
      await createStudent(page, {name});
      await page.goto('/');
      const joinResp = await requestWithCsrf(
        page,
        'POST',
        `/api/v1/sections/${sectionCode}/join`,
      );
      expect(joinResp.ok).toBe(true);
    }

    // Create the student who will submit work.
    await resetSession(page);
    await page.goto('/');
    const student = await createStudent(page, {name: 'Sam Rivera'});
    await page.goto('/');

    const joinResp = await requestWithCsrf(
      page,
      'POST',
      `/api/v1/sections/${sectionCode}/join`,
    );
    expect(joinResp.ok).toBe(true);

    // Retrieve Sam's user id.
    const meResp = await page.evaluate(async () => {
      const r = await fetch('/api/v1/users/current');
      return {ok: r.ok, body: await r.text()};
    });
    expect(meResp.ok).toBe(true);
    const {id: studentUserId} = JSON.parse(meResp.body) as {id: number};

    // POST milestones for lessons 2 and 3 to produce visible progress bubbles.
    // Lesson 2, levels 1-5 (Weblab): mark as completed.
    const lesson2Levels = [
      {slId: 20448, levelId: 60624},
      {slId: 20449, levelId: 59346},
      {slId: 20450, levelId: 59081},
      {slId: 20451, levelId: 59065},
      {slId: 20452, levelId: 59097},
    ];
    for (const {slId, levelId} of lesson2Levels) {
      const r = await postMilestone(page, {
        userId: studentUserId,
        scriptLevelId: slId,
        levelId,
        courseId: CSD_COURSE_ID,
        testResult: BEST_PASS_RESULT,
      });
      expect(r.ok).toBe(true);
    }

    // Lesson 2, level 8: FreeResponse with text (assessment).
    const frResp = await postMilestone(page, {
      userId: studentUserId,
      scriptLevelId: FR_SCRIPT_LEVEL_ID,
      levelId: FR_LEVEL_ID,
      courseId: CSD_COURSE_ID,
      program:
        'The Internet works by sending data in small packets between computers. Each packet finds its own route, and they reassemble at the destination.',
      testResult: BEST_PASS_RESULT,
    });
    expect(frResp.ok).toBe(true);

    // Lesson 3, level 4: Multi (assessment).
    const multiResp = await postMilestone(page, {
      userId: studentUserId,
      scriptLevelId: MULTI_SCRIPT_LEVEL_ID,
      levelId: MULTI_LEVEL_ID,
      courseId: CSD_COURSE_ID,
      testResult: BEST_PASS_RESULT,
    });
    expect(multiResp.ok).toBe(true);

    state = {teacher, student, sectionId, sectionCode, studentUserId};
    await page.close();
  });

  test('tracking-progress: progress grid with completed bubbles', async ({
    page,
  }) => {
    await page.goto('/');
    await signIn(page, state.teacher);
    await page.goto(`/teacher_dashboard/sections/${state.sectionId}/progress`);

    await expect(page.getByText('Sam Rivera').first()).toBeVisible({
      timeout: 30_000,
    });

    await docsScreenshot(
      page,
      'guide/progress/tracking-progress.md',
      'progress',
    );
  });

  test('tracking-progress: text responses tab', async ({page}) => {
    await page.goto('/');
    await signIn(page, state.teacher);
    await page.goto(
      `/teacher_dashboard/sections/${state.sectionId}/text_responses`,
    );

    // Wait for text responses table.
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);

    const table = page.locator('#text-responses-table');
    const tableVisible = await table
      .isVisible({timeout: 15_000})
      .catch(() => false);

    if (tableVisible) {
      await docsScreenshot(
        page,
        'guide/progress/tracking-progress.md',
        'text-responses',
      );
    } else {
      // Capture the page even if the table isn't shown (maybe needs unit selection).
      await docsScreenshot(
        page,
        'guide/progress/tracking-progress.md',
        'text-responses',
      );
    }
  });

  test('tracking-progress: assessments tab', async ({page}) => {
    await page.goto('/');
    await signIn(page, state.teacher);
    await page.goto(
      `/teacher_dashboard/sections/${state.sectionId}/assessments`,
    );

    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);

    await docsScreenshot(
      page,
      'guide/progress/tracking-progress.md',
      'assessments',
    );
  });

  test('giving-feedback: teacher views student FreeResponse with rubric', async ({
    page,
  }) => {
    await page.goto('/');
    await signIn(page, state.teacher);

    // Teacher views student's FreeResponse level by appending user_id.
    await page.goto(
      `/s/csd2-2024/lessons/2/levels/8?user_id=${state.studentUserId}`,
    );
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(8000);

    await docsScreenshot(
      page,
      'guide/progress/giving-feedback-and-grading.md',
      'student-work-feedback',
    );
  });

  test('giving-feedback: teacher feedback tab on a Weblab level', async ({
    page,
  }) => {
    await page.goto('/');
    await signIn(page, state.teacher);

    // Navigate to a Weblab level (lesson 2 level 1) as teacher viewing Sam's work.
    await page.goto(
      `/s/csd2-2024/lessons/2/levels/1?user_id=${state.studentUserId}&noautoplay=true`,
    );
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(8000);

    // Look for the feedback tab in the instructions panel.
    const feedbackTab = page.locator('.uitest-feedback');
    const feedbackTabVisible = await feedbackTab
      .isVisible({timeout: 10_000})
      .catch(() => false);
    if (feedbackTabVisible) {
      await feedbackTab.click();
      await page.waitForTimeout(2000);

      // Crop: feedback input area.
      const feedbackInput = page.locator('#ui-test-feedback-input');
      if (await feedbackInput.isVisible({timeout: 5000}).catch(() => false)) {
        await docsScreenshot(
          page,
          'guide/progress/giving-feedback-and-grading.md',
          'feedback-input',
          {locator: feedbackInput},
        );
      }

      // Crop: submit feedback button.
      const submitFeedback = page.locator('#ui-test-submit-feedback');
      if (await submitFeedback.isVisible({timeout: 5000}).catch(() => false)) {
        await docsScreenshot(
          page,
          'guide/progress/giving-feedback-and-grading.md',
          'submit-feedback-button',
          {locator: submitFeedback},
        );
      }
    }

    // Viewport: teacher view of student's Weblab work with instructions panel.
    await docsScreenshot(
      page,
      'guide/progress/giving-feedback-and-grading.md',
      'weblab-teacher-view',
    );
  });

  test('student progress: completed bubbles after submitting work', async ({
    page,
  }) => {
    await page.goto('/');
    await signIn(page, state.student);

    // Navigate directly to the unit progress page.
    await page.goto('/s/csd2-2024');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Expand lesson 2 (Intro to HTML) which has the completed FreeResponse.
    const lesson2 = page.getByText('Lesson 2: Intro to HTML').first();
    if (await lesson2.isVisible({timeout: 10_000}).catch(() => false)) {
      await lesson2.click();
      await page.waitForTimeout(2000);
    }

    // Scroll to lesson 2 to center the expanded content with progress bubbles.
    await lesson2.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    // Viewport: student progress view with expanded lesson and progress bubbles.
    await docsScreenshot(
      page,
      'guide/progress/your-progress.md',
      'progress-view',
    );

    // Crop: the lesson content area showing activity-group labels and green
    // completion bubbles. Use bounding boxes of the first and last visible
    // bubble links to compute a tight clip that covers all bubble rows.
    const allBubbles = page.locator('.progress-bubble-link');
    const bubbleCount = await allBubbles.count();
    if (bubbleCount >= 2) {
      const firstBox = await allBubbles.first().boundingBox();
      const lastBox = await allBubbles
        .nth(Math.min(bubbleCount - 1, 6))
        .boundingBox();
      if (firstBox && lastBox) {
        // Include 60px above the first bubble for the activity label.
        const x = Math.max(0, firstBox.x - 80);
        const y = Math.max(0, firstBox.y - 60);
        const right = lastBox.x + lastBox.width + 40;
        const bottom = lastBox.y + lastBox.height + 20;
        const outPath = (await import('node:path')).join(
          (await import('node:path')).resolve(
            __dirname,
            '..',
            '..',
            '..',
            '..',
          ),
          'docs',
          'students',
          'images',
          'your-progress-status-indicators.png',
        );
        await page.screenshot({
          path: outPath,
          clip: {x, y, width: right - x, height: bottom - y},
        });
      }
    }
  });

  test('archive-a-section: section card menu on home page', async ({page}) => {
    await page.goto('/');
    await signIn(page, state.teacher);
    await page.evaluate(() => {
      try {
        localStorage.setItem('2026-codeai-rebrand-banner', 'false');
      } catch {
        /* localStorage may be unavailable (e.g. blocked in this context). */
      }
      document.cookie =
        'hide_codeai_logo_transition=true; path=/; max-age=86400';
    });
    await page.goto('/home');

    await expect(
      page.getByText('Period 2 - Web Development').first(),
    ).toBeVisible({timeout: 20_000});

    // Find the section card's kebab menu (three-dot button).
    const menuButton = page
      .locator(
        '#ui-test-section-list button[aria-haspopup], ' +
          '#ui-test-section-list .uitest-section-dropdown, ' +
          '#ui-test-section-list [class*="kebab"], ' +
          '#ui-test-section-list [aria-label*="ection"] button',
      )
      .first();
    const menuVisible = await menuButton
      .isVisible({timeout: 5000})
      .catch(() => false);
    if (menuVisible) {
      await menuButton.click();
      await page.waitForTimeout(500);
      await docsScreenshot(
        page,
        'guide/sections/archive-a-section.md',
        'section-menu',
      );
    }
  });

  test('print-certificates: certificates page', async ({page}) => {
    await page.goto('/');
    await signIn(page, state.teacher);
    await page.goto('/certificates');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    await docsScreenshot(
      page,
      'guide/curriculum/certificates.md',
      'certificates-page',
    );
  });
});
