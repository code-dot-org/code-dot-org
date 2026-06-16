import {render, screen, fireEvent} from '@testing-library/react';
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import EvidenceLevelsForTeachersV2 from '@cdo/apps/templates/rubrics/EvidenceLevelsForTeachersV2';
import {
  UNDERSTANDING_LEVEL_STRINGS_V2,
  UNDERSTANDING_LEVEL_STRINGS,
} from '@cdo/apps/templates/rubrics/rubricHelpers';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

const DEFAULT_PROPS = {
  isAiAssessed: false,
  evidenceLevels: [
    {id: 1, understanding: 0, teacherDescription: 'test1'},
    {id: 2, understanding: 1, teacherDescription: 'test2'},
    {id: 3, understanding: 2, teacherDescription: 'test3'},
    {id: 4, understanding: 3, teacherDescription: 'test4'},
  ],
  learningGoalKey: 'key-1',
  arrowPositionCallback: _ => {},
};

describe('EvidenceLevelsForTeachersV2', () => {
  it('renders evidence levels', () => {
    render(
      <EvidenceLevelsForTeachersV2
        {...DEFAULT_PROPS}
        canProvideFeedback={true}
      />
    );
    screen.getByText('Assign a Rubric Score');
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).to.equal(DEFAULT_PROPS.evidenceLevels.length);
    const firstEvidenceLevel = DEFAULT_PROPS.evidenceLevels[0];
    expect(buttons[0].textContent).to.equal(
      UNDERSTANDING_LEVEL_STRINGS_V2[firstEvidenceLevel.understanding]
    );
  });

  it('calls radioButtonCallback when understanding is selected', () => {
    const callback = sinon.spy();
    render(
      <EvidenceLevelsForTeachersV2
        {...DEFAULT_PROPS}
        radioButtonCallback={callback}
        canProvideFeedback={true}
      />
    );
    const firstEvidenceLevel = DEFAULT_PROPS.evidenceLevels[0];
    fireEvent.click(
      screen.getByRole('button', {
        name: UNDERSTANDING_LEVEL_STRINGS_V2[firstEvidenceLevel.understanding],
      })
    );
    sinon.assert.calledOnce(callback);
    expect(callback).to.have.been.calledWith(firstEvidenceLevel.understanding);
  });

  it('renders evidence levels without RadioButtons when the teacher cannot provide feedback', () => {
    render(<EvidenceLevelsForTeachersV2 {...DEFAULT_PROPS} />);
    screen.getByText('Rubric Scores');
    const firstEvidenceLevel = DEFAULT_PROPS.evidenceLevels[0];
    screen.getByText(
      UNDERSTANDING_LEVEL_STRINGS[firstEvidenceLevel.understanding]
    );
    screen.getByText(firstEvidenceLevel.teacherDescription);
  });
});
