import React from 'react';
import {Provider} from 'react-redux';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux
} from '@cdo/apps/redux';
import workshopDashboard, {
  setPermission
} from '@cdo/apps/code-studio/pd/workshop_dashboard/reducers';
import {expect} from 'chai';
import Results from '@cdo/apps/code-studio/pd/workshop_dashboard/reports/foorm/results';
import {mount} from 'enzyme';

describe('Foorm Daily Survey Results', () => {
  beforeEach(() => {
    stubRedux();
    registerReducers({
      workshopDashboard
    });
    const store = getStore();
    store.dispatch(setPermission(['workshop_admin']));
  });

  afterEach(() => {
    restoreRedux();
  });

  it('Renders expected number of sessions, questions, and free responses', () => {
    const results = mount(
      <Provider store={getStore()}>
        <Results
          questions={{
            general: {
              form_key_1: {
                q1: {
                  title: 'question 1',
                  type: 'text'
                },
                q2: {
                  title: 'question 2',
                  type: 'singleSelect',
                  choices: {
                    choice1: 'choice 1',
                    choice2: 'choice 2',
                    choice3: 'choice 3',
                    choice4: 'choice 4'
                  },
                  other_text: 'Other'
                },
                q3: {
                  title: 'question 3',
                  type: 'multiSelect',
                  choices: {
                    choice1_q3: 'choice 1 q3',
                    choice2_q3: 'choice 2 q3',
                    choice3_q3: 'choice 3 q3',
                    choice4_q3: 'choice 4 q3'
                  }
                },
                q4: {
                  title: 'question 4',
                  type: 'matrix',
                  rows: {
                    row1: 'row 1',
                    row2: 'row 2'
                  },
                  columns: {
                    column1: 'column 1',
                    column2: 'column 2',
                    column3: 'column 3'
                  }
                }
              }
            },
            facilitator: {
              form_key_1: {
                q1_facilitator: {
                  title: 'question 1 facilitator',
                  type: 'text'
                },
                q2_facilitator: {
                  title: 'question 2 facilitator',
                  type: 'singleSelect',
                  choices: {
                    choice1: 'choice 1',
                    choice2: 'choice 2',
                    choice3: 'choice 3',
                    choice4: 'choice 4'
                  },
                  other_text: 'Other'
                },
                q3_facilitator: {
                  title: 'question 3 facilitator',
                  type: 'multiSelect',
                  choices: {
                    choice1_q3: 'choice 1 q3',
                    choice2_q3: 'choice 2 q3',
                    choice3_q3: 'choice 3 q3',
                    choice4_q3: 'choice 4 q3'
                  }
                },
                q4_facilitator: {
                  title: 'question 4 facilitator',
                  type: 'matrix',
                  rows: {
                    row1: 'row 1',
                    row2: 'row 2'
                  },
                  columns: {
                    column1: 'column 1',
                    column2: 'column 2',
                    column3: 'column 3'
                  }
                }
              }
            }
          }}
          facilitators={{'1': 'facilitator 1', '2': 'facilitator 2'}}
          thisWorkshop={{
            'Day 0': {
              general: {
                response_count: 10,
                form_key_1: {
                  q1: ['answer1', 'answer2'],
                  q2: {
                    choice1: 3,
                    choice2: 2,
                    choice3: 1,
                    choice4: 2,
                    other_answers: ['other']
                  },
                  q3: {
                    num_respondents: 4,
                    choice1_q3: 1,
                    choice2_q3: 2,
                    choice3_q3: 2
                  },
                  q4: {
                    row1: {column1: 1, column2: 2, column3: 1},
                    row2: {column1: 2, column2: 1, column3: 1}
                  }
                }
              },
              facilitator: {
                response_count: {'1': 4, '2': 7},
                form_key_1: {
                  q1_facilitator: {
                    '1': ['answer1!', 'answer2'],
                    '2': ['answer3!', 'answer4']
                  },
                  q2_facilitator: {
                    '1': {
                      choice1: 1,
                      choice2: 1,
                      choice3: 1,
                      choice4: 1
                    },
                    '2': {
                      choice1: 1,
                      choice2: 4,
                      choice3: 1
                    }
                  },
                  q3_facilitator: {
                    '1': {
                      num_respondents: 3,
                      choice1_q3: 2,
                      choice2_q3: 1,
                      choice3_q3: 3
                    },
                    '2': {
                      num_respondents: 5,
                      choice1_q3: 2,
                      choice2_q3: 1,
                      choice4_q3: 3
                    }
                  },
                  q4_facilitator: {
                    '1': {
                      row1: {column1: 1, column2: 2, column3: 1}
                    }
                  }
                }
              }
            }
          }}
          courseName="Course Name"
          workshopRollups={{
            general: {
              questions: {
                rollup_q1: {
                  title: 'rollup q1',
                  type: 'matrix',
                  form_keys: ['form_key_1'],
                  rows: {
                    row1: 'row 1',
                    row2: 'row 2'
                  },
                  column_count: 5,
                  header: 'rollup header'
                }
              },
              single_workshop: {
                response_count: 4,
                averages: {
                  rollup_q1: {average: 4, rows: {row1: 3, row2: 5}}
                }
              },
              overall_facilitator: {
                '1': {
                  response_count: 3,
                  averages: {
                    rollup_q1: {average: 4.2, rows: {row1: 4.1, row2: 4.3}}
                  }
                },
                '2': {
                  response_count: 5,
                  averages: {
                    rollup_q1: {average: 3, rows: {row1: 2.5, row2: 3.5}}
                  }
                }
              },
              overall: {
                response_count: 15,
                averages: {
                  rollup_q1: {average: 4.5, rows: {row1: 4, row2: 5}}
                }
              }
            },
            facilitator: {
              questions: {
                facilitator_rollup_q1: {
                  title: 'facilitator rollup q1',
                  type: 'matrix',
                  form_keys: ['form_key_1'],
                  rows: {
                    row1: 'row 1',
                    row2: 'row 2'
                  },
                  column_count: 5,
                  header: 'rollup header'
                }
              },
              single_workshop: {
                '1': {
                  response_count: 4,
                  averages: {
                    facilitator_rollup_q1: {
                      average: 4,
                      rows: {row1: 3, row2: 5}
                    }
                  }
                },
                '2': {
                  response_count: 4,
                  averages: {
                    facilitator_rollup_q1: {
                      average: 4,
                      rows: {row1: 3, row2: 5}
                    }
                  }
                }
              },
              overall_facilitator: {
                '1': {
                  response_count: 3,
                  averages: {
                    facilitator_rollup_q1: {
                      average: 4.2,
                      rows: {row1: 4.1, row2: 4.3}
                    }
                  }
                },
                '2': {
                  response_count: 5,
                  averages: {
                    facilitator_rollup_q1: {
                      average: 3,
                      rows: {row1: 2.5, row2: 3.5}
                    }
                  }
                }
              },
              overall: {
                response_count: 15,
                averages: {
                  facilitator_rollup_q1: {
                    average: 4.5,
                    rows: {row1: 4, row2: 5}
                  }
                }
              }
            }
          }}
          workshopTabs={['Day 0']}
        />
      </Provider>
    );
    // should have 3 tabs--Day 0 summary, workshop rollups and
    // facilitator rollups
    expect(results.find('Tab')).to.have.length(3);

    let summaryTab = results.find('Tab').first();
    let workshopRollupTab = results.find('Tab').at(1);
    let facilitatorRollupTab = results.find('Tab').at(2);

    // Check for expected # of question summaries per type
    let sectionResults = summaryTab.find('SectionResults');
    expect(sectionResults).to.have.length(2);
    let generalSectionResults = sectionResults.first();
    expect(
      generalSectionResults.find('SingleQuestionChoiceResponses')
    ).to.have.length(2);
    expect(generalSectionResults.find('TextResponses')).to.have.length(1);

    let generalMatrixResponses = generalSectionResults.find(
      'MatrixChoiceResponses'
    );
    expect(generalMatrixResponses).to.have.length(1);
    expect(
      generalMatrixResponses.first().find('ChoiceResponses')
    ).to.have.length(2);

    let facilitatorSectionResults = sectionResults.last();
    expect(
      facilitatorSectionResults.find('SingleQuestionChoiceResponses')
    ).to.have.length(2);
    expect(facilitatorSectionResults.find('TextResponses')).to.have.length(1);
    let facilitatorMatrixResponses = facilitatorSectionResults.find(
      'MatrixChoiceResponses'
    );
    expect(facilitatorMatrixResponses).to.have.length(1);
    expect(
      facilitatorMatrixResponses.first().find('ChoiceResponses')
    ).to.have.length(1);

    // Check that rollup tabs each have a rollup table
    expect(workshopRollupTab.find('SurveyRollupTableFoorm')).to.have.length(1);
    expect(facilitatorRollupTab.find('SurveyRollupTableFoorm')).to.have.length(
      1
    );
  });
});
