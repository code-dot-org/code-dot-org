import {type Locator, type Page} from '@playwright/test';

import {expect, test} from '../fixtures';
import {CraftLab} from '../pages/craft-lab';
import {LegacyBlocklyLab} from '../pages/legacy-blockly-lab';
import {createStudent, resetSession, signOut} from '../shared/auth';
import {analyze, WCAG_AA_TAGS} from '../shared/axe';
import {waitForVisualStability} from '../shared/stability';

interface InitialPageViewCase {
  testName: string;
  lesson: number;
  level: number;
  lab: 'legacy' | 'craft';
  extraMasks?: (lab: LegacyBlocklyLab) => Locator[];
  /** Measured against #main_content, identical on all three engines. */
  violations: Record<string, number>;
}

const CASES: InitialPageViewCase[] = [
  {
    testName: 'auto open function editor',
    lesson: 3,
    level: 6,
    lab: 'legacy',
    // Its selection ring lands on a different block per load.
    extraMasks: lab => [lab.functionEditorContainer],
    // aria-valid-attr-value: function-editor blocks aria-own ids axe rejects.
    // color-contrast: Run button label, #ffffff on #f46800 is 3.07:1.
    violations: {'aria-valid-attr-value': 2, 'color-contrast': 1},
  },
  {
    testName: 'star wars',
    lesson: 24,
    level: 1,
    lab: 'legacy',
    // color-contrast: Run button label, as above.
    // image-alt: .instructionsImage avatar has no alt.
    // label: droplet's three hidden keystroke-capture inputs.
    violations: {'color-contrast': 1, 'image-alt': 1, label: 3},
  },
  {
    testName: 'star wars blocks',
    lesson: 24,
    level: 2,
    lab: 'legacy',
    // aria-required-children: Blockly's listbox canvas holds role="figure".
    // color-contrast: Run button label, as above.
    violations: {'aria-required-children': 1, 'color-contrast': 1},
  },
  {
    testName: 'minecraft',
    lesson: 25,
    level: 1,
    lab: 'craft',
    // aria-required-children: as "star wars blocks".
    violations: {'aria-required-children': 1},
  },
  {
    testName: 'minecraft house dialog',
    lesson: 25,
    level: 3,
    lab: 'craft',
    // aria-required-children: as "star wars blocks".
    violations: {'aria-required-children': 1},
  },
];

function newLab(page: Page, kind: 'legacy' | 'craft'): LegacyBlocklyLab {
  return kind === 'craft' ? new CraftLab(page) : new LegacyBlocklyLab(page);
}

/** axe cannot resolve a background behind Blockly's overlapping SVG text, so its contrast count varies by engine. */
const UNSCANNABLE = '.blocklyText';

test.describe('Looking at a few things with Applitools Eyes - Part 1', () => {
  for (const testCase of CASES) {
    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/initial_page_views.feature "Simple blockly level page view"
     */
    test(testCase.testName, {tag: '@visual'}, async ({page, visualCheck}) => {
      await resetSession(page);
      await page.goto('/');
      await createStudent(page, {name: 'Tester'});

      const lab = newLab(page, testCase.lab);
      await lab.gotoLevel({lesson: testCase.lesson, level: testCase.level});

      const masks = [
        lab.lessonHeaderInfo,
        // The game canvas renders sprite frames that are not byte-identical across loads.
        lab.visualization,
        ...(testCase.extraMasks?.(lab) ?? []),
      ];
      await waitForVisualStability(page);
      // Per case: snapshotPathTemplate has no per-test component, so a shared name collides.
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

      const lab = newLab(page, testCase.lab);
      await lab.gotoLevel({lesson: testCase.lesson, level: testCase.level});

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
