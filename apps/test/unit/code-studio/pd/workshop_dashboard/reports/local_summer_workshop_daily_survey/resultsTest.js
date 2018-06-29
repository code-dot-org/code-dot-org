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
                'q3': {text: 'Day 1 Matrix...Matrix 2', answer_type: 'singleSelect', options: ['Poor', 'Fair', 'Good', 'Great', 'Excellent']},
                'q4': {text: 'Scale 2', answer_type: 'scale', max_value: '5', options: ['1', '2', '3', '4', '5']},
                'f1': {text: 'Day 1, Free Response 1', answer_type: 'text'},
                'f2': {text: 'Day 1, Free Response 2', answer_type: 'text'}
              },
              'facilitator': {
                'q1': {text: 'Day 1 Facilitator question', answer_type: 'text'}
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

            },
            'facilitator': {

            },
            response_count: 12
          }
        }}
        sessions={['Pre Workshop', 'Day 1']}
        facilitators={{
          1: 'Facilitator 1',
          2: 'Facilitator 2'
        }}
      />
    );
    expect(results.find('Tab')).to.have.length(2);
    //expect(results.find('Tab').at(0).find('SingleChoiceResponse')).to.have.length(2);
  });
});
