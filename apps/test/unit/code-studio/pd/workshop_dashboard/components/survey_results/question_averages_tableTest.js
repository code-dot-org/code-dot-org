import QuestionAveragesTable from '@cdo/apps/code-studio/pd/workshop_dashboard/components/survey_results/question_averages_table';
import React from 'react';
import {expect} from 'chai';
import {shallow} from 'enzyme';

describe("Question Averages Table", () => {
  const questions = [
    {text: 'Question 1', key: 'question_1', score_base: '5'},
    {text: 'Question 2', key: 'question_2', score_base: '5'}
  ];
  const allMyWorkshopsData = {'question_1': 5, 'question_2': 4};
  const allWorkshopsData = {'question_1': 4.1, 'question_2': 3.1};
  const facilitatorNames = ['Facilitator 1', 'Facilitator 2'];
  const workshopType = 'Workshop type';

  const assertRowEquals = (elements, values) => {
    expect(elements.map((element) => {
      return element.text();
    })).to.deep.equal(values);
  };

  it("Renders table for a single facilitator view", () => {
    const thisWorkshopData = {'question_1': 4.5, 'question_2': 3.2};

    const questionAveragesTable = shallow(
      <QuestionAveragesTable
        questions={questions}
        thisWorkshopData={thisWorkshopData}
        allMyWorkshopsData={allMyWorkshopsData}
        allWorkshopsData={allWorkshopsData}
        facilitatorNames={facilitatorNames}
        facilitatorBreakdown={false}
        workshopType={workshopType}
      />
    );

    assertRowEquals(questionAveragesTable.find('th'),
      ['', 'This workshop', 'All my Workshop type', 'All workshops']);
    assertRowEquals(questionAveragesTable.find('tbody tr').at(0).find('td'),
      ['Question 1', '4.5 / 5', '5 / 5', '4.1 / 5']);
    assertRowEquals(questionAveragesTable.find('tbody tr').at(1).find('td'),
      ['Question 2', '3.2 / 5', '4 / 5', '3.1 / 5']);
    expect(questionAveragesTable.find('tbody tr').length).to.equal(2);
  });

  it("Renders table for multiple facilitator view", () => {
    const thisWorkshopData = {
      'question_1': {
        'Facilitator 1': 2, 'Facilitator 2': 2.5
      },
      'question_2': 4.9,
    };

    const questionAveragesTable = shallow(
      <QuestionAveragesTable
        questions={questions}
        thisWorkshopData={thisWorkshopData}
        allMyWorkshopsData={allMyWorkshopsData}
        allWorkshopsData={allWorkshopsData}
        facilitatorNames={facilitatorNames}
        facilitatorBreakdown={true}
        workshopType={workshopType}
      />
    );

    assertRowEquals(questionAveragesTable.find('th'),
      ['', 'This workshop', 'Facilitator 1', 'Facilitator 2', 'All my Workshop type', 'All workshops']);
    assertRowEquals(questionAveragesTable.find('tbody tr').at(0).find('td'),
      ['Question 1', '', '2 / 5', '2.5 / 5', '5 / 5', '4.1 / 5']);
    assertRowEquals(questionAveragesTable.find('tbody tr').at(1).find('td'),
      ['Question 2', '4.9 / 5', '', '', '4 / 5', '3.1 / 5']);
    expect(questionAveragesTable.find('tbody tr').length).to.equal(2);
  });
});
