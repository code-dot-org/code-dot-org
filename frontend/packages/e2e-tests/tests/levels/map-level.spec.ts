import {expect, test} from '../fixtures';
import {MapLevel} from '../pages/map-level';
import {createStudent, resetSession} from '../shared/auth';
import {analyze, WCAG_AA_TAGS} from '../shared/axe';

// Rule id -> failing node count, scoped to #main_content (settle() makes the
// counts deterministic, and this is stable across chromium/firefox/webkit).
// Inventory:
//   image-alt: the reference article's inline circuit-board photo has no alt
//     text (the framed doc's <img> right after the LED intro paragraph).
//   frame-title: the #curriculum-reference <iframe> itself has no title
//     attribute (see dashboard/app/views/levels/_curriculum_reference.haml).
const EXPECTED_VIOLATIONS: Record<string, number> = {
  'image-alt': 1,
  'frame-title': 1,
};

test.describe('Map Levels', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/map_level.feature "Map level displays content"
   */
  test('Map level displays content', {tag: '@no_mobile'}, async ({page}) => {
    await resetSession(page);
    await page.goto('/');
    await createStudent(page, {name: 'Lillian'});

    const level = new MapLevel(page);
    await level.gotoLevel({lesson: 35, level: 1});

    await expect(level.referenceBody).toContainText(
      'Welcome to the Circuit Playground',
    );
    await expect(level.referenceBody).toContainText(
      'The Light Emitting Diode (LED)',
    );

    // Gate the scan on the iframe's own visibility flip (its onload handler
    // reveals it and hides the loading spinner) rather than relying solely on
    // the content check above, which polls a descendant and can otherwise
    // catch #main_content mid-transition.
    await expect(level.referenceIframe).toBeVisible();

    expect(
      await analyze(page, {
        include: level.mainContentSelector,
        tags: WCAG_AA_TAGS,
      }),
    ).toEqual(EXPECTED_VIOLATIONS);
  });
});
