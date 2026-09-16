import {
  expect,
  type FrameLocator,
  type Locator,
  type Page,
} from '@playwright/test';

import {labLevelUrl, type LabLevelUrlParams} from '../shared/routes';

import {LessonLevelPage} from './lesson-level-page';

/**
 * The allthethings level backing these tests: lesson "Web Lab 2" position 51,
 * level 11 — a fixed level seeded with an index.html containing a
 * #hello-world-message div (see dashboard/config/levels/custom/weblab2/
 * "Allthethings Weblab2 11.level"). hideProductTours suppresses the onboarding
 * overlays that would otherwise cover the workspace on first load.
 */
const WEBLAB2_LEVEL: LabLevelUrlParams = {
  lesson: 51,
  level: 11,
  hideProductTours: true,
};

/**
 * Page object for Web Lab 2 (Lab2-architecture HTML/CSS/JS lab).
 *
 * DOM contract:
 * - #instructions-panel is the lab2-framework-wide instructions region (see
 *   apps/src/lab2/views/components/Instructions/InstructionsV2.tsx) — not
 *   weblab2-specific, but this is the sole concrete POM for a lab2 lab today.
 * - #uitest-files-list and .codemirror-container come from the shared
 *   Codebridge file browser and lab2 code editor (apps/src/codebridge/,
 *   apps/src/lab2/views/components/editor/CodeEditor.tsx).
 * - The web preview renders through two nested iframes: the outer #preview
 *   iframe (apps/src/weblab2/htmlPreview/HTMLPreview.tsx) loads a
 *   preview.codeprojects.org document that mounts #codeprojects-preview-container
 *   (apps/src/sites/studio/pages/codeprojects_preview/show.js), which in turn
 *   renders the student's own page inside #inner-preview
 *   (apps/src/weblab2/htmlPreview/InnerHTMLPreview.tsx). This preview chain
 *   only resolves on a real deployed environment, not localhost/Drone.
 */
export class WebLab2 extends LessonLevelPage {
  /**
   * The lab2 framework's root container (apps/src/lab2/views/Lab2Wrapper.tsx);
   * wraps the instructions, file browser, editor, and preview. Used to scope
   * axe scans to the lab, excluding the shared site header/footer.
   */
  readonly rootSelector = '#lab-container';

  /** Instructions region; holds the level's long_instructions text. */
  readonly instructionsPanel: Locator;

  /** Codebridge file list (e.g. contains "index.html"). */
  readonly filesList: Locator;

  /** CodeMirror editor container; holds the seeded source content. */
  readonly editorContainer: Locator;

  /** The outer preview <iframe id="preview"> element itself, for visibility checks. */
  readonly previewIframe: Locator;

  /** Content inside the outer preview iframe. */
  readonly previewFrame: FrameLocator;

  /** The outer preview React app's mount point, inside previewFrame. */
  readonly previewContainer: Locator;

  /** The inner preview <iframe id="inner-preview"> element itself, inside previewFrame. */
  readonly innerPreviewIframe: Locator;

  /** Content inside the inner (student page) preview iframe. */
  readonly innerPreviewFrame: FrameLocator;

  /** The hello-world div from the level's seeded index.html source. */
  readonly helloWorldMessage: Locator;

  /** Preview-header toggle that opens the debug (console/network) panel. */
  readonly openDebugPanelButton: Locator;

  /** The debug panel; mounts only while open. */
  readonly debugPanel: Locator;

  /** Preview-header segmented button that switches the preview to mobile view. */
  readonly mobileViewButton: Locator;

  /** Workspace-header segmented button showing the code editor only. */
  readonly codeViewButton: Locator;

  /** Workspace-header segmented button showing the web preview only. */
  readonly previewViewButton: Locator;

  /**
   * AI tutor tab in the instructions side panel. New users (every test run)
   * get a pulsing notification dot here, so visual checkpoints mask the whole
   * tab — the pulse ring animates and overflows the dot's own box.
   */
  readonly aiTutorTab: Locator;

  constructor(page: Page) {
    super(page);
    this.instructionsPanel = page.locator('#instructions-panel');
    this.filesList = page.locator('#uitest-files-list');
    this.editorContainer = page.locator('.codemirror-container');
    this.previewIframe = page.locator('#preview');
    this.previewFrame = page.frameLocator('#preview');
    this.previewContainer = this.previewFrame.locator(
      '#codeprojects-preview-container',
    );
    this.innerPreviewIframe = this.previewFrame.locator('#inner-preview');
    this.innerPreviewFrame = this.previewFrame.frameLocator('#inner-preview');
    this.helloWorldMessage = this.innerPreviewFrame.locator(
      '#hello-world-message',
    );
    this.openDebugPanelButton = page.getByRole('button', {
      name: 'Open debug panel',
    });
    this.debugPanel = page.locator('#debug-panel-container');
    this.mobileViewButton = page.getByRole('button', {name: 'Mobile View'});
    this.codeViewButton = page.getByRole('button', {
      name: 'View code editor only',
    });
    this.previewViewButton = page.getByRole('button', {
      name: 'View web preview only',
    });
    this.aiTutorTab = page.locator('#resource-panel-tab-aiTutor');
  }

  /** Open the debug panel and wait for it to mount. */
  async openDebugPanel(): Promise<void> {
    await this.openDebugPanelButton.click();
    await expect(this.debugPanel).toBeVisible();
  }

  /** Navigate to the Web Lab 2 level and wait for the instructions to mount. */
  async gotoLevel(params: LabLevelUrlParams = WEBLAB2_LEVEL): Promise<void> {
    await this.page.goto(labLevelUrl(params), {waitUntil: 'domcontentloaded'});
    await this.waitForReady();
  }

  /**
   * The lab is ready once the instructions panel mounts. The outer chrome
   * (header, lesson progress) paints first and the content region stays a
   * flat, empty background until the React app hydrates and paints
   * instructions/editor/preview together.
   */
  async waitForReady(): Promise<void> {
    await expect(this.instructionsPanel).toBeVisible();
  }

  /** Assert the instructions, file list, and editor have all mounted with content. */
  async expectEditorLoaded(): Promise<void> {
    await expect(this.instructionsPanel).toContainText(
      'This is the level for a basic Web Lab 2 UI Test. Please do not change the start code for this level without changing the UI test!',
    );
    await expect(this.filesList).toContainText('index.html');
    await expect(this.editorContainer).toContainText('Hello world!');
  }

  /**
   * Wait for the nested web preview to render the seeded page, up to the
   * hello-world element in the preview becoming visible.
   */
  async waitForPreviewLoaded(): Promise<void> {
    await expect(this.previewIframe).toBeVisible();
    await this.previewContainer.waitFor({state: 'attached'});
    await expect(this.innerPreviewIframe).toBeVisible();
    await expect(this.helloWorldMessage).toBeVisible({timeout: 30_000});
  }
}
