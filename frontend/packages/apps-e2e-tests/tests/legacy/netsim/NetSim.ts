import {type Locator, type Page} from '@playwright/test';

import {labLevelUrl} from '../../shared/urls';

/**
 * Page Object for the Internet Simulator (NetSim) — allthethingscourse lesson 14.
 *
 * NetSim is not a Blockly lab and does not extend LegacyBlocklyLab.
 * Navigation uses a session reset + direct goto, mirroring the Cucumber background.
 */
export class NetSim {
  /** Underlying Playwright page. */
  readonly page: Page;

  /** Lobby panel — `.netsim-lobby-panel`. */
  readonly lobbyPanel: Locator;

  /** Lobby name input — `#netsim-lobby-name`. */
  readonly lobbyNameInput: Locator;

  /** Set Name button — `#netsim-lobby-set-name-button`. */
  readonly setNameButton: Locator;

  /** Shard selector dropdown — `#netsim-shard-select`. */
  readonly shardSelect: Locator;

  /** Shard selection panel — `.netsim-shard-selection-panel`. */
  readonly shardSelectionPanel: Locator;

  /** First join button in the lobby — `.join-button` (first). */
  readonly joinButton: Locator;

  /** Send panel shown after connecting to a router — `.netsim-send-panel`. */
  readonly sendPanel: Locator;

  /** Lobby container — `.netsim-lobby`. */
  readonly lobby: Locator;

  /** Generic modal overlay — `.modal`. */
  readonly modal: Locator;

  /** Modal body — `.modal-body`. */
  readonly modalBody: Locator;

  /** Close button inside modals — `#x-close`. */
  readonly closeButton: Locator;

  /** Instructions side-panel tab — `#tab_instructions`. */
  readonly tabInstructions: Locator;

  /** First level-progress bubble in the NetSim panel — `.netsim-bubble` (first). */
  readonly instructionsBubble: Locator;

  /** First heading inside the modal — `.modal h1` (first). */
  readonly modalHeading: Locator;

  /** Instructions markdown content inside the modal — `.instructions-markdown`. */
  readonly modalInstructions: Locator;

  constructor(page: Page) {
    this.page = page;
    this.lobbyPanel = page.locator('.netsim-lobby-panel');
    this.lobbyNameInput = page.locator('#netsim-lobby-name');
    this.setNameButton = page.locator('#netsim-lobby-set-name-button');
    this.shardSelect = page.locator('#netsim-shard-select');
    this.shardSelectionPanel = page.locator('.netsim-shard-selection-panel');
    this.joinButton = page.locator('.join-button').first();
    this.sendPanel = page.locator('.netsim-send-panel');
    this.lobby = page.locator('.netsim-lobby');
    this.modal = page.locator('.modal');
    this.modalBody = page.locator('.modal-body');
    this.closeButton = page.locator('#x-close');
    this.tabInstructions = page.locator('#tab_instructions');
    this.instructionsBubble = page.locator('.netsim-bubble').first();
    this.modalHeading = page.locator('.modal h1').first();
    this.modalInstructions = page.locator('.instructions-markdown');
  }

  /**
   * Navigate to a NetSim lesson 14 level via session reset.
   *
   * @param level - level number within lesson 14
   */
  async gotoLevel(level: number): Promise<void> {
    await this.page.goto('/reset_session');
    await this.page.goto(labLevelUrl(14, level));
  }

  /**
   * Dismiss the instructions modal that appears on NetSim level load.
   * Waits for the modal to be visible before clicking close.
   */
  async closeInstructionsModal(): Promise<void> {
    await this.modal.waitFor({state: 'visible', timeout: 10_000});
    await this.closeButton.click();
    await this.modalBody.waitFor({state: 'hidden'});
  }

  /**
   * Type a name into the lobby input and click Set Name.
   * Uses pressSequentially so React's onChange fires per keystroke,
   * enabling the Set Name button.
   *
   * @param name - display name to enter
   */
  async enterName(name: string): Promise<void> {
    await this.lobbyNameInput.waitFor({state: 'visible'});
    await this.lobbyNameInput.pressSequentially(name);
    await this.setNameButton.click();
  }

  /**
   * Suppress the beforeunload confirmation dialog.
   * Call before navigating away from a connected NetSim session to avoid
   * Playwright blocking on the browser dialog.
   */
  async suppressBeforeUnload(): Promise<void> {
    await this.page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__TestInterface.ignoreOnBeforeUnload = true;
    });
  }
}
