import {expect} from 'chai';
import Results from '@cdo/apps/code-studio/pd/workshop_dashboard/reports/local_summer_workshop_daily_survey/results';
import {mount} from 'enzyme';
import React from 'react';

describe("Local Summer Workshop Daily Survey Results class", () => {
  it("Renders expected number of sessions, questions, and free responses", () => {
    const results = mount(
      <Results
        questions={{
            'day_1': {
              'general': {
                'q1': {text: 'Day 1, Question 1'},
                'q2': {text: 'Day 1, Question 2'},
                'q3': {text: 'Day 1, Question 3'},
                'f1': {text: 'Day 1, Free Response 1', free_response: true},
                'f2': {text: 'Day 1, Free Response 2', free_response: true}
              }
            },
            'day_2': {
              'general': {
                'q4': {text: 'Day 2, Question 1'},
                'q5': {text: 'Day 2, Question 2'},
                'f3': {text: 'Day 2, Free Response 1', free_response: true}
              },
              'facilitator': {
                'f_q1': {text: 'Facilitator specific question 1'},
                'f_f1': {text: 'Facilitator specific free response question 1', free_response: true}
              }
            }
        }}
        thisWorkshop={{
          'day_1': {
            'general': {
              'q1': 3.5,
              'q2': 3.6,
              'q3': 3.7,
              'f1': ['a', 'b', 'c'],
              'f2': ['d', 'e', 'f']
            }
          },
          'day_2': {
            'general': {
              'q4': 3.8,
              'q5': 3.9,
              'f3': ['g', 'h', 'i']
            },
            'facilitator': {
              'f_q1': {
                '1': 1.5,
                '2': 1.6
              },
              'f_f1': {
                '1': ['j', 'k'],
                '2': ['l', 'm']
              }
            }
          }
        }}
        sessions={['day_1', 'day_2']}
        facilitators={{
          1: 'Facilitator 1',
          2: 'Facilitator 2'
        }}
      />
    );
    expect(results.find('Tab')).to.have.length(2);
    expect(results.find('table')).to.have.length(3); // 2 general tables + 1 facilitator specific
    expect(results.find('th').map((x) => x.text())).to.deep.equal(
      [
        '', 'This workshop','', 'This workshop',
        '', 'Facilitator 1', 'Facilitator 2'
      ]
    );
    expect(results.find('td').map((x) => x.text())).to.deep.equal(
      [
        'Day 1, Question 1', '3.5',
        'Day 1, Question 2', '3.6',
        'Day 1, Question 3', '3.7',
        'Day 2, Question 1', '3.8',
        'Day 2, Question 2', '3.9',
        'Facilitator specific question 1', '1.5', '1.6'
      ]
    );
    expect(results.find('.well')).to.have.length(4); // 3 general responses + 1 facilitator response
    expect(results.find('.well li').map((x) => x.text())).to.deep.equal('abcdefghi'.split('')
      .concat(['Facilitator 1jk', 'j', 'k', 'Facilitator 2lm', 'l', 'm']));
  });
});
