import {expect, test} from '../../fixtures';

import {MixMoveAi} from './mix-move-ai';

/*
 * Measured on chromium against test-studio; four consecutive runs agreed.
 * Firefox and WebKit are skipped below, so there is no per-engine override.
 *
 * dancer      select-name x4: the creature, attire, mood and style <select>s
 *             (#creature, #attire, #mood, #style) sit in sentence text with no
 *             wrapped <label>, aria-label or id-linked label.
 * packDialog  aria-command-name x1: the dialog's focus-trap sentinel
 *             <div id="hidden-item" role="button"> has no text or label.
 * music       select-name x3: #mood, #length, #drums, same cause as dancer.
 * dance       select-name x3: #complexity, #energy, #dancers, same cause.
 *             aria-required-children x1: the flyout g[role="listbox"] holds
 *             role=figure children, which a listbox does not allow.
 */
const EXPECTED_VIOLATIONS: Record<string, Record<string, number>> = {
  dancer: {'select-name': 4},
  packDialog: {'aria-command-name': 1},
  music: {'select-name': 3},
  dance: {'aria-required-children': 1, 'select-name': 3},
};

test.describe('Mix & Move with AI standalone project', () => {
  test.skip(
    ({browserName}) => browserName === 'webkit',
    '@no_safari: the level is chromium-only in the Cucumber suite too',
  );
  test.skip(
    ({browserName}) => browserName === 'firefox',
    '@no_firefox: the level is chromium-only in the Cucumber suite too',
  );

  test(
    'A new project opens on the dancer and switches between its subprojects',
    {tag: ['@no_mobile', '@no_safari', '@no_firefox']},
    async ({page}) => {
      const lab = new MixMoveAi(page);

      await lab.gotoNewProject();
      await lab.expectEditUrl();

      // Dancer first.
      await lab.expectDancerTab();
      expect(await lab.scanAccessibility()).toEqual(EXPECTED_VIOLATIONS.dancer);

      // Music, behind its sound-pack dialog.
      await lab.openTab('Mix');
      await lab.expectPackDialog();
      expect(await lab.scanAccessibility()).toEqual(
        EXPECTED_VIOLATIONS.packDialog,
      );
      await lab.selectFirstPack();
      await lab.expectMusicTab();
      expect(await lab.scanAccessibility()).toEqual(EXPECTED_VIOLATIONS.music);

      // Dance.
      await lab.openTab('Move');
      await lab.expectDanceTab();
      expect(await lab.scanAccessibility()).toEqual(EXPECTED_VIOLATIONS.dance);

      // And back.
      await lab.openTab('Design');
      await lab.expectDancerTab();
    },
  );
});
