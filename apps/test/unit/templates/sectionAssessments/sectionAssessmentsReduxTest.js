import {assert} from '../../../util/reconfiguredChai';
import sectionAssessments, {
  setAssessmentResponses,
  setSurveys,
  setAssessmentQuestions,
  startLoadingAssessments,
  finishLoadingAssessments,
  setAssessmentId,
  getCurrentScriptAssessmentList,
  getMultipleChoiceStructureForCurrentAssessment,
  getMatchStructureForCurrentAssessment,
  getStudentMCResponsesForCurrentAssessment,
  getStudentMatchResponsesForCurrentAssessment,
  getStudentsMCandMatchSummaryForCurrentAssessment,
  getSurveyFreeResponseQuestions,
  getAssessmentsFreeResponseResults,
  getMultipleChoiceSurveyResults,
  getMultipleChoiceSectionSummary,
  getMatchSectionSummary,
  getCorrectAnswer,
  indexesToAnswerString,
  countSubmissionsForCurrentAssessment,
  isCurrentAssessmentSurvey,
  getExportableSurveyData,
  getExportableAssessmentData,
  setStudentId,
  setQuestionIndex,
  getCurrentQuestion,
  getStudentAnswersForCurrentQuestion,
  setFeedback,
  doesCurrentCourseUseFeedback,
  getExportableFeedbackData,
  isCurrentScriptCSD,
  notStartedFakeTimestamp
} from '@cdo/apps/templates/sectionAssessments/sectionAssessmentsRedux';
import {setSection} from '@cdo/apps/redux/sectionDataRedux';
import {setScriptId} from '@cdo/apps/redux/scriptSelectionRedux';

describe('sectionAssessmentsRedux', () => {
  const initialState = sectionAssessments(undefined, {});

  describe('setSection', () => {
    it('resets all other state to initialState', () => {
      const currentState = {
        isLoading: true,
        assessmentResponsesByScript: {
          1: [{question: 'a question', puzzle: 2}]
        }
      };
      const newSection = {id: 2, students: []};
      const action = setSection(newSection);
      const nextState = sectionAssessments(currentState, action);
      assert.deepEqual(nextState, initialState);
    });
  });

  describe('setScript', () => {
    it('resets student filter to all students', () => {
      const currentState = {
        studentId: 489,
        assessmentResponsesByScript: {
          1: [{question: 'a question', puzzle: 2}]
        }
      };
      const action = setScriptId(2);
      const nextState = sectionAssessments(currentState, action);
      assert.deepEqual(nextState.studentId, 0);
      assert.deepEqual(
        nextState.assessmentResponsesByScript,
        currentState.assessmentResponsesByScript
      );
    });
  });

  describe('setAssessmentResponses', () => {
    it('associates the assessment data to the correct script', () => {
      const scriptId = 2;
      const assessmentData = [{question: 'a question', puzzle: 1}];
      const action = setAssessmentResponses(scriptId, assessmentData);
      const nextState = sectionAssessments(initialState, action);
      const actualAssessmentData =
        nextState.assessmentResponsesByScript[scriptId];
      assert.deepEqual(actualAssessmentData, assessmentData);
    });
  });

  describe('setSurveys', () => {
    it('associates the assessment data to the correct script', () => {
      const scriptId = 2;
      const surveyData = [{stage_name: 'a name', levelgroup_results: []}];
      const action = setSurveys(scriptId, surveyData);
      const nextState = sectionAssessments(initialState, action);
      const actualSurveyData = nextState.surveysByScript[scriptId];
      assert.deepEqual(actualSurveyData, surveyData);
    });
  });

  describe('setAssessmentQuestions', () => {
    it('associates the assessment structure data to the correct script', () => {
      const scriptId = 2;
      const assessmentData = {
        139: {
          id: 139,
          name: 'Assessment for Chapter 1',
          questions: {
            123: {
              type: 'Multi',
              question_text: 'A question',
              answers: [{text: 'answer 1', correct: true}]
            }
          }
        }
      };
      const action = setAssessmentQuestions(scriptId, assessmentData);
      const nextState = sectionAssessments(initialState, action);
      const actualAssessmentData =
        nextState.assessmentQuestionsByScript[scriptId];
      assert.deepEqual(actualAssessmentData, assessmentData);
      assert.deepEqual(nextState.assessmentId, 139);
    });
  });

  describe('setFeedback', () => {
    it('associates the feedback data to the correct script', () => {
      const scriptId = 2;
      const feedbackData = [
        {
          150: {
            comment: '2 functions so great!',
            keyConcept: 'A different level with a key concept!',
            levelNum: '5',
            performance: 'performanceLevel3',
            performanceLevelDetails: '3',
            stageName: 'Lesson 5: Creating Functions',
            lessonNum: '5',
            studentName: 'Student',
            timestamp: '03/20/19 at 02:34:22'
          },
          151: {
            comment:
              "I like how you didn't include the last couple turn lefts!",
            keyConcept: 'My key concept',
            levelNum: '4',
            performance: 'performanceLevel2',
            performanceLevelDetails: 'My meets value',
            stageName: 'Lesson 4: Using Simple Commands',
            lessonNum: '4',
            studentName: 'Student',
            timestamp: '03/21/19 at 11:54:17'
          }
        }
      ];
      const action = setFeedback(scriptId, feedbackData);
      const nextState = sectionAssessments(initialState, action);
      const actualFeedbackData = nextState.feedbackByScript[scriptId];
      assert.deepEqual(actualFeedbackData, feedbackData);
    });
  });

  describe('setAssessmentId', () => {
    it('sets the id of the current assessment in view', () => {
      const action = setAssessmentId(456);
      const nextState = sectionAssessments(initialState, action);
      assert.deepEqual(nextState.assessmentId, 456);
    });
  });

  describe('setStudentId', () => {
    it('sets the id of the current student in view', () => {
      const action = setStudentId(777);
      const nextState = sectionAssessments(initialState, action);
      assert.deepEqual(nextState.studentId, 777);
    });
  });

  describe('setQuestionIndex', () => {
    it('sets the index of the current question in view', () => {
      const action = setQuestionIndex(2);
      const nextState = sectionAssessments(initialState, action);
      assert.deepEqual(nextState.questionIndex, 2);
    });
  });

  describe('startLoadingAssessments', () => {
    it('sets isLoading to true', () => {
      const action = startLoadingAssessments();
      const nextState = sectionAssessments(initialState, action);
      assert.isTrue(nextState.isLoading);
    });
  });

  describe('finishLoadingAssessments', () => {
    it('sets isLoading to false', () => {
      const action = finishLoadingAssessments();
      const nextState = sectionAssessments(initialState, action);
      assert.isFalse(nextState.isLoading);
    });
  });

  describe('getCurrentScriptAssessmentList', () => {
    it('gets a list of assessments - script is not csd or csp', () => {
      const rootState = {
        scriptSelection: {
          scriptId: 123,
          validScripts: [{id: 123, script_name: 'learn-cs'}]
        },
        sectionAssessments: {
          ...initialState,
          assessmentQuestionsByScript: {
            123: {
              7: {id: 7, name: 'Assessment 7'},
              8: {id: 8, name: 'Assessment 8'}
            },
            456: {
              4: {id: 4, name: 'Assessment 4'},
              5: {id: 5, name: 'Assessment 5'}
            }
          },
          surveysByScript: {
            123: {
              9: {stage_name: 'Survey 9'}
            }
          }
        }
      };
      const result = getCurrentScriptAssessmentList(rootState);
      assert.deepEqual(result.length, 3);
      assert.deepEqual(result[0], {id: 7, name: 'Assessment 7'});
      assert.deepEqual(result[1], {id: 8, name: 'Assessment 8'});
      assert.deepEqual(result[2], {id: 9, name: 'Survey 9'});
    });

    it('gets a list of assessments - script is csd or csp', () => {
      const rootState = {
        scriptSelection: {
          scriptId: 123,
          validScripts: [{id: 123, script_name: 'csp8-2011'}]
        },
        sectionAssessments: {
          ...initialState,
          assessmentQuestionsByScript: {
            123: {
              7: {id: 7, name: 'Assessment 7'},
              8: {id: 8, name: 'Assessment 8'}
            },
            456: {
              4: {id: 4, name: 'Assessment 4'},
              5: {id: 5, name: 'Assessment 5'}
            }
          },
          surveysByScript: {
            123: {
              9: {stage_name: 'Survey 9'}
            }
          }
        }
      };
      const result = getCurrentScriptAssessmentList(rootState);
      assert.deepEqual(result.length, 4);
      assert.deepEqual(result[0], {id: 7, name: 'Assessment 7'});
      assert.deepEqual(result[1], {id: 8, name: 'Assessment 8'});
      assert.deepEqual(result[2], {id: 9, name: 'Survey 9'});
      assert.deepEqual(result[3], {
        id: 0,
        name: 'All teacher feedback in this unit'
      });
    });
  });

  describe('correct answer helper methods', () => {
    describe('getCorrectAnswer', () => {
      it('returns a string of letters', () => {
        const answerArray = [
          {text: 'answer1', correct: false},
          {text: 'answer2', correct: true}
        ];
        assert.deepEqual(getCorrectAnswer(answerArray), 'B');
      });
    });

    describe('indexesToAnswerString', () => {
      it('returns a string of letters', () => {
        assert.deepEqual(indexesToAnswerString([0, 2]), 'A, C');
        assert.deepEqual(indexesToAnswerString([1]), 'B');
      });
    });
  });

  describe('Selector functions', () => {
    let rootState;
    beforeEach(() => {
      rootState = {
        sectionAssessments: initialState,
        scriptSelection: {
          scriptId: 3
        }
      };
    });

    afterEach(() => {
      rootState = {};
    });

    describe('getMultipleChoiceStructureForCurrentAssessment', () => {
      it('returns an empty array when no assessments in redux', () => {
        const result = getMultipleChoiceStructureForCurrentAssessment(
          rootState
        );
        assert.deepEqual(result, []);
      });

      it('returns an array of objects of questionStructurePropType', () => {
        const stateWithAssessment = {
          ...rootState,
          sectionAssessments: {
            ...rootState.sectionAssessments,
            assessmentId: 123,
            assessmentQuestionsByScript: {
              3: {
                123: {
                  id: 123,
                  name: 'Assessment 1',
                  questions: [
                    {
                      answers: [
                        {correct: false, text: 'answer 1'},
                        {correct: true, text: 'answer 2'}
                      ],
                      question_text: 'What is a variable?',
                      type: 'Multi',
                      level_id: 456,
                      question_index: 0
                    }
                  ]
                }
              }
            }
          }
        };
        const result = getMultipleChoiceStructureForCurrentAssessment(
          stateWithAssessment
        );
        assert.deepEqual(result, [
          {
            correctAnswer: 'B',
            id: 456,
            questionNumber: 1,
            question: 'What is a variable?'
          }
        ]);
      });
    });

    describe('getMatchStructureForCurrentAssessment', () => {
      it('returns an empty array when no assessments in redux', () => {
        const result = getMatchStructureForCurrentAssessment(rootState);
        assert.deepEqual(result, []);
      });

      it('returns an array of objects of matchQuestionPropType', () => {
        const stateWithAssessment = {
          ...rootState,
          sectionAssessments: {
            ...rootState.sectionAssessments,
            assessmentId: 123,
            assessmentQuestionsByScript: {
              3: {
                123: {
                  id: 123,
                  name: 'Assessment 1',
                  questions: [
                    {
                      level_id: 456,
                      type: 'Match',
                      question: 'Can you match these things?',
                      question_index: 0,
                      answers: [{text: 'answer 1'}, {text: 'answer 2'}],
                      options: [{text: 'option 1'}, {text: 'option 2'}]
                    }
                  ]
                }
              }
            }
          }
        };
        const result = getMatchStructureForCurrentAssessment(
          stateWithAssessment
        );
        assert.deepEqual(result, [
          {
            id: 456,
            questionNumber: 1,
            question: 'Can you match these things?',
            answers: [{text: 'answer 1'}, {text: 'answer 2'}],
            options: [{text: 'option 1'}, {text: 'option 2'}]
          }
        ]);
      });
    });

    describe('getStudentMCResponsesForCurrentAssessment', () => {
      it('returns an empty array when no assessments in redux', () => {
        const result = getStudentMCResponsesForCurrentAssessment(rootState);
        assert.deepEqual(result, {});
      });

      it('returns an array of objects of studentWithMCResponsesPropType', () => {
        const stateWithAssessment = {
          ...rootState,
          sectionAssessments: {
            ...rootState.sectionAssessments,
            studentId: 1,
            assessmentId: 123,
            assessmentResponsesByScript: {
              3: {
                1: {
                  student_name: 'Saira',
                  responses_by_assessment: {
                    123: {
                      level_results: [
                        {
                          student_result: [3],
                          status: 'incorrect',
                          type: 'Multi'
                        },
                        {
                          student_result: 'Hi',
                          status: '',
                          type: 'FreeResponse'
                        }
                      ]
                    }
                  }
                }
              }
            }
          }
        };
        const result = getStudentMCResponsesForCurrentAssessment(
          stateWithAssessment
        );
        assert.deepEqual(result, {
          id: 1,
          name: 'Saira',
          studentResponses: [{responses: 'D', isCorrect: false}]
        });
      });
    });

    describe('getStudentMatchResponsesForCurrentAssessment', () => {
      it('returns an empty array when no assessments in redux', () => {
        const result = getStudentMatchResponsesForCurrentAssessment(rootState);
        assert.deepEqual(result, {});
      });

      it('returns an array of objects of studentWithMatchResponsesPropType', () => {
        const stateWithAssessment = {
          ...rootState,
          sectionAssessments: {
            ...rootState.sectionAssessments,
            studentId: 1,
            assessmentId: 123,
            assessmentResponsesByScript: {
              3: {
                1: {
                  student_name: 'Saira',
                  responses_by_assessment: {
                    123: {
                      level_results: [
                        {
                          student_result: [3],
                          status: 'incorrect',
                          type: 'Multi'
                        },
                        {
                          student_result: 'Hi',
                          status: '',
                          type: 'FreeResponse'
                        },
                        {
                          student_result: [0, 1],
                          status: ['submitted', 'submitted'],
                          type: 'Match'
                        }
                      ]
                    }
                  }
                }
              }
            }
          }
        };
        const result = getStudentMatchResponsesForCurrentAssessment(
          stateWithAssessment
        );
        assert.deepEqual(result, {
          id: 1,
          name: 'Saira',
          studentResponses: [{responses: [0, 1]}]
        });
      });
    });

    describe('getAssessmentsFreeResponseResults', () => {
      it('returns an empty array when no assessments in redux', () => {
        const result = getAssessmentsFreeResponseResults(rootState);
        assert.deepEqual(result, []);
      });

      it('returns an array of objects representing free response questions', () => {
        const stateWithAssessment = {
          ...rootState,
          sectionAssessments: {
            ...rootState.sectionAssessments,
            assessmentId: 123,
            assessmentQuestionsByScript: {
              3: {
                123: {
                  questions: [
                    {
                      type: 'FreeResponse',
                      question_text: 'Can you say hello?',
                      question_index: 0
                    }
                  ]
                }
              }
            },
            assessmentResponsesByScript: {
              3: {
                1: {
                  student_name: 'Saira',
                  responses_by_assessment: {
                    123: {
                      level_results: [
                        {
                          student_result: 'Hello world',
                          status: '',
                          type: 'FreeResponse'
                        }
                      ]
                    }
                  }
                }
              }
            }
          }
        };
        const result = getAssessmentsFreeResponseResults(stateWithAssessment);
        assert.deepEqual(result, [
          {
            questionText: 'Can you say hello?',
            questionNumber: 1,
            responses: [{id: 1, name: 'Saira', response: 'Hello world'}]
          }
        ]);
      });

      it('returns free response questions for selected student', () => {
        const stateWithAssessment = {
          ...rootState,
          sectionAssessments: {
            ...rootState.sectionAssessments,
            assessmentId: 123,
            studentId: 1,
            assessmentQuestionsByScript: {
              3: {
                123: {
                  questions: [
                    {
                      type: 'FreeResponse',
                      question_text: 'Can you say hello?',
                      question_index: 0
                    }
                  ]
                }
              }
            },
            assessmentResponsesByScript: {
              3: {
                1: {
                  student_name: 'Saira',
                  responses_by_assessment: {
                    123: {
                      level_results: [
                        {
                          student_result: 'Hello world',
                          status: '',
                          type: 'FreeResponse'
                        }
                      ]
                    }
                  }
                },
                2: {
                  student_name: 'Sarah',
                  responses_by_assessment: {
                    123: {
                      level_results: [
                        {
                          student_result: 'Hi',
                          status: '',
                          type: 'FreeResponse'
                        }
                      ]
                    }
                  }
                }
              }
            }
          }
        };
        const result = getAssessmentsFreeResponseResults(stateWithAssessment);
        assert.deepEqual(result, [
          {
            questionText: 'Can you say hello?',
            questionNumber: 1,
            responses: [{id: 1, name: 'Saira', response: 'Hello world'}]
          }
        ]);
      });
    });

    describe('getSurveyFreeResponseQuestions', () => {
      it('returns an empty array when no surveys in redux', () => {
        const result = getSurveyFreeResponseQuestions(rootState);
        assert.deepEqual(result, []);
      });

      it('returns an array of objects representing free response questions', () => {
        const stateWithSurvey = {
          ...rootState,
          sectionAssessments: {
            ...rootState.sectionAssessments,
            assessmentId: 123,
            surveysByScript: {
              3: {
                123: {
                  stage_name: 'name',
                  levelgroup_results: [
                    {
                      type: 'free_response',
                      question_index: 0,
                      question: 'question1',
                      results: [{result: 'Im not sure'}]
                    },
                    {
                      type: 'free_response',
                      question_index: 1,
                      question: 'question2',
                      results: [{result: 'Im very sure'}]
                    }
                  ]
                }
              }
            }
          }
        };
        const result = getSurveyFreeResponseQuestions(stateWithSurvey);
        assert.deepEqual(result, [
          {
            questionText: 'question1',
            questionNumber: 1,
            answers: [{index: 0, response: 'Im not sure'}]
          },
          {
            questionText: 'question2',
            questionNumber: 2,
            answers: [{index: 0, response: 'Im very sure'}]
          }
        ]);
      });
    });

    describe('getMultipleChoiceSurveyResults', () => {
      it('returns an empty array when no surveys in redux', () => {
        const result = getMultipleChoiceSurveyResults(rootState);
        assert.deepEqual(result, []);
      });

      it('returns an array of objects representing free response questions', () => {
        const stateWithSurvey = {
          ...rootState,
          sectionAssessments: {
            ...rootState.sectionAssessments,
            assessmentId: 123,
            surveysByScript: {
              3: {
                123: {
                  stage_name: 'name',
                  levelgroup_results: [
                    {
                      type: 'multi',
                      question_index: 0,
                      question: 'question1',
                      answer_texts: ['agree', 'disagree'],
                      results: [{answer_index: 0}]
                    },
                    {
                      type: 'multi',
                      question_index: 1,
                      question: 'question2',
                      answer_texts: ['agree', 'disagree'],
                      results: [{answer_index: 1}]
                    }
                  ]
                }
              }
            }
          }
        };
        const result = getMultipleChoiceSurveyResults(stateWithSurvey);
        assert.deepEqual(result, [
          {
            id: 0,
            questionNumber: 1,
            question: 'question1',
            answers: [
              {multipleChoiceOption: 'A', percentAnswered: 100, text: 'agree'},
              {multipleChoiceOption: 'B', percentAnswered: 0, text: 'disagree'}
            ],
            notAnswered: 0,
            totalAnswered: 1
          },
          {
            id: 1,
            questionNumber: 2,
            question: 'question2',
            answers: [
              {multipleChoiceOption: 'A', percentAnswered: 0, text: 'agree'},
              {
                multipleChoiceOption: 'B',
                percentAnswered: 100,
                text: 'disagree'
              }
            ],
            notAnswered: 0,
            totalAnswered: 1
          }
        ]);
      });
    });

    describe('isCurrentScriptCSD', () => {
      it('returns true when the current script is CSD', () => {
        const state = {
          ...rootState,
          scriptSelection: {
            scriptId: 2,
            validScripts: [{id: 2, script_name: 'csd8-2011'}]
          }
        };
        const result = isCurrentScriptCSD(state);
        assert.deepEqual(result, true);
      });

      it('returns false when the current script is not CSD', () => {
        const state = {
          ...rootState,
          scriptSelection: {
            scriptId: 2,
            validScripts: [{id: 2, script_name: 'learn-cs'}]
          }
        };
        const result = isCurrentScriptCSD(state);
        assert.deepEqual(result, false);
      });
    });

    describe('doesCurrentCourseUseFeedback', () => {
      it('returns true when the current script is CSD or CSP', () => {
        const state = {
          ...rootState,
          scriptSelection: {
            scriptId: 2,
            validScripts: [{id: 2, script_name: 'csp8-2011'}]
          }
        };
        const result = doesCurrentCourseUseFeedback(state);
        assert.deepEqual(result, true);
      });

      it('returns false when the current script is not CSD or CSP', () => {
        const state = {
          ...rootState,
          scriptSelection: {
            scriptId: 2,
            validScripts: [{id: 2, script_name: 'learn-cs'}]
          }
        };
        const result = doesCurrentCourseUseFeedback(state);
        assert.deepEqual(result, false);
      });
    });

    describe('isCurrentAssessmentSurvey', () => {
      it('returns true when the current assessment is a survey', () => {
        const stateWithSurvey = {
          ...rootState,
          sectionAssessments: {
            ...rootState.sectionAssessments,
            assessmentId: 123,
            surveysByScript: {
              3: {
                123: {}
              }
            }
          }
        };
        const result = isCurrentAssessmentSurvey(stateWithSurvey);
        assert.deepEqual(result, true);
      });

      it('returns false when the current assessment is not a survey', () => {
        const stateWithSurvey = {
          ...rootState,
          sectionAssessments: {
            ...rootState.sectionAssessments,
            assessmentId: 123,
            surveysByScript: {
              3: {
                234: {}
              }
            }
          }
        };
        const result = isCurrentAssessmentSurvey(stateWithSurvey);
        assert.deepEqual(result, false);
      });
    });

    describe('getMultipleChoiceSectionSummary', () => {
      it('returns an empty array when no assessments in redux', () => {
        const result = getMultipleChoiceSectionSummary(rootState);
        assert.deepEqual(result, []);
      });

      it('returns an array of objects of multipleChoiceDataPropType', () => {
        const stateWithAssessment = {
          ...rootState,
          sectionAssessments: {
            ...rootState.sectionAssessments,
            assessmentId: 123,
            assessmentQuestionsByScript: {
              3: {
                123: {
                  id: 123,
                  name: 'name',
                  questions: [
                    {
                      level_id: 456,
                      type: 'Multi',
                      question_text: 'What is a variable?',
                      question_index: 0,
                      answers: [
                        {correct: true, text: 'answer 1'},
                        {correct: false, text: 'answer 2'}
                      ]
                    },
                    {
                      level_id: 789,
                      type: 'Multi',
                      question_text: 'What is a boolean?',
                      question_index: 1,
                      answers: [
                        {correct: false, text: 'answer 1'},
                        {correct: true, text: 'answer 2'}
                      ]
                    },
                    {
                      level_id: 910,
                      type: 'Multi',
                      question_text: 'What is an int?',
                      question_index: 1,
                      answers: [
                        {correct: false, text: 'answer 1'},
                        {correct: true, text: 'answer 2'}
                      ]
                    }
                  ]
                }
              }
            },
            assessmentResponsesByScript: {
              3: {
                1: {
                  student_name: 'Saira',
                  responses_by_assessment: {
                    123: {
                      level_results: [
                        {student_result: [0], status: 'correct', type: 'Multi'},
                        {
                          student_result: [0],
                          status: 'incorrect',
                          type: 'Multi'
                        },
                        {student_result: [1], status: 'correct', type: 'Multi'}
                      ]
                    }
                  }
                },
                2: {
                  student_name: 'Rebecca',
                  responses_by_assessment: {
                    123: {
                      level_results: [
                        {student_result: [0], status: 'correct', type: 'Multi'},
                        {student_result: [1], status: 'correct', type: 'Multi'},
                        {
                          student_result: [],
                          status: 'unsubmitted',
                          type: 'Multi'
                        }
                      ]
                    }
                  }
                }
              }
            }
          }
        };
        const result = getMultipleChoiceSectionSummary(stateWithAssessment);
        assert.deepEqual(result, [
          {
            answers: [
              {
                isCorrect: true,
                multipleChoiceOption: 'A',
                numAnswered: 2
              },
              {
                isCorrect: false,
                multipleChoiceOption: 'B',
                numAnswered: 0
              }
            ],
            id: 456,
            notAnswered: 0,
            question: 'What is a variable?',
            questionNumber: 1,
            totalAnswered: 2
          },
          {
            answers: [
              {
                isCorrect: false,
                multipleChoiceOption: 'A',
                numAnswered: 1
              },
              {
                isCorrect: true,
                multipleChoiceOption: 'B',
                numAnswered: 1
              }
            ],
            id: 789,
            notAnswered: 0,
            question: 'What is a boolean?',
            questionNumber: 2,
            totalAnswered: 2
          },
          {
            answers: [
              {
                isCorrect: false,
                multipleChoiceOption: 'A',
                numAnswered: 0
              },
              {
                isCorrect: true,
                multipleChoiceOption: 'B',
                numAnswered: 1
              }
            ],
            id: 910,
            notAnswered: 1,
            question: 'What is an int?',
            questionNumber: 2,
            totalAnswered: 2
          }
        ]);
      });
    });

    describe('getMatchSectionSummary', () => {
      it('returns an empty array when no assessments in redux', () => {
        const result = getMatchSectionSummary(rootState);
        assert.deepEqual(result, []);
      });

      it('returns an array of objects of matchDataPropType', () => {
        const stateWithAssessment = {
          ...rootState,
          sectionAssessments: {
            ...rootState.sectionAssessments,
            assessmentId: 123,
            assessmentQuestionsByScript: {
              3: {
                123: {
                  id: 123,
                  name: 'name',
                  questions: [
                    {
                      level_id: 456,
                      type: 'Match',
                      question: 'Can you match these things?',
                      question_index: 0,
                      answers: [{text: 'answer 1'}, {text: 'answer 2'}],
                      options: [{text: 'option 1'}, {text: 'option 2'}]
                    },
                    {
                      level_id: 789,
                      type: 'Match',
                      question: 'Do some matching!',
                      question_index: 1,
                      answers: [{text: 'answer 1'}, {text: 'answer 2'}],
                      options: [{text: 'option 1'}, {text: 'option 2'}]
                    },
                    {
                      level_id: 910,
                      type: 'Match',
                      question: 'Matchy Match',
                      question_index: 2,
                      answers: [{text: 'answer 1'}, {text: 'answer 2'}],
                      options: [{text: 'option 1'}, {text: 'option 2'}]
                    }
                  ]
                }
              }
            },
            assessmentResponsesByScript: {
              3: {
                1: {
                  student_name: 'Saira',
                  responses_by_assessment: {
                    123: {
                      level_results: [
                        {
                          student_result: [0, 1],
                          status: ['submitted', 'submitted'],
                          type: 'Match'
                        },
                        {
                          student_result: [null, null],
                          status: ['unsubmitted', 'unsubmitted'],
                          type: 'Match'
                        },
                        {
                          student_result: [null, 1],
                          status: ['unsubmitted', 'submitted'],
                          type: 'Match'
                        }
                      ]
                    }
                  }
                },
                2: {
                  student_name: 'Rebecca',
                  responses_by_assessment: {
                    123: {
                      level_results: [
                        {
                          student_result: [0, 1],
                          status: ['submitted', 'submitted'],
                          type: 'Match'
                        },
                        {
                          student_result: [1, 0],
                          status: ['submitted', 'submitted'],
                          type: 'Match'
                        },
                        {
                          student_result: [null, 1],
                          status: ['unsubmitted', 'submitted'],
                          type: 'Match'
                        }
                      ]
                    }
                  }
                }
              }
            }
          }
        };
        const result = getMatchSectionSummary(stateWithAssessment);
        assert.deepEqual(result, [
          {
            id: 456,
            question: 'Can you match these things?',
            questionNumber: 1,
            options: [
              {
                option: 'option 1',
                id: 0,
                totalAnswered: 2,
                notAnswered: 0,
                answers: [
                  {
                    isCorrect: true,
                    answer: 'answer 1',
                    numAnswered: 2
                  },
                  {
                    isCorrect: false,
                    answer: 'answer 2',
                    numAnswered: 0
                  }
                ]
              },
              {
                option: 'option 2',
                id: 1,
                totalAnswered: 2,
                notAnswered: 0,
                answers: [
                  {
                    isCorrect: false,
                    answer: 'answer 1',
                    numAnswered: 0
                  },
                  {
                    isCorrect: true,
                    answer: 'answer 2',
                    numAnswered: 2
                  }
                ]
              }
            ]
          },
          {
            id: 789,
            question: 'Do some matching!',
            questionNumber: 2,
            options: [
              {
                option: 'option 1',
                id: 0,
                totalAnswered: 2,
                notAnswered: 1,
                answers: [
                  {
                    isCorrect: true,
                    answer: 'answer 1',
                    numAnswered: 0
                  },
                  {
                    isCorrect: false,
                    answer: 'answer 2',
                    numAnswered: 1
                  }
                ]
              },
              {
                option: 'option 2',
                id: 1,
                totalAnswered: 2,
                notAnswered: 1,
                answers: [
                  {
                    isCorrect: false,
                    answer: 'answer 1',
                    numAnswered: 1
                  },
                  {
                    isCorrect: true,
                    answer: 'answer 2',
                    numAnswered: 0
                  }
                ]
              }
            ]
          },
          {
            id: 910,
            question: 'Matchy Match',
            questionNumber: 3,
            options: [
              {
                option: 'option 1',
                id: 0,
                totalAnswered: 2,
                notAnswered: 2,
                answers: [
                  {
                    isCorrect: true,
                    answer: 'answer 1',
                    numAnswered: 0
                  },
                  {
                    isCorrect: false,
                    answer: 'answer 2',
                    numAnswered: 0
                  }
                ]
              },
              {
                option: 'option 2',
                id: 1,
                totalAnswered: 2,
                notAnswered: 0,
                answers: [
                  {
                    isCorrect: false,
                    answer: 'answer 1',
                    numAnswered: 0
                  },
                  {
                    isCorrect: true,
                    answer: 'answer 2',
                    numAnswered: 2
                  }
                ]
              }
            ]
          }
        ]);
      });
    });

    describe('countSubmissionsForCurrentAssessment', () => {
      it('returns zero with no assessmentId', () => {
        const state = {
          sectionAssessments: {}
        };

        const totalSubmissions = countSubmissionsForCurrentAssessment(state);
        assert.deepEqual(totalSubmissions, 0);
      });

      it('returns totals for an assessment', () => {
        const stateWithAssessment = {
          ...rootState,
          sectionAssessments: {
            ...rootState.sectionAssessments,
            assessmentId: 123,
            assessmentQuestionsByScript: {
              3: {
                123: {
                  id: 123,
                  name: 'name',
                  questions: []
                }
              }
            },
            assessmentResponsesByScript: {
              3: {
                1: {
                  student_name: 'Saira',
                  responses_by_assessment: {
                    123: {
                      level_results: []
                    }
                  }
                },
                2: {
                  student_name: 'Rebecca',
                  responses_by_assessment: {
                    123: {
                      level_results: []
                    }
                  }
                }
              }
            }
          }
        };

        const totalSubmissions = countSubmissionsForCurrentAssessment(
          stateWithAssessment
        );
        assert.deepEqual(totalSubmissions, 2);
      });

      it('returns totals for a survey', () => {
        const stateWithSurvey = {
          ...rootState,
          sectionAssessments: {
            ...rootState.sectionAssessments,
            assessmentId: 123,
            surveysByScript: {
              3: {
                123: {
                  stage_name: 'name',
                  levelgroup_results: [
                    {
                      type: 'multi',
                      question_index: 0,
                      question: 'question1',
                      answer_texts: [{text: 'agree'}, {text: 'disagree'}],
                      results: [{answer_index: 0}]
                    },
                    {
                      type: 'multi',
                      question_index: 1,
                      question: 'question2',
                      answer_texts: [{text: 'agree'}, {text: 'disagree'}],
                      results: [{answer_index: 1}]
                    }
                  ]
                }
              }
            }
          }
        };

        const totalSubmissions = countSubmissionsForCurrentAssessment(
          stateWithSurvey
        );
        assert.deepEqual(totalSubmissions, 1);
      });

      it('returns 0 for 0 survey submissions', () => {
        const stateWithSurvey = {
          ...rootState,
          sectionAssessments: {
            ...rootState.sectionAssessments,
            assessmentId: 123,
            surveysByScript: {
              3: {
                123: {
                  stage_name: 'name',
                  levelgroup_results: []
                }
              }
            }
          }
        };

        const totalSubmissions = countSubmissionsForCurrentAssessment(
          stateWithSurvey
        );
        assert.deepEqual(totalSubmissions, 0);
      });
    });

    describe('getExportableSurveyData', () => {
      it('returns an array of objects', () => {
        const stateWithSurvey = {
          ...rootState,
          sectionAssessments: {
            ...rootState.sectionAssessments,
            assessmentId: 123,
            surveysByScript: {
              3: {
                123: {
                  stage_name: 'name',
                  levelgroup_results: [
                    {
                      type: 'multi',
                      question_index: 0,
                      question: 'question1',
                      answer_texts: ['agree', 'disagree'],
                      results: [{answer_index: 0}]
                    },
                    {
                      type: 'multi',
                      question_index: 1,
                      question: 'question2',
                      answer_texts: ['agree', 'disagree'],
                      results: [{answer_index: 1}]
                    }
                  ]
                }
              }
            }
          }
        };

        const csvData = getExportableSurveyData(stateWithSurvey);
        assert.deepEqual(csvData, [
          {
            answer: 'agree',
            numberAnswered: 1,
            questionNumber: 1,
            questionText: 'question1',
            stage: 'name'
          },
          {
            answer: 'disagree',
            numberAnswered: 0,
            questionNumber: 1,
            questionText: 'question1',
            stage: 'name'
          },
          {
            answer: 'agree',
            numberAnswered: 0,
            questionNumber: 2,
            questionText: 'question2',
            stage: 'name'
          },
          {
            answer: 'disagree',
            numberAnswered: 1,
            questionNumber: 2,
            questionText: 'question2',
            stage: 'name'
          }
        ]);
      });
    });

    describe('getExportableAssessmentData', () => {
      it('returns an array of objects', () => {
        const stateWithAssessment = {
          ...rootState,
          sectionAssessments: {
            ...rootState.sectionAssessments,
            assessmentId: 123,
            assessmentQuestionsByScript: {
              3: {
                123: {
                  id: 123,
                  name: 'name',
                  questions: []
                }
              }
            },
            assessmentResponsesByScript: {
              3: {
                1: {
                  student_name: 'Saira',
                  responses_by_assessment: {
                    123: {
                      level_results: [
                        {student_result: [0], status: 'correct', type: 'Multi'},
                        {student_result: [1], status: 'correct', type: 'Multi'},
                        {
                          student_result: [],
                          status: 'unsubmitted',
                          type: 'Multi'
                        }
                      ],
                      stage: 'stage 1',
                      timestamp: '1'
                    }
                  }
                },
                2: {
                  student_name: 'Rebecca',
                  responses_by_assessment: {
                    123: {
                      level_results: [
                        {student_result: [0], status: 'correct', type: 'Multi'},
                        {student_result: [1], status: 'correct', type: 'Multi'},
                        {
                          student_result: [1],
                          status: 'incorrect',
                          type: 'Multi'
                        }
                      ],
                      stage: 'stage 1',
                      timestamp: '1'
                    }
                  }
                }
              }
            }
          }
        };

        const csvData = getExportableAssessmentData(stateWithAssessment);
        assert.deepEqual(csvData, [
          {
            correct: 'correct',
            question: 1,
            response: 'A',
            stage: 'stage 1',
            studentName: 'Saira',
            timestamp: '1'
          },
          {
            correct: 'correct',
            question: 2,
            response: 'B',
            stage: 'stage 1',
            studentName: 'Saira',
            timestamp: '1'
          },
          {
            correct: 'unsubmitted',
            question: 3,
            response: '',
            stage: 'stage 1',
            studentName: 'Saira',
            timestamp: '1'
          },
          {
            correct: 'correct',
            question: 1,
            response: 'A',
            stage: 'stage 1',
            studentName: 'Rebecca',
            timestamp: '1'
          },
          {
            correct: 'correct',
            question: 2,
            response: 'B',
            stage: 'stage 1',
            studentName: 'Rebecca',
            timestamp: '1'
          },
          {
            correct: 'incorrect',
            question: 3,
            response: 'B',
            stage: 'stage 1',
            studentName: 'Rebecca',
            timestamp: '1'
          }
        ]);
      });
    });

    describe('getExportableFeedbackData', () => {
      it('returns an array of objects', () => {
        const stateWithFeedback = {
          ...rootState,
          scriptSelection: {
            scriptId: 2
          },
          sectionAssessments: {
            ...rootState.sectionAssessments,
            feedbackByScript: {
              2: {
                13: {
                  studentName: 'Mike',
                  lessonNum: '4',
                  stageName: 'Loops',
                  levelNum: '7',
                  keyConcept: 'You should be learning about loops',
                  performanceLevelDetails: 'A loop is in the code',
                  performance: 'performanceLevel1',
                  comment: 'Nice job using loops!',
                  timestamp: '03/21/19 at 12:17:17 PM'
                },
                40: {
                  studentName: 'Anne',
                  lessonNum: '8',
                  stageName: 'Functions',
                  levelNum: '10',
                  keyConcept: '',
                  performanceLevelDetails: '',
                  performance: '',
                  comment: '',
                  timestamp: '05/08/18 at 6:21:11 AM'
                },
                52: {
                  studentName: 'Mike',
                  lessonNum: '3',
                  stageName: 'Variables',
                  levelNum: '3',
                  keyConcept: 'Use variables to help and make coding better.',
                  performanceLevelDetails:
                    'You have some variables but are still missing out on their amazingness',
                  performance: 'performanceLevel3',
                  comment:
                    'There are at least 3 more variables you could be using.',
                  timestamp: '03/21/19 at 12:17:17 PM'
                },
                61: {
                  studentName: 'Anne',
                  lessonNum: '3',
                  stageName: 'Variables',
                  levelNum: '3',
                  keyConcept: 'Use variables to help and make coding better.',
                  performanceLevelDetails: 'You uses no variables',
                  performance: 'performanceLevel4',
                  comment: "Why didn't you use variables?",
                  timestamp: '03/21/19 at 12:21:17 PM'
                }
              }
            }
          }
        };

        const csvData = getExportableFeedbackData(stateWithFeedback);
        assert.deepEqual(csvData, [
          {
            studentName: 'Mike',
            lessonNum: '4',
            stageName: 'Loops',
            levelNum: '7',
            keyConcept: 'You should be learning about loops',
            performanceLevelDetails: 'A loop is in the code',
            performance: 'performanceLevel1',
            comment: 'Nice job using loops!',
            timestamp: '03/21/19 at 12:17:17 PM'
          },
          {
            studentName: 'Anne',
            lessonNum: '8',
            stageName: 'Functions',
            levelNum: '10',
            keyConcept: '',
            performanceLevelDetails: '',
            performance: '',
            comment: '',
            timestamp: '05/08/18 at 6:21:11 AM'
          },
          {
            studentName: 'Mike',
            lessonNum: '3',
            stageName: 'Variables',
            levelNum: '3',
            keyConcept: 'Use variables to help and make coding better.',
            performanceLevelDetails:
              'You have some variables but are still missing out on their amazingness',
            performance: 'performanceLevel3',
            comment: 'There are at least 3 more variables you could be using.',
            timestamp: '03/21/19 at 12:17:17 PM'
          },
          {
            studentName: 'Anne',
            lessonNum: '3',
            stageName: 'Variables',
            levelNum: '3',
            keyConcept: 'Use variables to help and make coding better.',
            performanceLevelDetails: 'You uses no variables',
            performance: 'performanceLevel4',
            comment: "Why didn't you use variables?",
            timestamp: '03/21/19 at 12:21:17 PM'
          }
        ]);
      });
    });

    describe('getStudentsMCandMatchSummaryForCurrentAssessment', () => {
      it('returns an empty object when no assessments in redux', () => {
        const result = getStudentsMCandMatchSummaryForCurrentAssessment({
          ...rootState,
          sectionData: {
            section: {
              students: []
            }
          }
        });
        assert.deepEqual(result, []);
      });

      it('returns an array of objects of studentOverviewDataPropType', () => {
        const date = new Date();
        const stateWithAssessment = {
          ...rootState,
          sectionData: {
            section: {
              students: [
                {
                  name: 'Issac',
                  id: 99
                }
              ]
            }
          },
          sectionAssessments: {
            ...rootState.sectionAssessments,
            assessmentId: 123,
            assessmentResponsesByScript: {
              3: {
                2: {
                  student_name: 'Ilulia',
                  responses_by_assessment: {
                    123: {
                      multi_correct: 4,
                      multi_count: 10,
                      match_correct: 2,
                      match_count: 4,
                      submitted: true,
                      timestamp: date,
                      url: 'code.org'
                    }
                  }
                }
              }
            }
          }
        };
        const result = getStudentsMCandMatchSummaryForCurrentAssessment(
          stateWithAssessment
        );
        assert.deepEqual(result, [
          {
            id: 2,
            name: 'Ilulia',
            numMultipleChoice: 10,
            numMultipleChoiceCorrect: 4,
            numMatch: 4,
            numMatchCorrect: 2,
            isSubmitted: true,
            inProgress: false,
            submissionTimeStamp: date,
            url: 'code.org'
          },
          {
            id: 99,
            name: 'Issac',
            isSubmitted: false,
            inProgress: false,
            submissionTimeStamp: notStartedFakeTimestamp
          }
        ]);
      });
    });

    it('returns summary data for specific student', () => {
      const stateWithAssessment = {
        ...rootState,
        sectionData: {
          section: {
            students: [
              {
                name: 'Issac',
                id: 99
              }
            ]
          }
        },
        sectionAssessments: {
          ...rootState.sectionAssessments,
          assessmentId: 123,
          studentId: 99,
          assessmentResponsesByScript: {
            3: {
              2: {
                student_name: 'Ilulia',
                responses_by_assessment: {
                  123: {
                    multi_correct: 4,
                    multi_count: 10,
                    match_correct: 2,
                    match_count: 4,
                    submitted: true,
                    timestamp: '2018-06-12 04:53:36 UTC',
                    url: 'code.org'
                  }
                }
              }
            }
          }
        }
      };
      const result = getStudentsMCandMatchSummaryForCurrentAssessment(
        stateWithAssessment
      );
      assert.deepEqual(result, [
        {
          id: 99,
          name: 'Issac',
          isSubmitted: false,
          inProgress: false,
          submissionTimeStamp: notStartedFakeTimestamp
        }
      ]);
    });

    describe('getCurrentQuestion', () => {
      it('returns the question text for a survey', () => {
        const stateWithSurvey = {
          ...rootState,
          sectionAssessments: {
            ...rootState.sectionAssessments,
            questionIndex: 0,
            assessmentId: 123,
            surveysByScript: {
              3: {
                123: {
                  stage_name: 'name',
                  levelgroup_results: [
                    {
                      question: 'What is a variable?',
                      type: 'multi',
                      answer_texts: ['a']
                    }
                  ]
                }
              }
            }
          }
        };

        const question = getCurrentQuestion(stateWithSurvey);
        assert.deepEqual('What is a variable?', question.question);
        assert.deepEqual(
          [{text: 'a', correct: false, letter: 'A'}],
          question.answers
        );
      });

      it('returns the question text for an assessment where current question is multi', () => {
        const stateWithAssessment = {
          ...rootState,
          sectionAssessments: {
            ...rootState.sectionAssessments,
            questionIndex: 1,
            assessmentId: 123,
            assessmentQuestionsByScript: {
              3: {
                123: {
                  name: 'name',
                  questions: [
                    {
                      question_text: 'What is a variable?',
                      type: 'Multi',
                      answers: [{text: 'b', correct: false}]
                    },
                    {
                      question_text: 'What is a function?',
                      type: 'Multi',
                      answers: [{text: 'a', correct: true}]
                    },
                    {
                      type: 'Match',
                      question: 'Can you match these things?',
                      answers: [{text: 'answer 1'}, {text: 'answer 2'}],
                      options: [{text: 'option 1'}, {text: 'option 2'}]
                    }
                  ]
                }
              }
            }
          }
        };

        const question = getCurrentQuestion(stateWithAssessment);
        assert.deepEqual(question.question, 'What is a function?');
        assert.deepEqual(question.answers, [
          {text: 'a', correct: true, letter: 'A'}
        ]);
      });

      it('returns the question text for an assessment where current question is match ', () => {
        const stateWithAssessment = {
          ...rootState,
          sectionAssessments: {
            ...rootState.sectionAssessments,
            questionIndex: 2,
            assessmentId: 123,
            assessmentQuestionsByScript: {
              3: {
                123: {
                  name: 'name',
                  questions: [
                    {
                      question_text: 'What is a variable?',
                      type: 'Multi',
                      answers: [{text: 'b', correct: false}]
                    },
                    {
                      question_text: 'What is a function?',
                      type: 'Multi',
                      answers: [{text: 'a', correct: true}]
                    },
                    {
                      type: 'Match',
                      question: 'Can you match these things?',
                      answers: [{text: 'answer 1'}, {text: 'answer 2'}],
                      options: [{text: 'option 1'}, {text: 'option 2'}]
                    }
                  ]
                }
              }
            }
          }
        };

        const question = getCurrentQuestion(stateWithAssessment);
        assert.deepEqual(question.question, 'Can you match these things?');
        assert.deepEqual(question.answers, ['answer 1', 'answer 2']);
      });

      it('returns an empty answers array if answers is undefined', () => {
        const stateWithAssessment = {
          ...rootState,
          sectionAssessments: {
            ...rootState.sectionAssessments,
            questionIndex: 0,
            assessmentId: 123,
            assessmentQuestionsByScript: {
              3: {
                123: {
                  name: 'name',
                  questions: [
                    {
                      question_text: 'What is a variable?',
                      type: 'Multi',
                      answers: undefined
                    }
                  ]
                }
              }
            }
          }
        };

        const question = getCurrentQuestion(stateWithAssessment);
        assert.deepEqual(question.question, 'What is a variable?');
        assert.deepEqual(question.answers, []);
      });
    });

    describe('getStudentAnswersForCurrentQuestion', () => {
      it('returns an empty array for a survey', () => {
        const stateWithSurvey = {
          ...rootState,
          sectionAssessments: {
            ...rootState.sectionAssessments,
            questionIndex: 0,
            assessmentId: 123,
            surveysByScript: {
              3: {
                123: {
                  stage_name: 'name'
                }
              }
            }
          }
        };

        const answers = getStudentAnswersForCurrentQuestion(stateWithSurvey);
        assert.deepEqual(answers, []);
      });

      it('returns an array of answers for an assessment', () => {
        const stateWithAssessment = {
          ...rootState,
          sectionAssessments: {
            ...rootState.sectionAssessments,
            questionIndex: 0,
            assessmentId: 123,
            assessmentResponsesByScript: {
              3: {
                1: {
                  student_name: 'Saira',
                  responses_by_assessment: {
                    123: {
                      level_results: [
                        {
                          student_result: [3],
                          status: 'incorrect',
                          type: 'Multi'
                        },
                        {
                          student_result: 'Hi',
                          status: '',
                          type: 'FreeResponse'
                        }
                      ]
                    }
                  }
                }
              }
            }
          }
        };

        const answers = getStudentAnswersForCurrentQuestion(
          stateWithAssessment
        );
        assert.deepEqual(answers, [
          {id: 1, name: 'Saira', answer: 'D', correct: false}
        ]);
      });
    });
  });
});
