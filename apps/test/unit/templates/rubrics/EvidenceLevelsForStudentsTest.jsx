import React from 'react';
import {expect} from '../../../util/reconfiguredChai';
import {shallow} from 'enzyme';
import EvidenceLevelsForStudents from '@cdo/apps/templates/rubrics/EvidenceLevelsForStudents';
import {UNDERSTANDING_LEVEL_STRINGS} from '@cdo/apps/templates/rubrics/rubricHelpers';

const DEFAULT_PROPS = {
  evidenceLevels: [
    {id: 1, understanding: 0, teacherDescription: 'test1'},
    {id: 2, understanding: 1, teacherDescription: 'test2'},
  ],
};

describe('EvidenceLevelsForStudents', () => {
  it('renders evidence levels', () => {
    const wrapper = shallow(<EvidenceLevelsForStudents {...DEFAULT_PROPS} />);
    expect(wrapper.find('Heading6').length).to.equal(1);
    expect(wrapper.find('Heading6').props().children).to.equal('Rubric Scores');
    expect(wrapper.find('Memo(RadioButton)').length).to.equal(0);
    // Two BodyThreeText per evidence level
    expect(wrapper.find('BodyThreeText').length).to.equal(
      DEFAULT_PROPS.evidenceLevels.length * 2
    );
    const firstEvidenceLevel = DEFAULT_PROPS.evidenceLevels[0];
    expect(wrapper.find('StrongText').at(0).props().children).to.equal(
      UNDERSTANDING_LEVEL_STRINGS[firstEvidenceLevel.understanding]
    );
    expect(wrapper.find('BodyThreeText').at(1).props().children).to.equal(
      firstEvidenceLevel.teacherDescription
    );
  });
});
