import {expect} from 'chai';
import Results from '@cdo/apps/code-studio/pd/workshop_dashboard/reports/local_summer_workshop_daily_survey/results';
import {shallow} from 'enzyme';
import React from 'react';

describe("Local Summer Workshop Daily Survey Results class", () => {
  it("Renders expected number of sessions, questions, and free responses", () => {
    const results = shallow(
      <Results
        questions={{
          'q1': {text: 'Question 1'},
          'q2': {text: 'Question 2'},
          'q3': {text: 'Question 3'},
          'f1': {text: 'Free Response 1', free_response: true},
          'f2': {text: 'Free Response 2', free_response: true}
        }}
        thisWorkshop={{
          'Day 1': {
            'q1': 3.5,
            'q2': 3.6,
            'q3': 3.7,
            'f1': ['a', 'b', 'c'],
            'f2': ['d', 'e', 'f']
          },
          'Day 2': {
            'q1': 3.5,
            'q2': 3.6,
            'q3': 3.7,
            'f1': ['a', 'b', 'c'],
            'f2': ['d', 'e', 'f']
          }
        }}
        allMyWorkshops={{
          'Day 1': {
            'q1': 2.5,
            'q2': 2.6,
            'q3': 2.7,
          },
          'Day 2': {
            'q1': 2.5,
            'q2': 2.6,
            'q3': 2.7,
          }
        }}
        sessions={['Day 1', 'Day 2']}
      />
    );

    expect(results.find('table')).to.have.length(2); // Session sections
    expect(results.find('table tbody tr')).to.have.length(6); // Question tables
    expect(results.find('.well')).to.have.length(4); // Free response sections
    expect(results.find('.well li')).to.have.length(12); // Free responses
  });
});
