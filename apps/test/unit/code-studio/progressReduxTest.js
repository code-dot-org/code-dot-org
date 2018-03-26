import { assert } from 'chai';
import { TestResults } from '@cdo/apps/constants';
import { LevelStatus, LevelKind } from '@cdo/apps/util/sharedConstants';
import { ViewType, setViewTypeNonThunk } from '@cdo/apps/code-studio/viewAsRedux';
import reducer, {
  initProgress,
  isPerfect,
  getPercentPerfect,
  mergeProgress,
  mergePeerReviewProgress,
  disablePostMilestone,
  setUserSignedIn,
  setIsHocScript,
  setIsAge13Required,
  setIsSummaryView,
  setStudentDefaultsSummaryView,
  SignInState,
  levelsByLesson,
  levelsForLessonId,
  progressionsFromLevels,
  categorizedLessons,
  statusForLevel,
  processedStages,
  setCurrentStageId,
  stageExtrasUrl,
  setStageExtrasEnabled,
  getLevelResult,
  __testonly__
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
        previous: false,
        is_concept_level: false,
      },
      {
          ids: [323],
          activeId: 323,
          position: 2,
          kind: LevelKind.assessment,
          icon: null,
          title: 1,
          url: "http://localhost-studio.code.org:3000/s/course3/stage/1/puzzle/2",
          is_concept_level: false,
      },
      {
          ids: [322],
          activeId: 322,
          position: 3,
          kind: LevelKind.assessment,
          icon: null,
          title: 2,
          url: "http://localhost-studio.code.org:3000/s/course3/stage/1/puzzle/3",
          next: [2, 1],
          is_concept_level: false,
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
        previous: [1, 3],
        is_concept_level: false,
      }, {
        ids: [339],
        activeId: 339,
        position: 2,
        kind: LevelKind.puzzle,
        icon: null,
        title: 2,
        url: "http://localhost-studio.code.org:3000/s/course3/stage/2/puzzle/2",
        is_concept_level: false,
      }, {
        ids: [341],
        activeId: 341,
        position: 3,
        kind: LevelKind.puzzle,
        icon: null,
        title: 3,
        url: "http://localhost-studio.code.org:3000/s/course3/stage/2/puzzle/3",
        is_concept_level: false,
      }
    ],
    lesson_plan_html_url: "//localhost.code.org:3000/curriculum/course3/2/Teacher",
    lesson_plan_pdf_url: "//localhost.code.org:3000/curriculum/course3/2/Teacher.pdf",
    stage_extras_level_url: "//localhost.code.org:3000/s/course3/stage/2/extras"
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

      assert.deepEqual(nextState.stages, processedStages(initialScriptOverviewProgress.stages));
      assert.equal(nextState.scriptName, 'course3');
      assert.equal(nextState.currentStageId, undefined);
    });

    it('can initialize progress on puzzle page', () => {
      const action = initProgress(initialPuzzlePageProgress);
      const nextState = reducer(undefined, action);

      assert.equal(nextState.currentLevelId, "341");
      assert.equal(nextState.professionalLearningCourse, false);
      assert.equal(nextState.saveAnswersBeforeNavigation, false);
      assert.deepEqual(nextState.stages, processedStages(initialPuzzlePageProgress.stages));
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

    it('can update isAge13Required', () => {
      const state = reducer(initialState, setIsAge13Required(true));
      assert.equal(state.isAge13Required, true);

      const nextState = reducer(initialState, setIsHocScript(false));
      assert.equal(nextState.isAge13Required, false);
    });

    it('can update isSummaryView', () => {
      const stateSummary = reducer(initialState, setIsSummaryView(true));
      assert.strictEqual(stateSummary.isSummaryView, true);

      const stateDetail = reducer(initialState, setIsSummaryView(false));
      assert.strictEqual(stateDetail.isSummaryView, false);
    });

    it('can update studentDefaultsSummaryView', () => {
      const stateDefaultsSummary = reducer(initialState, setStudentDefaultsSummaryView(true));
      assert.strictEqual(stateDefaultsSummary.studentDefaultsSummaryView, true);

      const stateDefaultsDetail = reducer(initialState, setStudentDefaultsSummaryView(false));
      assert.strictEqual(stateDefaultsDetail.studentDefaultsSummaryView, false);
    });

    it('can enable stage extras', () => {
      assert.strictEqual(initialState.stageExtrasEnabled, false);

      const nextState = reducer(initialState, setStageExtrasEnabled(true));
      assert.strictEqual(nextState.stageExtrasEnabled, true);
    });

    describe('setViewType', () => {
      // The setViewType exported by viewAsRedux is a thunk that handles some
      // stuff like updating query param. We just want the core action it ultimately
      // dispatches
      const setViewType = setViewTypeNonThunk;

      it('toggles to detail view when setting viewAs to Teacher', () => {
        const state = {
          ...initialState,
          isSummaryView: true
        };
        const nextState = reducer(state, setViewType(ViewType.Teacher));
        assert.strictEqual(nextState.isSummaryView, false);
      });

      it('toggles to summary view when setting viewAs to Student if studentDefaultsSummaryView', () => {
        const state = {
          ...initialState,
          studentDefaultsSummaryView: true,
          isSummaryView: false
        };
        const nextState = reducer(state, setViewType(ViewType.Teacher));
        assert.strictEqual(nextState.isSummaryView, false);
      });

      it('toggles to detail view when setting viewAs to Student if not studentDefaultsSummaryView', () => {
        const state = {
          ...initialState,
          studentDefaultsSummaryView: false,
          isSummaryView: true
        };
        const nextState = reducer(state, setViewType(ViewType.Teacher));
        assert.strictEqual(nextState.isSummaryView, false);
      });
    });

    it('can setCurrentStageId', () => {
      const nextState = reducer(initialState, setCurrentStageId(1234));
      assert.strictEqual(nextState.currentStageId, 1234);
    });

    it('does not allow setCurrentStageId to replace an existing stage id', () => {
      const state = {
        ...initialState,
        currentStageId: 111
      };
      const nextState = reducer(state, setCurrentStageId(222));
      assert.strictEqual(nextState.currentStageId, 111);
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

      assert.deepEqual(nextState.stages, processedStages(intialOverviewProgressWithPeerReview.stages, true));
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
    it('extracts relevant properties on a per level basis', () => {
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
            progression: undefined,
            kind: LevelKind.unplugged,
            icon: null,
            isUnplugged: true,
            levelNumber: undefined,
            isCurrentLevel: false,
            isConceptLevel: false,
          },
          {
            status: 'not_tried',
            url: "http://localhost-studio.code.org:3000/s/course3/stage/1/puzzle/2",
            name: undefined,
            progression: undefined,
            kind: LevelKind.assessment,
            icon: null,
            isUnplugged: false,
            levelNumber: 1,
            isCurrentLevel: false,
            isConceptLevel: false,
          },
          {
            status: 'not_tried',
            url: "http://localhost-studio.code.org:3000/s/course3/stage/1/puzzle/3",
            name: undefined,
            progression: undefined,
            kind: LevelKind.assessment,
            icon: null,
            isUnplugged: false,
            levelNumber: 2,
            isCurrentLevel: false,
            isConceptLevel: false,
          }
        ],
        [
          {
            status: 'not_tried',
            url: "http://localhost-studio.code.org:3000/s/course3/stage/2/puzzle/1",
            name: undefined,
            progression: undefined,
            kind: LevelKind.puzzle,
            icon: null,
            isUnplugged: false,
            levelNumber: 1,
            isCurrentLevel: false,
            isConceptLevel: false,
          },
          {
            status: 'perfect',
            url: "http://localhost-studio.code.org:3000/s/course3/stage/2/puzzle/2",
            name: undefined,
            progression: undefined,
            kind: LevelKind.puzzle,
            icon: null,
            isUnplugged: false,
            levelNumber: 2,
            isCurrentLevel: false,
            isConceptLevel: false,
          },
          {
            status: 'attempted',
            url: "http://localhost-studio.code.org:3000/s/course3/stage/2/puzzle/3",
            name: undefined,
            progression: undefined,
            kind: LevelKind.puzzle,
            icon: null,
            isUnplugged: false,
            levelNumber: 3,
            isCurrentLevel: false,
            isConceptLevel: false,
          }
        ]
      ];
      const results = levelsByLesson(state);
      assert.equal(expected.length, results.length);
      for (let i = 0; i < expected.length; i++) {
        assert.equal(expected[i].length, results[i].length);
        for (let j = 0; j < expected[i].length; j++) {
          assert.deepEqual(expected[i][j], results[i][j], `Mismatch for stage at index ${i}, level at index ${j}`);
        }
      }
    });

    it('Only numbers non-unplugged lesson', () => {
      const results = levelsByLesson({
        stages: [{
          levels: [
            {
              kind: LevelKind.unplugged,
              title: 'Unplugged Activity',
              ids: [123]
            },
            {
              kind: LevelKind.puzzle,
              title: 1,
              ids: [124]
            }
          ]
        }],
        levelProgress: {}
      });
      assert.equal(results[0][0].isUnplugged, true);
      assert.equal(results[0][0].levelNumber, null);
      assert.equal(results[0][1].isUnplugged, false);
      assert.equal(results[0][1].levelNumber, 1);
    });
  });

  describe('levelsForLessonId', () => {
    it('returns levels for the given stage', () => {
      const initializedState = reducer(undefined,
        initProgress(initialScriptOverviewProgress));

      const stageId = stageData[0].id;
      const levels = levelsForLessonId(initializedState, stageId);
      assert.strictEqual(levels.length, 3);
    });

    it('sets isCurrentLevel to true for current level only', () => {
      const initializedState = {
        ...reducer(undefined, initProgress(initialScriptOverviewProgress)),
        currentLevelId: stageData[0].levels[1].activeId.toString()
      };

      const stageId = stageData[0].id;
      const levels = levelsForLessonId(initializedState, stageId);

      assert.strictEqual(levels[0].isCurrentLevel, false, 'first level is not current');
      assert.strictEqual(levels[1].isCurrentLevel, true, 'second level is current');
      assert.strictEqual(levels[2].isCurrentLevel, false, 'third level is not current');

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

    it('puts adjacent levels with the same progression name in the same progression', () => {
      const levels = [
        {
          status: 'not_tried',
          url: '/step1/level1',
          progression: 'Progression 1'
        },
        {
          status: 'perfect',
          url: '/step2/level1',
          progression: 'Progression 1'
        },
        {
          status: 'not_tried',
          url: '/step2/level2',
          progression: 'Progression 2'
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

    it('puts non-adjacent levels with the same progression name in different progressions', () => {
      const levels = [
        {
          status: 'not_tried',
          url: '/step1/level1',
          progression: 'One'
        },
        {
          status: 'perfect',
          url: '/step2/level1',
          progression: 'Two'
        },
        {
          status: 'not_tried',
          url: '/step2/level2',
          progression: 'One'
        }
      ];

      const progressions = progressionsFromLevels(levels);
      assert.equal(progressions.length, 3);
      assert.equal(progressions[0].levels.length, 1);
      assert.equal(progressions[1].levels.length, 1);
      assert.equal(progressions[2].levels.length, 1);
    });

    it('takes progression name over level name if both are provided', () => {
      const levels = [
        {
          status: 'not_tried',
          url: '/step1/level1',
          name: 'Level 1',
          progression: 'ProgressionOne'
        },
        {
          status: 'perfect',
          url: '/step2/level1',
          name: 'Level 2',
          progression: 'ProgressionOne'
        },
        {
          status: 'not_tried',
          url: '/step2/level2',
          name: 'Level 3',
          progression: 'ProgressionTwo'
        }
      ];

      const progressions = progressionsFromLevels(levels);
      assert.equal(progressions.length, 2);
      assert.equal(progressions[0].levels.length, 2);
      assert.equal(progressions[0].name, 'ProgressionOne');
      assert.equal(progressions[1].name, 'ProgressionTwo');
    });

    it('sets the right start value for progressions that arent the first one', () => {
      const levels = [
        {
          status: 'not_tried',
          url: '/step1/level1',
          progression: 'Progression 1'
        },
        {
          status: 'perfect',
          url: '/step2/level1',
          progression: 'Progression 1'
        },
        {
          status: 'not_tried',
          url: '/step2/level2',
          progression: 'Progression 2'
        }
      ];

      const progressions = progressionsFromLevels(levels);
      assert.equal(progressions.length, 2);
      assert.equal(progressions[1].start, 2);
    });
  });

  describe('categorizedLessons', () => {
    // helper method that creates a fake stage
    const fakeStage = (categoryName, stageName, stageId) => ({
      flex_category: categoryName,
      name: stageName,
      id: stageId,
      levels: [{
        url: '',
        name: 'fake level',
        ids: [1],
        title: 1
      }]
    });

    it('returns a single category if all lessons have the same category', () => {
      const state = {
        stages: [
          fakeStage('Content', 'stage1', 1),
          fakeStage('Content', 'stage2', 2),
          fakeStage('Content', 'stage3', 3)
        ],
        levelProgress: {},
        focusAreaStageIds: []
      };

      const categories = categorizedLessons(state);
      assert.equal(categories.length, 1);
      assert.equal(categories[0].category, 'Content');
    });

    it('groups non-adjacent stages by category', () => {
      const state = {
        stages: [
          fakeStage('cat1', 'stage1', 1),
          fakeStage('cat2', 'stage2', 2),
          fakeStage('cat1', 'stage3', 3)
        ],
        levelProgress: {},
        focusAreaStageIds: []
      };

      const categories = categorizedLessons(state);
      assert.equal(categories.length, 2);
      assert.equal(categories[0].category, 'cat1');
      assert.equal(categories[1].category, 'cat2');
      assert.equal(categories[0].levels.length, 2);
      assert.equal(categories[1].levels.length, 1);
      assert.deepEqual(categories[0].lessons, [
        {
          name: 'stage1',
          id: 1,
          isFocusArea: false
        }, {
          name: 'stage3',
          id: 3,
          isFocusArea: false
        }
      ]);
      assert.deepEqual(categories[1].lessons, [{
        name: 'stage2',
        id: 2,
        isFocusArea: false
      }]);
    });
  });

  describe('processedStages', () => {
    it('strips "hidden" field from stages', () => {
      const stages = [{
        name: 'stage1',
        id: 123,
        hidden: false
      }, {
        name: 'stage2',
        id: 124,
        hidden: true
      }];

      const processed = processedStages(stages);
      assert.strictEqual(processed[0].hidden, undefined);
      assert.strictEqual(processed[1].hidden, undefined);
    });

    it('adds stageNumber to non-lockable stages, not to lockable stages', () => {
      const stages = [{
        name: 'locked1',
        id: 123,
        lockable: true
      }, {
        name: 'non-locked1',
        id: 124,
        lockable: false,
      }, {
        name: 'locked2',
        id: 125,
        lockable: true
      }, {
        name: 'non-locked2',
        id: 126,
        lockable: false,
      }];

      const processed = processedStages(stages);
      assert.strictEqual(processed[0].stageNumber, undefined);
      assert.strictEqual(processed[1].stageNumber, 1);
      assert.strictEqual(processed[2].stageNumber, undefined);
      assert.strictEqual(processed[3].stageNumber, 2);
    });
  });

  describe('stageExtrasUrl', () => {
    it('derives url from state by stageId', () => {
      const stateWithProgress = reducer(undefined,
        initProgress(initialPuzzlePageProgress));
      const state = reducer(stateWithProgress, setStageExtrasEnabled(true));


      assert.strictEqual(stageExtrasUrl(state, state.stages[0].id),
        "//localhost.code.org:3000/s/course3/stage/2/extras");
    });
  });

  describe('peerReviewLesson', () => {
    const { peerReviewLesson, PEER_REVIEW_ID } = __testonly__;
    it('extracts lesson data from our peerReviewStage', () => {
      const state = {
        peerReviewStage: {
          flex_category: 'Peer Review',
          levels: [

          ],
          lockable: false,
          name: 'You must complete 5 reviews for this unit'
        }
      };

      const lesson = peerReviewLesson(state);
      assert.strictEqual(lesson.id, PEER_REVIEW_ID);
      assert.strictEqual(lesson.lockable, false);
      assert.strictEqual(lesson.isFocusArea, false);
    });
  });

  describe('peerReviewLevels', () => {
    const { peerReviewLevels, PEER_REVIEW_ID } = __testonly__;

    it('sets status and icon to locked when locked', () => {
      const state = {
        peerReviewStage: {
          levels: [{
            icon: 'fa-lock',
            ids: [0],
            kind: LevelKind.peer_review,
            locked: true,
            name: 'Reviews Unavailable at this time',
            title: '',
            url: ''
          }]
        }
      };
      const levels = peerReviewLevels(state);
      assert.equal(levels.length, 1);
      assert.equal(levels[0].id, PEER_REVIEW_ID);
      assert.equal(levels[0].status,  LevelStatus.locked);
      assert.equal(levels[0].url, '');
      assert.equal(levels[0].name, state.peerReviewStage.levels[0].name);
      assert.equal(levels[0].icon, 'fa-lock');
    });

    it('uses given status, no icon when not locked', () => {
      const state = {
        peerReviewStage: {
          levels: [{
            icon: 'fa-lock',
            id: 1,
            ids: [0],
            kind: LevelKind.peer_review,
            locked: false,
            name: 'Link to submitted review',
            result: 100,
            status: LevelStatus.perfect,
            title: '',
            url: '/peer_reviews/1'
          }]
        }
      };
      const levels = peerReviewLevels(state);
      assert.equal(levels.length, 1);
      assert.equal(levels[0].id, PEER_REVIEW_ID);
      assert.equal(levels[0].status,  LevelStatus.perfect);
      assert.equal(levels[0].url, '/peer_reviews/1');
      assert.equal(levels[0].name, state.peerReviewStage.levels[0].name);
      assert.equal(levels[0].icon, undefined);
    });
  });

  describe('isPerfect', () => {
    const levelId = 1;

    it('returns false if progress was not initialized', () => {
      const state = {};
      assert.isFalse(isPerfect(state, levelId));
    });

    it('returns false if the level was not started', () => {
      const state = {
        levelProgress: {},
      };
      assert.isFalse(isPerfect(state, levelId));
    });

    it('returns false if the level was not perfected', () => {
      const state = {
        levelProgress: {
          1: TestResults.MINIMUM_PASS_RESULT,
        },
      };
      assert.isFalse(isPerfect(state, levelId));
    });

    it('returns true if the level was perfected', () => {
      const state = {
        levelProgress: {
          1: TestResults.ALL_PASS,
        },
      };
      assert.isTrue(isPerfect(state, levelId));
    });
  });

  describe('getPercentPerfect', () => {
    it('excludes concept levels', () => {
      const levels = [{
        isConceptLevel: true,
        status: LevelStatus.perfect,
      }, {
        isConceptLevel: true,
        status: LevelStatus.perfect,
      }, {
        isConceptLevel: false,
        status: LevelStatus.perfect,
      }, {
        isConceptLevel: false,
        status: LevelStatus.not_tried,
      }];
      assert.equal(getPercentPerfect(levels), 0.5);
    });

    it('only counts perfect levels', () => {
      const levels = [{
        status: LevelStatus.perfect,
      }, {
        status: LevelStatus.passed,
      }, {
        status: LevelStatus.attempted,
      }, {
        status: LevelStatus.not_tried,
      }];
      assert.equal(getPercentPerfect(levels), 0.25);
    });

    it('returns zero when there are no levels', () => {
      assert.equal(getPercentPerfect([]), 0);
    });
  });

  describe('getLevelResult', () => {
    it('returns the provided result for standard levels', () => {
      const result = getLevelResult({
        status: LevelStatus.perfect,
        result: TestResults.ALL_PASS
      });
      assert.strictEqual(result, TestResults.ALL_PASS);
    });

    it('returns LOCKED_RESULT for locked levels', () => {
      const result = getLevelResult({
        status: LevelStatus.locked,
        // No result provided by server in this case
      });
      assert.strictEqual(result, TestResults.LOCKED_RESULT);
    });

    it('returns SUBMITTED_RESULT for a submitted level', () => {
      const result = getLevelResult({
        status: LevelStatus.submitted,
        result: TestResults.ALL_PASS,
        submitted: true,
        readonly_answers: true,
        pages_completed: [
          -50,
          null,
          null,
          null,
          null
        ]
      });
      assert.strictEqual(result, TestResults.SUBMITTED_RESULT);
    });
  });
});
