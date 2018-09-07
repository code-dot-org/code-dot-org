import {assert} from '../../../util/configuredChai';
import sectionAssessments, {
  setAssessmentResponses,
  setSurveys,
  setAssessmentQuestions,
  startLoadingAssessments,
  finishLoadingAssessments,
  setAssessmentId,
  getCurrentScriptAssessmentList,
  getMultipleChoiceStructureForCurrentAssessment,
  getStudentMCResponsesForCurrentAssessment,
  getStudentsMCSummaryForCurrentAssessment,
  getSurveyFreeResponseQuestions,
  getAssessmentsFreeResponseResults,
  getMultipleChoiceSurveyResults,
  getMultipleChoiceSectionSummary,
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
          1: [{question: "a question", puzzle: 2}],
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
          1: [{question: "a question", puzzle: 2}],
        }
      };
      const action = setScriptId(2);
      const nextState = sectionAssessments(currentState, action);
      assert.deepEqual(nextState.studentId, 0);
      assert.deepEqual(nextState.assessmentResponsesByScript, currentState.assessmentResponsesByScript);
    });
  });

  describe('setAssessmentResponses', () => {
    it('associates the assessment data to the correct script', () => {
      const scriptId = 2;
      const assessmentData = [{question: "a question", puzzle: 1}];
      const action = setAssessmentResponses(scriptId, assessmentData);
      const nextState = sectionAssessments(initialState, action);
      const actualAssessmentData = nextState.assessmentResponsesByScript[scriptId];
      assert.deepEqual(actualAssessmentData, assessmentData);
    });
  });

  describe('setSurveys', () => {
    it('associates the assessment data to the correct script', () => {
      const scriptId = 2;
      const surveyData = [{stage_name: "a name", levelgroup_results: []}];
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
          name: "Assessment for Chapter 1",
          questions: {123: {type: "Multi", question_text: "A question", answers: [{text: "answer 1", correct: true}] }}
        }
      };
      const action = setAssessmentQuestions(scriptId, assessmentData);
      const nextState = sectionAssessments(initialState, action);
      const actualAssessmentData = nextState.assessmentQuestionsByScript[scriptId];
      assert.deepEqual(actualAssessmentData, assessmentData);
      assert.deepEqual(nextState.assessmentId, 139);
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
    it('gets a list of assessments in current script', () => {
      const rootState = {
        scriptSelection: {
          scriptId: 123
        },
        sectionAssessments: {
          ...initialState,
          assessmentQuestionsByScript: {
            123: {
              7: {id: 7, name: 'Assessment 7'},
              8: {id: 8, name: 'Assessment 8'},
            },
            456: {
              4: {id: 4, name: 'Assessment 4'},
              5: {id: 5, name: 'Assessment 5'},
            },
          },
          surveysByScript: {
            123: {
              9: {stage_name: 'Survey 9'},
            },
          },
        },
      };
      const result = getCurrentScriptAssessmentList(rootState);
      assert.deepEqual(result.length, 3);
      assert.deepEqual(result[0], {id: 7, name: 'Assessment 7'});
      assert.deepEqual(result[1], {id: 8, name: 'Assessment 8'});
      assert.deepEqual(result[2], {id: 9, name: 'Survey 9'});
    });
  });

  describe('correct answer helper methods', () => {
    describe('getCorrectAnswer', () => {
      it('returns a string of letters', () => {
        const answerArray = [{text: 'answer1', correct: false}, {text: 'answer2', correct: true}];
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

    afterEach(()=>{
      rootState = {};
    });

    describe('getMultipleChoiceStructureForCurrentAssessment', () => {
      it('returns an empty array when no assessments in redux', () => {
        const result = getMultipleChoiceStructureForCurrentAssessment(rootState);
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
                        {correct: true, text: 'answer 2'},
                      ],
                      question_text: 'What is a variable?',
                      type: 'Multi',
                      level_id: 456,
                      question_index: 0,
                    }
                  ]
                }
              }
            }
          }
        };
        const result = getMultipleChoiceStructureForCurrentAssessment(stateWithAssessment);
        assert.deepEqual(result, [{correctAnswer: 'B', id: 456, questionNumber: 1, question: 'What is a variable?'}]);
      });
    });

    describe('getStudentMCResponsesForCurrentAssessment', () => {
      it('returns an empty array when no assessments in redux', () => {
        const result = getStudentMCResponsesForCurrentAssessment(rootState);
        assert.deepEqual(result, {});
      });

      it('returns an array of objects of studentAnswerDataPropType', () => {
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
                          type: 'FreeResponse',
                        }
                      ]
                    }
                  }
                }
              }
            }
          }
        };
        const result = getStudentMCResponsesForCurrentAssessment(stateWithAssessment);
        assert.deepEqual(result, {id: 1, name: 'Saira', studentResponses: [{responses: 'D', isCorrect: false}]});
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
                      question_index: 0,
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
                          type: 'FreeResponse',
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
        assert.deepEqual(result, [{
          questionText: "Can you say hello?",
          questionNumber: 1,
          responses: [{id: 1, name: "Saira", response: "Hello world"}]
        }]);
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
                      question_index: 0,
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
                          type: 'FreeResponse',
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
                          type: 'FreeResponse',
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
        assert.deepEqual(result, [{
          questionText: "Can you say hello?",
          questionNumber: 1,
          responses: [{id: 1, name: "Saira", response: "Hello world"}]
        }]);
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
                    {type: 'free_response', question_index: 0, question: 'question1', results: [{result: 'Im not sure'},]},
                    {type: 'free_response', question_index: 1, question: 'question2', results: [{result: 'Im very sure'},]},
                  ],
                }
              }
            }
          }
        };
        const result = getSurveyFreeResponseQuestions(stateWithSurvey);
        assert.deepEqual(result, [
          {questionText: 'question1', questionNumber: 1, answers: [{index: 0, response: 'Im not sure'}]},
          {questionText: 'question2', questionNumber: 2, answers: [{index: 0, response: 'Im very sure'}]}
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
                      answer_texts: [{text: 'agree'}, {text: 'disagree'}],
                      results: [{answer_index: 0}]
                    },
                    {
                      type: 'multi',
                      question_index: 1,
                      question: 'question2',
                      answer_texts: [{text: 'agree'}, {text: 'disagree'}],
                      results: [{answer_index: 1}]
                    },
                  ],
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
            answers: [{multipleChoiceOption: 'A', percentAnswered: 100}, {multipleChoiceOption: 'B', percentAnswered: 0}],
            notAnswered: 0,
          },
          {
            id: 1,
            questionNumber: 2,
            question: 'question2',
            answers: [{multipleChoiceOption: 'A', percentAnswered: 0}, {multipleChoiceOption: 'B', percentAnswered: 100}],
            notAnswered: 0,
          },
        ]);
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
                        {correct: true, text: 'answer 1',},
                        {correct: false, text: 'answer 2',}
                      ]
                    },
                    {
                      level_id: 789,
                      type: 'Multi',
                      question_text: 'What is a boolean?',
                      question_index: 1,
                      answers: [
                        {correct: false, text: 'answer 1',},
                        {correct: true, text: 'answer 2',}
                      ]
                    },
                    {
                      level_id: 910,
                      type: 'Multi',
                      question_text: 'What is an int?',
                      question_index: 1,
                      answers: [
                        {correct: false, text: 'answer 1',},
                        {correct: true, text: 'answer 2',}
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
                        {student_result: [0], status: 'incorrect', type: 'Multi'},
                        {student_result: [1], status: 'correct', type: 'Multi'},
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
                        {student_result: [], status: 'unsubmitted', type: 'Multi'},
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
           "answers": [
              {
                "isCorrect": true,
                "multipleChoiceOption": "A",
                "numAnswered": 2,
              },
              {
                "isCorrect": false,
                "multipleChoiceOption": "B",
                "numAnswered": 0
              }
            ],
            "id": 456,
            "notAnswered": 0,
            "question": "What is a variable?",
            "questionNumber": 1,
            "totalAnswered": 2,
          },
          {
            "answers": [
              {
                "isCorrect": false,
                "multipleChoiceOption": "A",
                "numAnswered": 1
              },
              {
                "isCorrect": true,
                "multipleChoiceOption": "B",
                "numAnswered": 1,
              }
            ],
            "id": 789,
            "notAnswered": 0,
            "question": "What is a boolean?",
            "questionNumber": 2,
            "totalAnswered": 2,
          },
          {
            "answers": [
              {
                "isCorrect": false,
                "multipleChoiceOption": "A",
                "numAnswered": 0,
              },
              {
                "isCorrect": true,
                "multipleChoiceOption": "B",
                "numAnswered": 1,
              }
            ],
            "id": 910,
            "notAnswered": 1,
            "question": "What is an int?",
            "questionNumber": 2,
            "totalAnswered": 2,
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

        const totalSubmissions = countSubmissionsForCurrentAssessment(stateWithAssessment);
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
                    },
                  ],
                }
              }
            }
          }
        };

        const totalSubmissions = countSubmissionsForCurrentAssessment(stateWithSurvey);
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
                  levelgroup_results: [],
                }
              }
            }
          }
        };

        const totalSubmissions = countSubmissionsForCurrentAssessment(stateWithSurvey);
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
                    },
                  ],
                }
              }
            }
          }
        };

        const csvData = getExportableSurveyData(stateWithSurvey);
        assert.deepEqual(csvData, [
          {
            "answer": "agree",
            "numberAnswered": 1,
            "questionNumber": 1,
            "questionText": "question1",
            "stage": "name",
          },
          {
            "answer": "disagree",
            "numberAnswered": 0,
            "questionNumber": 1,
            "questionText": "question1",
            "stage": "name",
          },
          {
            "answer": "agree",
            "numberAnswered": 0,
            "questionNumber": 2,
            "questionText": "question2",
            "stage": "name",
          },
          {
            "answer": "disagree",
            "numberAnswered": 1,
            "questionNumber": 2,
            "questionText": "question2",
            "stage": "name",
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
                        {student_result: [], status: 'unsubmitted', type: 'Multi'},
                      ],
                      stage: "stage 1",
                      timestamp: '1',
                    }
                  },
                },
                2: {
                  student_name: 'Rebecca',
                  responses_by_assessment: {
                    123: {
                      level_results: [
                        {student_result: [0], status: 'correct', type: 'Multi'},
                        {student_result: [1], status: 'correct', type: 'Multi'},
                        {student_result: [1], status: 'incorrect', type: 'Multi'},
                      ],
                      stage: "stage 1",
                      timestamp: '1',
                    }
                  },
                }
              }
            }
          }
        };

        const csvData = getExportableAssessmentData(stateWithAssessment);
        assert.deepEqual(csvData, [
          {
            correct: "correct",
            question: 1,
            response: "A",
            stage: "stage 1",
            studentName: "Saira",
            timestamp: '1',
          },
          {
            correct: "correct",
            question: 2,
            response: "B",
            stage: "stage 1",
            studentName: "Saira",
            timestamp: '1',
          },
          {
            correct: "unsubmitted",
            question: 3,
            response: "",
            stage: "stage 1",
            studentName: "Saira",
            timestamp: '1',
          },
          {
            correct: "correct",
            question: 1,
            response: "A",
            stage: "stage 1",
            studentName: "Rebecca",
            timestamp: '1',
          },
          {
            correct: "correct",
            question: 2,
            response: "B",
            stage: "stage 1",
            studentName: "Rebecca",
            timestamp: '1',
          },
          {
            correct: "incorrect",
            question: 3,
            response: "B",
            stage: "stage 1",
            studentName: "Rebecca",
            timestamp: '1',
          }
        ]);
      });
    });

    describe('getStudentsMCSummaryForCurrentAssessment', () => {
      it('returns an empty object when no assessments in redux', () => {
        const result = getStudentsMCSummaryForCurrentAssessment({
          ...rootState,
          sectionData: {
            section: {
              students: [],
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
              students: [{
                name: "Issac",
                id: 99,
              }],
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
                      submitted: true,
                      timestamp: date,
                      url: "code.org",
                    }
                  }
                }
              }
            }
          }
        };
        const result = getStudentsMCSummaryForCurrentAssessment(stateWithAssessment);
        assert.deepEqual(result,
          [
            {
              id: 2,
              name: "Ilulia",
              numMultipleChoice: 10,
              numMultipleChoiceCorrect: 4,
              isSubmitted: true,
              submissionTimeStamp: date.toLocaleString(),
              url: "code.org",
            },
            {
              id: 99,
              name: "Issac",
              isSubmitted: false,
              submissionTimeStamp: "Not started"
            },
          ]
        );
      });
    });

    it('returns summary data for specific student', () => {
      const stateWithAssessment = {
        ...rootState,
        sectionData: {
          section: {
            students: [{
              name: "Issac",
              id: 99,
            }],
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
                    submitted: true,
                    timestamp: "2018-06-12 04:53:36 UTC",
                    url: "code.org",
                  }
                }
              }
            }
          }
        }
      };
      const result = getStudentsMCSummaryForCurrentAssessment(stateWithAssessment);
      assert.deepEqual(result,
        [
          {
            id: 99,
            name: "Issac",
            isSubmitted: false,
            submissionTimeStamp: "Not started"
          },
        ]
      );
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
                  levelgroup_results: [{
                    question: 'What is a variable?',
                    type: 'multi',
                    answer_texts: ["a"],
                  }],
                }
              }
            }
          }
        };

        const question = getCurrentQuestion(stateWithSurvey);
        assert.deepEqual(question.question, 'What is a variable?');
        assert.deepEqual(question.answers, [{text: 'a', correct: false, letter: 'A'}]);
      });

      it('returns the question text for an assessment', () => {
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
                    {question_text: 'What is a variable?', type: 'Multi', answers: [{text: "b", correct: false}]},
                    {question_text: 'What is a function?', type: 'Multi', answers: [{text: "a", correct: true}]},
                  ],
                }
              }
            }
          }
        };

        const question = getCurrentQuestion(stateWithAssessment);
        assert.deepEqual(question.question, 'What is a function?');
        assert.deepEqual(question.answers, [{text: 'a', correct: true, letter: 'A'}]);
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
                  stage_name: 'name',
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
                          type: 'FreeResponse',
                        }
                      ]
                    }
                  }
                }
              }
            },
          }
        };

        const answers = getStudentAnswersForCurrentQuestion(stateWithAssessment);
        assert.deepEqual(answers, [{id: 1, name: 'Saira', answer: 'D', correct: false}]);
      });
    });
  });
});
