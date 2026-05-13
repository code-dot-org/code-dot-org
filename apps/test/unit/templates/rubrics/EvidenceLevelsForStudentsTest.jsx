import {Typography} from '@mui/material';
import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

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
    const header = wrapper.find(Typography).at(0);
    expect(header.props().variant).toBe('h6');
    expect(header.props().children).toBe('Rubric Scores');

    const body3Nodes = wrapper
      .find(Typography)
      .filterWhere(node => node.props().variant === 'body3');
    // Two body3 Typography per evidence level
    expect(body3Nodes.length).toBe(DEFAULT_PROPS.evidenceLevels.length * 2);

    const firstEvidenceLevel = DEFAULT_PROPS.evidenceLevels[0];
    expect(body3Nodes.at(0).props().children.props.children).toBe(
      UNDERSTANDING_LEVEL_STRINGS[firstEvidenceLevel.understanding]
    );
    expect(body3Nodes.at(1).props().children).toBe(
      firstEvidenceLevel.teacherDescription
    );
  });
});
