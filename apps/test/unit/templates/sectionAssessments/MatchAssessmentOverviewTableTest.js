import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {UnconnectedMatchAssessmentsOverviewTable} from '@cdo/apps/templates/sectionAssessments/MatchAssessmentsOverviewTable';
import {matchQuestionWith4Pairs} from '@cdo/apps/templates/sectionAssessments/assessmentsTestHelpers';

describe('MatchAssessmentsOverviewTable', () => {
  it('renders the correct number of cells', () => {
    const wrapper = mount(
      <UnconnectedMatchAssessmentsOverviewTable
        questionAnswerData={matchQuestionWith4Pairs}
        openDialog={() => {}}
        setQuestionIndex={() => {}}
      />
    );

    const answerCells = wrapper.find('PercentAnsweredCell');
    expect(answerCells).to.have.length(20);

    const tableHeaders = wrapper.find('th');
    expect(tableHeaders).to.have.length(6);

    const tableRows = wrapper.find('tr');
    expect(tableRows).to.have.length(5);
  });
});
