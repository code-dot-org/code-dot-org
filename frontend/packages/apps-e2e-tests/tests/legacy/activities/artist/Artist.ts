import {type Locator, type Page} from '@playwright/test';

import {labLevelUrl} from '../../../shared/urls';
import {LegacyBlocklyLab} from '../../shared/LegacyBlocklyLab';

/**
 * Page Object for the Artist (turtle) lab — lesson 3 of allthethingscourse.
 * Extends LegacyBlocklyLab with artist-specific level-art locators.
 */
export class Artist extends LegacyBlocklyLab {
  /** The static artist avatar image used as level art. */
  readonly artistAvatar: Locator;

  /** The intro video thumbnail shown on the first level. */
  readonly videoThumbnail: Locator;

  constructor(page: Page) {
    super(page);
    this.artistAvatar = page.locator('img[src*="artist/small_static_avatar"]');
    this.videoThumbnail = page.locator(
      'img[src*="video_thumbnails/C2_artist_intro"]',
    );
  }

  protected buildLevelUrl(level: number): string {
    return labLevelUrl(3, level);
  }
}
