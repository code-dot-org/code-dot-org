import {expect, type Locator, type Page} from '@playwright/test';

import {BasePage} from '../../pages/base-page';
import {analyze, WCAG_AA_TAGS} from '../../shared/axe';
import {waitForAnimationsToFinish} from '../../shared/stability';

/** Tab labels of the Mix & Move bubble choice: dancer, music and dance subprojects. */
export type MixMoveAiTab = 'Design' | 'Mix' | 'Move';

/**
 * Page object for the Mix & Move with AI level (BubbleChoice with three
 * subprojects behind tabs: Design = dancer, Mix = music, Move = dance).
 *
 * DOM contract (see apps/src/bubbleChoice/customModes/MusicDanceAi/ and
 * apps/src/music/views/PackDialog.tsx):
 * - The tab strip, subproject controls and pack dialog all render inside
 *   #main_content. Tab buttons are named by label, but the header's "Remix"
 *   button also matches a substring "Mix", so tabs are matched exactly.
 * - Each subproject's controls are <select>s with no accessible name, reachable
 *   only by element id (#creature, #mood, #complexity). They sit on descendants
 *   of the lab mount, so they are the readiness signal, not the container.
 * - The Music tab opens a sound-pack dialog with no dialog role; the "Select a
 *   track" heading is its signal. The first Select click lands on an entry,
 *   which enables the Select button client-side.
 */
export class MixMoveAi extends BasePage {
  /** Dancer (Design tab) creature picker. */
  readonly creature: Locator;

  /** Mood picker; the Design and Mix tabs both have a #mood, but only one tab is mounted at a time. */
  readonly mood: Locator;

  /** Dance (Move tab) code-complexity picker. */
  readonly complexity: Locator;

  /** Heading of the sound-pack dialog the Mix tab opens first. */
  readonly packDialogHeading: Locator;

  /** First track in the sound-pack dialog. */
  readonly firstPackEntry: Locator;

  /** Confirms the chosen track; disabled until an entry is clicked. */
  readonly packDialogSelectButton: Locator;

  constructor(page: Page) {
    super(page);
    // The selects have no accessible name or label (a11y gap); ids are the only handle.
    this.creature = page.locator('#creature');
    this.mood = page.locator('#mood');
    this.complexity = page.locator('#complexity');
    this.packDialogHeading = page.getByRole('heading', {
      name: 'Select a track',
    });
    // Entries are role=button divs named by data-driven track titles (a11y gap: no
    // stable name or container role), so the entry class is the only stable handle.
    this.firstPackEntry = page.locator('.pack-dialog-entry').first();
    this.packDialogSelectButton = this.mainContent.getByRole('button', {
      name: 'Select',
      exact: true,
    });
  }

  /**
   * WCAG AA axe scan of the lab content, scoped to #main_content so the shared
   * header chrome is excluded. Entrance animations (the pack dialog fade, the
   * dancer controls' slide-in) are awaited first so axe reads resting colors,
   * not a mid-fade frame.
   */
  async scanAccessibility(): Promise<Record<string, number>> {
    await waitForAnimationsToFinish(this.mainContent);
    return analyze(this.page, {
      include: this.mainContentSelector,
      tags: WCAG_AA_TAGS,
    });
  }

  /** Create a new standalone project; the app redirects to its /<channel>/edit URL. */
  async gotoNewProject(): Promise<void> {
    await this.page.goto('/projects/music_dance_ai/new');
  }

  /** Assert the new-project route redirected to the channel's edit URL. */
  async expectEditUrl(): Promise<void> {
    await expect(this.page).toHaveURL(/\/projects\/music_dance_ai\//);
    await expect(this.page).toHaveURL(/\/edit/);
  }

  /** Click a tab in the Design / Mix / Move strip. */
  async openTab(tab: MixMoveAiTab): Promise<void> {
    await this.mainContent
      .getByRole('button', {name: tab, exact: true})
      .click();
  }

  /** The lab loads in two phases; the dancer picker appears once it is interactive. */
  async expectDancerTab(): Promise<void> {
    await expect(this.creature).toBeVisible();
  }

  /** Assert the sound-pack dialog opened with its track list. */
  async expectPackDialog(): Promise<void> {
    await expect(this.packDialogHeading).toBeVisible();
    await expect(this.firstPackEntry).toBeVisible();
  }

  /** Pick the first track and confirm; the dialog closes and the music subproject mounts. */
  async selectFirstPack(): Promise<void> {
    await this.firstPackEntry.click();
    await this.packDialogSelectButton.click();
  }

  /** Assert the music subproject rendered. */
  async expectMusicTab(): Promise<void> {
    await expect(this.mood).toBeVisible();
  }

  /** Assert the dance subproject rendered. */
  async expectDanceTab(): Promise<void> {
    await expect(this.complexity).toBeVisible();
  }
}
