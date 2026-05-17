import {createStudent} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

import {PageViewsPage} from './PageViewsPage';

const LAB_READY = ['#runButton', '.blocklyWorkspace', '#codeWorkspace'];
const OVERVIEW_READY = ['.uitest-summary-progress-table', '#course_overview'];
const HOME_READY = ['#student-home', '#homepage-container', 'main'];

const INITIAL_PAGE_VIEW_EXAMPLES = [
  {
    name: 'auto open function editor',
    url: '/courses/allthethingscourse/units/1/lessons/3/levels/6?noautoplay=true',
  },
  {
    name: 'star wars',
    url: '/courses/allthethingscourse/units/1/lessons/24/levels/1?noautoplay=true',
  },
  {
    name: 'star wars blocks',
    url: '/courses/allthethingscourse/units/1/lessons/24/levels/2?noautoplay=true',
  },
  {
    name: 'minecraft',
    url: '/courses/allthethingscourse/units/1/lessons/25/levels/1?noautoplay=true',
  },
  {
    name: 'minecraft house dialog',
    url: '/courses/mc/units/1/lessons/1/levels/6',
  },
];

const LOGGED_IN_PAGE_VIEW_EXAMPLES = [
  {
    name: 'new applab project',
    url: '/projects/applab/new',
    selectors: ['#runButton', '#designModeViz', '#codeWorkspace'],
  },
  {
    name: 'logged in student studio homepage',
    url: '/',
    selectors: HOME_READY,
  },
  {
    name: 'logged in script progress',
    url: '/courses/allthethingscourse/units/1',
    selectors: OVERVIEW_READY,
  },
  {
    name: 'unplugged video level',
    url: '/courses/allthethingscourse/units/1/lessons/34/levels/1',
    selectors: ['.video-modal', '.video-player', 'main'],
  },
  {
    name: 'no iframe in dsl',
    url: '/courses/allthethingscourse/units/1/lessons/18/levels/14',
    selectors: ['text=Test Embedded Video in Markdown', 'text=Continue'],
  },
  {
    name: 'rich long assessment',
    url: '/courses/allthethingscourse/units/1/lessons/26/levels/1',
    selectors: ['.submitButton', '.answerbutton', 'main'],
  },
  {
    name: 'free response',
    url: '/courses/allthethingscourse/units/1/lessons/27/levels/1',
    selectors: ['.response', 'textarea', '.submitButton'],
    attachmentHidden: true,
  },
];

const LOGGED_OUT_PAGE_VIEW_EXAMPLES = [
  {
    name: 'logged out studio homepage',
    url: '/users/sign_in',
    selectors: [
      'h2:has-text("Have an account already? Sign in")',
      'button:has-text("Sign in")',
    ],
  },
  {
    name: 'logged out script progress',
    url: '/courses/allthethingscourse/units/1',
    selectors: OVERVIEW_READY,
  },
];

const CSF_PAGE_VIEW_EXAMPLES = [
  {
    name: 'maze level',
    url: '/courses/allthethingscourse/units/1/lessons/2/levels/1?noautoplay=true',
  },
  {
    name: 'artist level',
    url: '/courses/allthethingscourse/units/1/lessons/3/levels/1?noautoplay=true',
  },
  {
    name: 'playlab level',
    url: '/courses/allthethingscourse/units/1/lessons/5/levels/1?noautoplay=true',
  },
  {
    name: 'jigsaw level',
    url: '/courses/allthethingscourse/units/1/lessons/1/levels/1?noautoplay=true',
  },
  {
    name: 'wordsearch level',
    url: '/courses/allthethingscourse/units/1/lessons/4/levels/2?noautoplay=true',
  },
];

test.describe('initial visual page views', () => {
  for (const example of INITIAL_PAGE_VIEW_EXAMPLES) {
    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/initial_page_views.feature
     * Scenario: Simple blockly level page view
     */
    test(`student sees initial page view: ${example.name}`, async ({
      page,
      eyes,
    }) => {
      const pageViews = new PageViewsPage(page);

      await createStudent(page);
      await eyes.open(example.name);
      await pageViews.openAndExpectReady(example.url, LAB_READY);
      await eyes.check('initial load');
    });
  }

  for (const example of LOGGED_IN_PAGE_VIEW_EXAMPLES) {
    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/initial_page_views2.feature
     * Scenario: Logged in simple page view without instructions dialog
     */
    test(`student sees logged-in page view: ${example.name}`, async ({
      page,
      eyes,
    }) => {
      const pageViews = new PageViewsPage(page);

      await createStudent(page);
      await eyes.open(example.name);
      await pageViews.openAndExpectReady(example.url, example.selectors);
      if (example.attachmentHidden) {
        await pageViews.expectAttachmentHidden();
      }
      await eyes.check('initial load');
    });
  }

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/initial_page_views3.feature
   * Scenario: Temporarily circle disabled simple dashboard page view without instructions dialog
   */
  test('student sees embedded blocks page view', async ({page, eyes}) => {
    const pageViews = new PageViewsPage(page);

    await createStudent(page);
    await eyes.open('embedded blocks');
    await pageViews.openAndExpectReady(
      '/courses/allthethingscourse/units/1/lessons/13/levels/1?noautoplay=true',
      ['text=Today you', 'text=Continue'],
    );
    await eyes.check('initial load');
  });

  for (const example of LOGGED_OUT_PAGE_VIEW_EXAMPLES) {
    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/initial_page_views3.feature
     * Scenario: Logged out simple page view without instructions dialog
     */
    test(`signed-out user sees page view: ${example.name}`, async ({
      page,
      eyes,
    }) => {
      const pageViews = new PageViewsPage(page);

      await page.goto('/reset_session');
      await eyes.open(example.name);
      if (example.url === '/users/sign_in') {
        await page.goto('/users/sign_in');
        await expect(page.locator('#signin')).toBeVisible();
        await eyes.check('initial load');
        return;
      }

      await pageViews.openAndExpectReady(example.url, example.selectors);
      await pageViews.dismissLanguageSelector();
      await eyes.check('initial load');
    });
  }

  for (const example of CSF_PAGE_VIEW_EXAMPLES) {
    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/initial_page_views_csf.feature
     * Scenario: Simple blockly level page view
     */
    test(`student sees CSF page view: ${example.name}`, async ({
      page,
      eyes,
    }) => {
      const pageViews = new PageViewsPage(page);

      await createStudent(page);
      await eyes.open(example.name);
      await pageViews.openAndExpectReady(example.url, LAB_READY);
      await eyes.check('initial load');
    });
  }
});

test.describe('encrypted level', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/encrypted_level.feature
   * Scenario: Load Encrypted Play Lab Level
   */
  test('encrypted Play Lab level loads soft buttons', async ({page}) => {
    const pageViews = new PageViewsPage(page);

    await pageViews.openAndExpectReady(
      '/courses/allthethingscourse/units/1/lessons/5/levels/6',
      ['#runButton'],
    );
    await pageViews.expectEncryptedPlayLabButtons();
  });
});

test.describe('related video level', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_video.feature
   * Scenario: Sprite lab level
   */
  test('sprite lab level shows related video area', async ({page, eyes}) => {
    const pageViews = new PageViewsPage(page);

    await createStudent(page);
    await eyes.open('sprite lab level');
    await pageViews.openAndExpectReady(
      '/courses/allthethingscourse/units/1/lessons/36/levels/2',
      ['#belowVisualization'],
    );
    await eyes.check('sprite lab level with related video');
  });
});
