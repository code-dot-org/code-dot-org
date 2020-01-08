import {expect} from 'chai';
import Results from '@cdo/apps/code-studio/pd/workshop_dashboard/reports/local_summer_workshop_daily_survey/results';
import {mount} from 'enzyme';
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

describe('Local Summer Workshop Daily Survey Results class', () => {
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
            'Pre Workshop': {
              general: {
                q1: {text: 'Matrix header', answer_type: 'none'},
                q2: {
                  text: 'Matrix header...Matrix 1',
                  answer_type: 'singleSelect',
                  options: ['Poor', 'Fair', 'Good', 'Great', 'Excellent']
                },
                q3: {
                  text: 'Matrix header...Matrix 2',
                  answer_type: 'singleSelect',
                  options: ['Poor', 'Fair', 'Good', 'Great', 'Excellent']
                },
                q4: {
                  text: 'Scale 1',
                  answer_type: 'scale',
                  max_value: '5',
                  options: ['1', '2', '3', '4', '5']
                },
                f1: {text: 'General, Free Response 1', answer_type: 'text'},
                f2: {text: 'General, Free Response 2', answer_type: 'text'}
              }
            },
            'Day 1': {
              general: {
                q1: {text: 'Day 1 Matrix header', answer_type: 'none'},
                q2: {
                  text: 'Day 1 Matrix...Matrix 1',
                  answer_type: 'singleSelect',
                  options: ['Poor', 'Fair', 'Good', 'Great', 'Excellent']
                },
                q3: {
                  text: 'Scale 2',
                  answer_type: 'scale',
                  max_value: '5',
                  options: ['1', '2', '3', '4', '5']
                },
                f1: {text: 'Day 1, Free Response 1', answer_type: 'text'}
              },
              facilitator: {
                q1: {text: 'Day 1 Facilitator question 1', answer_type: 'text'},
                q2: {text: 'Day 1 Facilitator question 2', answer_type: 'text'}
              }
            }
          }}
          thisWorkshop={{
            'Pre Workshop': {
              general: {
                q1: {},
                q2: {1: 2, 5: 5},
                q3: {1: 1, 2: 2, 3: 3},
                q4: {3: 3, 4: 1, 5: 1},
                f1: ['a', 'b', 'c'],
                f2: ['d', 'e', 'f']
              },
              response_count: 10
            },
            'Day 1': {
              general: {
                q1: {},
                q2: {1: 2, 4: 5},
                q3: {2: 3, 3: 3, 4: 1},
                f1: ['g', 'h', 'i']
              },
              facilitator: {
                q1: {
                  1: ['j', 'k', 'l'],
                  2: ['m', 'n', 'o']
                },
                q2: {
                  1: ['p', 'q', 'r'],
                  2: ['s', 't', 'u']
                }
              },
              response_count: 12
            }
          }}
          sessions={['Pre Workshop', 'Day 1']}
          courseName="Course Name"
          workshopRollups={{
            rollups: {
              this_ws: {
                workshop_id: 1,
                response_count: 1,
                averages: {overall_success_0: 7, overall_success: 7}
              }
            },
            questions: {
              overall_success_0: 'I feel more prepared to teach'
            },
            facilitators: {
              '1': 'Facilitator Person 1'
            }
          }}
          facilitatorRollups={{
            rollups: {
              facilitator_1_single_ws: {
                facilitator_id: 1,
                workshop_id: 1,
                response_count: 1,
                averages: {
                  facilitator_effectiveness_0: 7,
                  facilitator_effectiveness: 7
                }
              }
            },
            questions: {
              facilitator_effectiveness_0:
                'Demonstrated knowledge of the curriculum.'
            },
            facilitators: {
              '1': 'Facilitator Person 1'
            }
          }}
        />
      </Provider>
    );
    expect(results.find('Tab')).to.have.length(4);
    let firstTab = results.find('Tab').first();
    let secondTab = results.find('Tab').at(1);

    expect(firstTab.find('ChoiceResponses')).to.have.length(3);
    expect(firstTab.find('TextResponses')).to.have.length(2);

    expect(secondTab.find('ChoiceResponses')).to.have.length(2);
    expect(secondTab.find('TextResponses')).to.have.length(3);

    expect(firstTab.find('h3').map(x => x.text())).to.deep.equal([
      'General Questions'
    ]);
    expect(secondTab.find('h3').map(x => x.text())).to.deep.equal([
      'General Questions',
      'Facilitator Specific Questions'
    ]);

    expect(
      results
        .find('Tab')
        .at(2)
        .find('SurveyRollupTable')
    ).to.have.length(1);
    expect(
      results
        .find('Tab')
        .at(3)
        .find('SurveyRollupTable')
    ).to.have.length(1);
  });
});
