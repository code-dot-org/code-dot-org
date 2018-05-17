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
                'q2': {text: 'Matrix 1', answer_type: 'selectValue'},
                'q3': {text: 'Matrix 2', answer_type: 'selectValue'},
                'q4': {text: 'Scale 1', answer_type: 'selectValue'},
                'f1': {text: 'Day 1, Free Response 1', answer_type: 'text'},
                'f2': {text: 'Day 1, Free Response 2', answer_type: 'text'}
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
            }
          }
        }}
        sessions={['Pre Workshop']}
        facilitators={{
          1: 'Facilitator 1',
          2: 'Facilitator 2'
        }}
      />
    );
    expect(results.find('Tab')).to.have.length(1);
    expect(results.find('table')).to.have.length(1);
    expect(results.find('td').map((x) => x.text())).to.deep.equal(
      [
        'Matrix header', '-',
        'Matrix 1', '3.86',
        'Matrix 2', '2.33',
        'Scale 1', '3.6',
      ]
    );
    expect(results.find('.well')).to.have.length(2); // 2 general responses
    expect(results.find('.well li').map((x) => x.text())).to.deep.equal('abcdef'.split(''));
  });
});
