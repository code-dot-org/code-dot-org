import {type Page} from '@playwright/test';

import {expect, test} from '../fixtures';
import {LegacyBlocklyLab} from '../pages/legacy-blockly-lab';
import {createStudent, resetSession, signOut} from '../shared/auth';
import {analyze, WCAG_AA_TAGS} from '../shared/axe';
import {labLevelUrl} from '../shared/routes';
import {waitForVisualStability} from '../shared/stability';

interface InitialPageViewCase {
  testName: string;
  lesson: number;
  level: number;
  /** Jigsaw hides #runButton (display:none) — it is a drag puzzle, not a run-then-check lab. */
  hasRunButton: boolean;
  violations: Record<string, number>;
}

const CASES: InitialPageViewCase[] = [
  {
    testName: 'maze level',
    lesson: 2,
    level: 1,
    hasRunButton: true,
    // aria-required-children: Blockly's listbox canvas holds role="figure".
    // color-contrast: Run button label, #ffffff on #f46800 is 3.07:1.
    violations: {'aria-required-children': 1, 'color-contrast': 1},
  },
  {
    testName: 'artist level',
    lesson: 3,
    level: 1,
    hasRunButton: true,
    // aria-required-children: Blockly's listbox canvas holds role="figure".
    // color-contrast: Run button label, #ffffff on #f46800 is 3.07:1.
    violations: {'aria-required-children': 1, 'color-contrast': 1},
  },
  {
    testName: 'playlab level',
    lesson: 5,
    level: 1,
    hasRunButton: true,
    // aria-required-children: Blockly's listbox canvas holds role="figure".
    // color-contrast: Run button label, #ffffff on #f46800 is 3.07:1.
    violations: {'aria-required-children': 1, 'color-contrast': 1},
  },
  {
    testName: 'jigsaw level',
    lesson: 1,
    level: 1,
    hasRunButton: false,
    violations: {},
  },
  {
    testName: 'wordsearch level',
    lesson: 4,
    level: 2,
    hasRunButton: true,
    // aria-required-children: Blockly's listbox canvas holds role="figure".
    // button-name: #currentWord spelling button contains only an img with no alt text.
    // color-contrast: Run button label, #ffffff on #f46800 is 3.07:1.
    violations: {
      'aria-required-children': 1,
      'button-name': 1,
      'color-contrast': 1,
    },
  },
];

/** axe cannot resolve a background behind Blockly's overlapping SVG text, so its contrast count varies by engine. */
const UNSCANNABLE = '.blocklyText';

/**
 * Navigate to a CSF level and wait for it to be interactive. Most CSF labs
 * expose a visible #runButton and use LegacyBlocklyLab.gotoLevel(). Jigsaw
 * hides the run button (display:none) because it is a drag puzzle, so we
 * wait for the Blockly workspace region instead.
 */
async function gotoCSFLevel(
  page: Page,
  lab: LegacyBlocklyLab,
  testCase: InitialPageViewCase,
): Promise<void> {
  if (testCase.hasRunButton) {
    await lab.gotoLevel({lesson: testCase.lesson, level: testCase.level});
    return;
  }
  await page.goto(
    labLevelUrl({lesson: testCase.lesson, level: testCase.level}),
    {waitUntil: 'domcontentloaded'},
  );
  await expect(lab.loadingSpinner).toBeHidden({timeout: 45_000});
  await expect(
    page.getByRole('region', {name: 'Blocks workspace.'}),
  ).toBeVisible({timeout: 45_000});
  await lab.header.waitForUserChrome();
  await lab.introVideoModal.dismissIfShown();
  const overlay = page.locator('#overlay');
  if (await overlay.isVisible()) {
    const dialogOk = lab.instructionsPanel.locator('hr + button');
    await expect(async () => {
      if (await dialogOk.isVisible()) {
        await dialogOk.click();
      } else {
        await overlay.click();
      }
      await expect(overlay).toBeHidden({timeout: 2_000});
    }).toPass({timeout: 45_000});
  }
  await lab.header.waitForFadeIn();
}

test.describe('Looking at a few things with Applitools Eyes - CSF Levels', () => {
  for (const testCase of CASES) {
    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/initial_page_views_csf.feature "Simple blockly level page view"
     */
    test(testCase.testName, {tag: '@visual'}, async ({page, visualCheck}) => {
      await resetSession(page);
      await page.goto('/');
      await createStudent(page, {name: 'Tester'});

      const lab = new LegacyBlocklyLab(page);
      await gotoCSFLevel(page, lab, testCase);

      const masks = [lab.lessonHeaderInfo, lab.visualization];
      await waitForVisualStability(page);
      await visualCheck(testCase.testName, {mask: masks});

      await signOut(page);
    });
  }

  for (const testCase of CASES) {
    /** Net-new coverage; no Cucumber source. */
    test(`${testCase.testName}: no unexpected accessibility violations`, async ({
      page,
    }) => {
      await resetSession(page);
      await page.goto('/');
      await createStudent(page, {name: 'Tester'});

      const lab = new LegacyBlocklyLab(page);
      await gotoCSFLevel(page, lab, testCase);

      expect(
        await analyze(page, {
          include: lab.mainContentSelector,
          exclude: UNSCANNABLE,
          tags: WCAG_AA_TAGS,
        }),
      ).toEqual(testCase.violations);

      await signOut(page);
    });
  }
});
