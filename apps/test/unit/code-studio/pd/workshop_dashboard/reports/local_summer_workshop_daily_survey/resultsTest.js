import {expect} from 'chai';
import Results from '@cdo/apps/code-studio/pd/workshop_dashboard/reports/local_summer_workshop_daily_survey/results';
import {shallow} from 'enzyme';
import React from 'react';

describe("Local Summer Workshop Daily Survey Results class", () => {
  it("Renders expected number of sessions, questions, and free responses", () => {
    const results = shallow(
      <Results
        questions={{
            'day_1': {
              'q1': {text: 'Day 1, Question 1'},
              'q2': {text: 'Day 1, Question 2'},
              'q3': {text: 'Day 1, Question 3'},
              'f1': {text: 'Day 1, Free Response 1', free_response: true},
              'f2': {text: 'Day 1, Free Response 2', free_response: true}
            },
            'day_2': {
              'q4': {text: 'Day 2, Question 1'},
              'q5': {text: 'Day 2, Question 2'},
              'f3': {text: 'Day 2, Free Response 1', free_response: true}
            }
        }}
        thisWorkshop={{
          'day_1': {
            'q1': 3.5,
            'q2': 3.6,
            'q3': 3.7,
            'f1': ['a', 'b', 'c'],
            'f2': ['d', 'e', 'f']
          },
          'day_2': {
            'q4': 3.8,
            'q5': 3.9,
            'f3': ['g', 'h', 'i']
          }
        }}
        allMyWorkshops={{
          'day_1': {
            'q1': 2.5,
            'q2': 2.6,
            'q3': 2.7,
            'f1': ['Should not render']
          },
          'day_2': {
            'q4': 2.8,
            'q5': 2.9
          }
        }}
        sessions={['day_1', 'day_2']}
      />
    );

    expect(results.find('table')).to.have.length(2); // Session sections
    expect(results.find('td').map((x) => x.text())).to.deep.equal(
      [
        'Day 1, Question 1', '3.5', '2.5',
        'Day 1, Question 2', '3.6', '2.6',
        'Day 1, Question 3', '3.7', '2.7',
        'Day 2, Question 1', '3.8', '2.8',
        'Day 2, Question 2', '3.9', '2.9'
      ]
    );
    expect(results.find('.well')).to.have.length(3);
    expect(results.find('li').map((x) => x.text())).to.deep.equal('abcdefghi'.split(''));
  });
});
