import {expect} from 'chai';
import Results from '@cdo/apps/code-studio/pd/workshop_dashboard/reports/local_summer_workshop_daily_survey/results';
import {mount} from 'enzyme';
import React from 'react';

describe("Local Summer Workshop Daily Survey Results class", () => {
  it("Renders expected number of sessions, questions, and free responses", () => {
    const results = mount(
      <Results
        questions={{
            'Pre Workshop': {
              'general': {
                'q1': {text: 'Matrix header', answer_type: 'none'},
                'q2': {text: 'Matrix header...Matrix 1', answer_type: 'singleSelect', options: ['Poor', 'Fair', 'Good', 'Great', 'Excellent']},
                'q3': {text: 'Matrix header...Matrix 2', answer_type: 'singleSelect', options: ['Poor', 'Fair', 'Good', 'Great', 'Excellent']},
                'q4': {text: 'Scale 1', answer_type: 'scale', max_value: '5', options: ['1', '2', '3', '4', '5']},
                'f1': {text: 'General, Free Response 1', answer_type: 'text'},
                'f2': {text: 'General, Free Response 2', answer_type: 'text'}
              }
            },
            'Day 1': {
              'general': {
                'q1': {text: 'Day 1 Matrix header', answer_type: 'none'},
                'q2': {text: 'Day 1 Matrix...Matrix 1', answer_type: 'singleSelect', options: ['Poor', 'Fair', 'Good', 'Great', 'Excellent']},
                'q3': {text: 'Scale 2', answer_type: 'scale', max_value: '5', options: ['1', '2', '3', '4', '5']},
                'f1': {text: 'Day 1, Free Response 1', answer_type: 'text'},
              },
              'facilitator': {
                'q1': {text: 'Day 1 Facilitator question 1', answer_type: 'text'},
                'q2': {text: 'Day 1 Facilitator question 2', answer_type: 'text'}
              }
            }
        }}
        thisWorkshop={{
          'Pre Workshop': {
            'general': {
              'q1': {},
              'q2': {1: 2, 5: 5},
              'q3': {1: 1, 2: 2, 3: 3},
              'q4': {3: 3, 4: 1, 5: 1},
              'f1': ['a', 'b', 'c'],
              'f2': ['d', 'e', 'f']
            },
            'response_count': 10
          },
          'Day 1': {
            'general': {
              'q1': {},
              'q2': {1: 2, 4: 5},
              'q3': {2: 3, 3: 3, 4: 1},
              'f1': ['g', 'h', 'i']
            },
            'facilitator': {
              'q1': {
                1: ['j', 'k', 'l'],
                2: ['m', 'n', 'o']
              },
              'q2': {
                1: ['p', 'q', 'r'],
                2: ['s', 't', 'u']
              }
            },
            response_count: 12
          }
        }}
        sessions={['Pre Workshop', 'Day 1']}
        facilitators={{
          1: 'Facilitator 1',
          2: 'Facilitator 2'
        }}
        facilitatorAverages={{
          'Facilitator 1': {
            'q1': {
              this_workshop: 4.5,
              all_my_workshops: 4.0,
            }
          },
          'Facilitator 2': {
            'q1': {
              this_workshop: 1.5,
              all_my_workshops: 2.0,
            }
          },
          questions: {
            'q1': 'Question 1'
          }
        }}
        facilitatorResponseCounts={{
          all_my_workshops: {
            1: 40,
            2: 50
          },
          this_workshop: {
            1: 10,
            2: 8
          }
        }}
        courseName="Course Name"
      />
    );
    expect(results.find('Tab')).to.have.length(4);
    let firstTab = results.find('Tab').first();
    let secondTab = results.find('Tab').at(1);

    expect(firstTab.find('SingleChoiceResponses')).to.have.length(3);
    expect(firstTab.find('TextResponses')).to.have.length(2);

    expect(secondTab.find('SingleChoiceResponses')).to.have.length(2);
    expect(secondTab.find('TextResponses')).to.have.length(3);

    expect(firstTab.find('h3').map((x) => x.text())).to.deep.equal(['General Questions']);
    expect(secondTab.find('h3').map((x) => x.text())).to.deep.equal(['General Questions', 'Facilitator Specific Questions']);

    expect(results.find('Tab').at(2).find('FacilitatorAveragesTable')).to.have.length(1);
    expect(results.find('Tab').at(3).find('FacilitatorAveragesTable')).to.have.length(1);
  });
});
