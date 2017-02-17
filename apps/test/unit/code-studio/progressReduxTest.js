import { assert } from 'chai';
import { TestResults } from '@cdo/apps/constants';
import { LevelStatus, LevelKind } from '@cdo/apps/code-studio/activityUtils';
import _ from 'lodash';

import reducer, {
  initProgress,
  mergeProgress,
  mergePeerReviewProgress,
  disablePostMilestone,
  setUserSignedIn,
  setIsHocScript,
  setIsSummaryView,
  SignInState,
  levelsByLesson,
  progressionsFromLevels,
  categorizedLessons,
  statusForLevel
} from '@cdo/apps/code-studio/progressRedux';

// This is some sample stage data taken a course. I truncated to the first two
// stages, and also truncated the second stage to the first 3 levels
const stageData = [
  // stage 1
  {
    script_id: 36,
    script_name: "course3",
    script_stages: 21,
    freeplay_links: ["playlab", "artist"],
    id: 264,
    position: 1,
    name: "Computational Thinking",
    title: "Stage 1: Computational Thinking",
    flex_category: null,
    lockable: false,
    levels: [
      {
        ids: [2106],
        activeId: 2106,
        position: 1,
        kind: LevelKind.unplugged,
        icon: null,
        title: "Unplugged Activity",
        url: "http://localhost-studio.code.org:3000/s/course3/stage/1/puzzle/1",
        previous: false
      },
      {
          ids: [323],
          activeId: 323,
          position: 2,
          kind: LevelKind.assessment,
          icon: null,
          title: 1,
          url: "http://localhost-studio.code.org:3000/s/course3/stage/1/puzzle/2"
      },
      {
          ids: [322],
          activeId: 322,
          position: 3,
          kind: LevelKind.assessment,
          icon: null,
          title: 2,
          url: "http://localhost-studio.code.org:3000/s/course3/stage/1/puzzle/3",
          next: [2, 1]
      }
    ],
    lesson_plan_html_url: "//localhost.code.org:3000/curriculum/course3/1/Teacher",
    lesson_plan_pdf_url: "//localhost.code.org:3000/curriculum/course3/1/Teacher.pdf"
  },
  // stage 2 (hacked to have 3 levels)
  {
    script_id: 36,
    script_name: "course3",
    script_stages: 3,
    freeplay_links: ["playlab", "artist"],
    id: 265,
    position: 2,
    name: "Maze",
    title: "Stage 2: Maze",
    flex_category: null,
    lockable: false,
    levels: [
      {
        ids: [330],
        activeId: 330,
        position: 1,
        kind: LevelKind.puzzle,
        icon: null,
        title: 1,
        url: "http://localhost-studio.code.org:3000/s/course3/stage/2/puzzle/1",
        previous: [1, 3]
      }, {
        ids: [339],
        activeId: 339,
        position: 2,
        kind: LevelKind.puzzle,
        icon: null,
        title: 2,
        url: "http://localhost-studio.code.org:3000/s/course3/stage/2/puzzle/2",
      }, {
        ids: [341],
        activeId: 341,
        position: 3,
        kind: LevelKind.puzzle,
        icon: null,
        title: 3,
        url: "http://localhost-studio.code.org:3000/s/course3/stage/2/puzzle/3",
      }
    ],
    lesson_plan_html_url: "//localhost.code.org:3000/curriculum/course3/2/Teacher",
    lesson_plan_pdf_url: "//localhost.code.org:3000/curriculum/course3/2/Teacher.pdf"
  }
];

// In the app, this is passed to the client as part of the initial page load. We
// get this data by running Script::summarize
const initialScriptOverviewProgress = {
  currentLevelId: undefined,
  professionalLearningCourse: false,
  saveAnswersBeforeNavigation: false,
  stages: stageData,
  scriptName: 'course3'
};

// The initial progress passed to the puzzle page
const initialPuzzlePageProgress = {
  currentLevelId: "341",
  professionalLearningCourse: false,
  saveAnswersBeforeNavigation: false,
  // We're on a puzzle in stage 2. That is the only provided stage
  stages: [stageData[1]],
  scriptName: 'course3'
};

describe('progressReduxTest', () => {
  describe('reducer', () => {
    const initialState = reducer(undefined, {});

    it('can initialize progress on script overview page', () => {
      // Simulate progress initialization from script overview page
      const action = initProgress(initialScriptOverviewProgress);
      const nextState = reducer(undefined, action);

      assert.equal(nextState.currentLevelId, undefined);
      assert.equal(nextState.professionalLearningCourse, false);
      assert.equal(nextState.saveAnswersBeforeNavigation, false);
      assert.deepEqual(nextState.stages, initialScriptOverviewProgress.stages);
      assert.equal(nextState.scriptName, 'course3');
      assert.equal(nextState.currentStageId, undefined);
    });

    it('can initialize progress on puzzle page', () => {
      const action = initProgress(initialPuzzlePageProgress);
      const nextState = reducer(undefined, action);

      assert.equal(nextState.currentLevelId, "341");
      assert.equal(nextState.professionalLearningCourse, false);
      assert.equal(nextState.saveAnswersBeforeNavigation, false);
      assert.deepEqual(nextState.stages, initialPuzzlePageProgress.stages);
      assert.equal(nextState.scriptName, 'course3');
      assert.equal(nextState.currentStageId, 265);
    });

    it ('can merge in fresh progress', () => {
      const initializedState = reducer(undefined, initProgress(initialScriptOverviewProgress));

      // Create a mergeProgress action with level progress, but no peer reviews
      const action = mergeProgress({
        // stage 2 level 2 is pass
        339: TestResults.ALL_PASS,
        // stage 2 level 3 is incomplete
        341: TestResults.MISSING_RECOMMENDED_BLOCK_UNFINISHED
      });
      const nextState = reducer(initializedState, action);

      assert.deepEqual(nextState.levelProgress, {
        339: TestResults.ALL_PASS,
        341: TestResults.MISSING_RECOMMENDED_BLOCK_UNFINISHED
      });

      // stages are unchanged
      assert.strictEqual(nextState.stages, initializedState.stages);
    });

    it('can update progress', () => {
      // Construct state with a single stage/level that has progress, but is
      // not perfect
      const state = {
        levelProgress: {
          341: TestResults.MISSING_RECOMMENDED_BLOCK_UNFINISHED
        },
        stages: [
          {
            lockable: false,
            levels: [
              {
                ids: [341],
                kind: 'puzzle',
                status: LevelStatus.not_tried
              }
            ]
          }
        ],
      };

      // update progress to perfect
      const action = mergeProgress({ 341: TestResults.ALL_PASS });
      const nextState = reducer(state, action);
      assert.equal(nextState.levelProgress[341], TestResults.ALL_PASS);
    });

    it('cannot move progress backwards', () => {
      // Construct state with a single stage/level that has progress, which is
      // perfect
      const state = {
        levelProgress: {
          339: TestResults.ALL_PASS
        },
        stages: [
          {
            lockable: false,
            levels: [
              {
                ids: [341],
                kind: 'puzzle',
                status: LevelStatus.perfect
              }
            ]
          }
        ],
      };

      // try to update progress to a worse result
      const action = mergeProgress({ 341: TestResults.MISSING_RECOMMENDED_BLOCK_UNFINISHED });
      const nextState = reducer(state, action);
      assert.equal(nextState.levelProgress[339], TestResults.ALL_PASS);
    });

    it('initially sets postMilestoneDisabled to false', () => {
      assert.equal(initialState.postMilestoneDisabled, false);
    });

    it('can update postMilestoneDisabled', () => {
      const nextState = reducer(initialState, disablePostMilestone());
      assert.equal(nextState.postMilestoneDisabled, true);
    });

    it('initially sets signInState to Unknown', () => {
      assert.equal(initialState.signInState, SignInState.Unknown);
    });

    it('can update signInState', () => {
      const signedIn = reducer(initialState, setUserSignedIn(true));
      assert.equal(signedIn.signInState, SignInState.SignedIn);

      const signedOut = reducer(initialState, setUserSignedIn(false));
      assert.equal(signedOut.signInState, SignInState.SignedOut);
    });

    it ('initially sets isHocScript to null', () => {
      assert.equal(initialState.isHocScript, null);
    });

    it('can update isHocScript', () => {
      const isHocScript = reducer(initialState, setIsHocScript(true));
      assert.equal(isHocScript.isHocScript, true);

      const isNotHocScript = reducer(initialState, setIsHocScript(false));
      assert.equal(isNotHocScript.isHocScript, false);
    });

    it('can update isSummaryView', () => {
      const stateSummary = reducer(initialState, setIsSummaryView(true));
      assert.strictEqual(stateSummary.isSummaryView, true);

      const stateDetail = reducer(initialState, setIsSummaryView(false));
      assert.strictEqual(stateDetail.isSummaryView, false);
    });

    describe('statusForLevel', () => {
      it('returns LevelStatus.locked for locked assessment level', () => {
        const level = {
          ids: [5275],
          uid: "5275_0"
        };
        const levelProgress = {
          5275: TestResults.LOCKED_RESULT
        };
        const status = statusForLevel(level, levelProgress);
        assert.strictEqual(status, LevelStatus.locked);
      });
    });

    it('returns LevelStatus.attempted for unlocked assessment level', () => {
      const level = {
        ids: [5275],
        uid: "5275_0"
      };
      const levelProgress = {
        "5275": TestResults.UNSUBMITTED_ATTEMPT,
        "5275_0": TestResults.UNSUBMITTED_ATTEMPT,
        "5275_1": TestResults.GENERIC_FAIL
      };
      const status = statusForLevel(level, levelProgress);
      assert.strictEqual(status, LevelStatus.attempted);
    });

    it('returns LevelStatus.perfect for completed level', () => {
      const level = {
        ids: [123]
      };
      const levelProgress = {
        123: TestResults.ALL_PASS
      };
      const status = statusForLevel(level, levelProgress);
      assert.strictEqual(status, LevelStatus.perfect);
    });

    it('returns LevelStatus.not_tried for level with no progress', () => {
      const level = {
        ids: [123]
      };
      const levelProgress = {
        999: TestResults.ALL_PASS
      };
      const status = statusForLevel(level, levelProgress);
      assert.strictEqual(status, LevelStatus.not_tried);
    });

    it('returns LevelStatus.locked for a locked peer_review stage', () => {
      const level = {
        kind: LevelKind.peer_review,
        locked: true
      };
      const levelProgress = {};
      const status = statusForLevel(level, levelProgress);
      assert.strictEqual(status, LevelStatus.locked);
    });

    it('returns LevelStatus.perfect for a completed peer_review stage', () => {
      const level = {
        kind: LevelKind.peer_review,
        locked: false,
        status: LevelStatus.perfect
      };
      const levelProgress = {};
      const status = statusForLevel(level, levelProgress);
      assert.strictEqual(status, LevelStatus.perfect);
    });
  });

  describe('with peer reviews', () => {
    // Sample stage of peer review
    const peerReviewStage = {
      name: "You must complete 2 reviews for this unit",
      flex_category: "Peer Review",
      levels: [
        {
          ids: [0],
          kind: LevelKind.peer_review,
          title: "",
          url: "",
          name: "Reviews unavailable at this time",
          icon: "fa-lock",
          locked: true
        },
        {
          ids: [1],
          kind: LevelKind.peer_review,
          title: "",
          url: "",
          name: "Reviews unavailable at this time",
          icon: "fa-lock",
          locked: true
        }
      ],
      lockable: false
    };

    const intialOverviewProgressWithPeerReview = {
      currentLevelId: undefined,
      professionalLearningCourse: true,
      saveAnswersBeforeNavigation: false,
      stages: stageData,
      peerReviewStage: peerReviewStage,
      scriptName: 'alltheplcthings'
    };

    it('can initialize progress with peer reviews on overview page', () => {
      const action = initProgress(intialOverviewProgressWithPeerReview);
      const nextState = reducer(undefined, action);

      assert.equal(nextState.currentLevelId, undefined);
      assert.equal(nextState.professionalLearningCourse, true);
      assert.equal(nextState.saveAnswersBeforeNavigation, false);
      assert.deepEqual(nextState.stages, intialOverviewProgressWithPeerReview.stages);
      assert.deepEqual(nextState.peerReviewStage, peerReviewStage);
      assert.equal(nextState.scriptName, 'alltheplcthings');
      assert.equal(nextState.currentStageId, undefined);
    });

    it('can provide progress for peer reviews', () => {
      // construct an initial state where we have 1 stage of non-peer reviews
      // with some progress, and 1 stage of peer reviews
      const state = {
        levelProgress: {
          341: TestResults.MISSING_RECOMMENDED_BLOCK_UNFINISHED
        },
        stages: [stageData[1]],
        peerReviewStage: peerReviewStage
      };
      assert.equal(state.stages[0].levels[2].ids[0], 341);
      state.stages[0].levels[2].status = LevelStatus.attempted;

      assert.deepEqual(peerReviewStage.levels[0], {
        ids: [0],
        kind: LevelKind.peer_review,
        title: "",
        url: "",
        name: "Reviews unavailable at this time",
        icon: "fa-lock",
        locked: true
      });

      const action = mergePeerReviewProgress([{
        id: 13,
        locked: false,
        name: 'Ready to review',
        result: TestResults.UNSUBMITTED_ATTEMPT,
        status: 'not_started',
        url: '/peer_reviews/13'
      }]);

      const nextState = reducer(state, action);

      assert.deepEqual(nextState.levelProgress, state.levelProgress,
        'no change to levelProgress');
      const peerReviewLevels = nextState.peerReviewStage.levels;
      assert.equal(peerReviewLevels.length, state.peerReviewStage.levels.length,
        'same number of peer review levels in stage');

      // First assert about previous state, to make sure that we didn't mutate it
      assert.deepEqual(state.peerReviewStage.levels[0], {
        ids: [0],
        kind: LevelKind.peer_review,
        title: "",
        url: "",
        name: "Reviews unavailable at this time",
        icon: "fa-lock",
        locked: true
      });

      // Now assert for our new state
      assert.deepEqual(nextState.peerReviewStage.levels[0], {
        // TODO: Seems strange to have both an id and ids. Can we make this better?
        id: 13,
        ids: [0],
        // TODO: Seems strange to have an fa-lock icon even tho we're not locked.
        icon: 'fa-lock',
        locked: false,
        kind: LevelKind.peer_review,
        result: TestResults.UNSUBMITTED_ATTEMPT,
        title: "",
        url: '/peer_reviews/13',
        name: "Ready to review",
        status: 'not_started',
      });
    });
  });

  describe('levelsByLesson', () => {
    it('extracts status/url on a per level basis', () => {
      const initializedState = reducer(undefined, initProgress(initialScriptOverviewProgress));

      // merge some progress so that we have statuses
      const action = mergeProgress({
        // stage 2 level 2 is pass
        339: TestResults.ALL_PASS,
        // stage 2 level 3 is incomplete
        341: TestResults.MISSING_RECOMMENDED_BLOCK_UNFINISHED
      });
      const state = reducer(initializedState, action);

      const expected = [
        [
          {
            status: 'not_tried',
            url: "http://localhost-studio.code.org:3000/s/course3/stage/1/puzzle/1",
            name: undefined,
            icon: null
          },
          {
            status: 'not_tried',
            url: "http://localhost-studio.code.org:3000/s/course3/stage/1/puzzle/2",
            name: undefined,
            icon: null
          },
          {
            status: 'not_tried',
            url: "http://localhost-studio.code.org:3000/s/course3/stage/1/puzzle/3",
            name: undefined,
            icon: null
          }
        ],
        [
          {
            status: 'not_tried',
            url: "http://localhost-studio.code.org:3000/s/course3/stage/2/puzzle/1",
            name: undefined,
            icon: null
          },
          {
            status: 'perfect',
            url: "http://localhost-studio.code.org:3000/s/course3/stage/2/puzzle/2",
            name: undefined,
            icon: null
          },
          {
            status: 'attempted',
            url: "http://localhost-studio.code.org:3000/s/course3/stage/2/puzzle/3",
            name: undefined,
            icon: null
          }
        ]
      ];
      const results = levelsByLesson(state);
      assert.equal(expected.length, results.length);
      assert.deepEqual(expected[0], results[0]);
      assert.deepEqual(expected[1], results[1]);
    });
  });

  describe('progressionsFromLevels', () => {
    it('returns a single progression when no levels have names', () => {
      const levels = [
        {
          status: 'not_tried',
          url: '/step1/level1',
        },
        {
          status: 'perfect',
          url: '/step2/level1',
        },
        {
          status: 'not_tried',
          url: '/step2/level2',
        }
      ];

      assert.deepEqual(progressionsFromLevels(levels), [{
        name: undefined,
        start: 0,
        levels: levels
      }]);
    });

    it('puts adjacent levels with the same name in the same progression', () => {
      const levels = [
        {
          status: 'not_tried',
          url: '/step1/level1',
          name: 'Progression 1'
        },
        {
          status: 'perfect',
          url: '/step2/level1',
          name: 'Progression 1'
        },
        {
          status: 'not_tried',
          url: '/step2/level2',
          name: 'Progression 2'
        }
      ];

      const progressions = progressionsFromLevels(levels);
      assert.equal(progressions.length, 2);
      assert.deepEqual(progressions[0], {
        name: 'Progression 1',
        start: 0,
        levels: levels.slice(0, 2)
      });
    });

    it('puts non-adjacent levels with the same name in different progressions', () => {
      const levels = [
        {
          status: 'not_tried',
          url: '/step1/level1',
          name: 'One'
        },
        {
          status: 'perfect',
          url: '/step2/level1',
          name: 'Two'
        },
        {
          status: 'not_tried',
          url: '/step2/level2',
          name: 'One'
        }
      ];

      const progressions = progressionsFromLevels(levels);
      assert.equal(progressions.length, 3);
      assert.equal(progressions[0].levels.length, 1);
      assert.equal(progressions[1].levels.length, 1);
      assert.equal(progressions[2].levels.length, 1);
    });

    it('sets the right start value for progressions that arent the first one', () => {
      const levels = [
        {
          status: 'not_tried',
          url: '/step1/level1',
          name: 'Progression 1'
        },
        {
          status: 'perfect',
          url: '/step2/level1',
          name: 'Progression 1'
        },
        {
          status: 'not_tried',
          url: '/step2/level2',
          name: 'Progression 2'
        }
      ];

      const progressions = progressionsFromLevels(levels);
      assert.equal(progressions.length, 2);
      assert.equal(progressions[1].start, 2);
    });
  });

  describe('categorizedLessons', () => {
    // helper method that creates a fake stage
    const fakeStage = (categoryName, stageName) => ({
      flex_category: categoryName,
      name: stageName,
      levels: [{
        url: '',
        name: 'fake level',
        ids: [1]
      }]
    });

    it('returns a single category if all lessons have the same category', () => {
      const state = {
        stages: [
          fakeStage('Content', 'stage1'),
          fakeStage('Content', 'stage2'),
          fakeStage('Content', 'stage3')
        ],
        levelProgress: {}
      };

      const categories = categorizedLessons(state);
      assert.equal(categories.length, 1);
      assert.equal(categories[0].category, 'Content');
    });

    it('groups non-adjacent stages by category', () => {
      const state = {
        stages: [
          fakeStage('cat1', 'stage1'),
          fakeStage('cat2', 'stage2'),
          fakeStage('cat1', 'stage3')
        ],
        levelProgress: {}
      };

      const categories = categorizedLessons(state);
      assert.equal(categories.length, 2);
      assert.equal(categories[0].category, 'cat1');
      assert.equal(categories[1].category, 'cat2');
      assert.equal(categories[0].levels.length, 2);
      assert.equal(categories[1].levels.length, 1);
      assert.deepEqual(categories[0].lessonNames, ['stage1', 'stage3']);
      assert.deepEqual(categories[1].lessonNames, ['stage2']);
    });
  });
});
