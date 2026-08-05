import {labLevelUrl} from '../shared/routes';

/** A callout dismissable by clicking a target element (Scenario Outline 1). */
export interface CalloutTargetTestCase {
  title: string;
  url: string;
  calloutId: number;
  text: string;
  /** Selector the callout hides on click of (qTip element_id). */
  closeTarget: string;
}

/** A callout dismissable via its x-button (Scenario Outline 2, @no_mobile). */
export interface CalloutCloseButtonTestCase {
  title: string;
  url: string;
  calloutId: number;
  text: string;
}

export const CALLOUT_TARGET_TEST_CASES: CalloutTargetTestCase[] = [
  {
    title:
      'callout 0 (run button) has correct content and is dismissable via run button on maze level 7',
    url: labLevelUrl({lesson: 2, level: 7, showCallouts: true}),
    calloutId: 0,
    text: 'After snapping all the blocks together, press "Run" to start your program.',
    closeTarget: '#runButton',
  },
  {
    title:
      'callout 1 (show-code) has correct content and is dismissable via show-code-header on maze level 7',
    url: labLevelUrl({lesson: 2, level: 7, showCallouts: true}),
    calloutId: 1,
    text: "Click here to see the code for the program you're making",
    closeTarget: '#show-code-header',
  },
  {
    title:
      'callout 1 (run button) has correct content and is dismissable via run button on ui-test-maze level 1',
    url: labLevelUrl({course: 'ui-test-maze', lesson: 1, level: 1}),
    calloutId: 1,
    text: 'Hit "Run" to try your program',
    closeTarget: '#runButton',
  },
  {
    title:
      'callout 0 (moveForward) has correct content and is dismissable via moveForward block on ui-test-maze level 1',
    url: labLevelUrl({course: 'ui-test-maze', lesson: 1, level: 1}),
    calloutId: 0,
    text: 'Drag a "move" block and snap it below the other block',
    closeTarget: "[data-id='moveForward']",
  },
  {
    title:
      'callout 0 (grey block) has correct content and is dismissable via g element on ui-test-maze level 4',
    url: labLevelUrl({course: 'ui-test-maze', lesson: 1, level: 4}),
    calloutId: 0,
    text: "Blocks that are grey can't be deleted. Can you solve the puzzle anyway?",
    closeTarget: 'g',
  },
];

export const CALLOUT_CLOSE_BUTTON_TEST_CASES: CalloutCloseButtonTestCase[] = [
  {
    title:
      'callout 0 has correct content and is dismissable via x-button on ui-test-maze level 3',
    url: labLevelUrl({course: 'ui-test-maze', lesson: 1, level: 3}),
    calloutId: 0,
    text: 'Click here to watch the video again',
  },
  {
    title:
      'callout 0 has correct content and is dismissable via x-button on artist level 7',
    url: labLevelUrl({lesson: 3, level: 7, showCallouts: true}),
    calloutId: 0,
    text: "You have all the same blocks but they've now been arranged in categories",
  },
];
