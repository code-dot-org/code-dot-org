import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {UnconnectedTopInstructionsCSP as TopInstructionsCSP} from '@cdo/apps/templates/instructions/TopInstructionsCSP';

const DEFAULT_PROPS = {
  isEmbedView: false,
  hasContainedLevels: false,
  puzzleNumber: 2,
  stageTotal: 0,
  height: 200,
  expandedHeight: 300,
  maxHeight: 300,
  longInstructions: 'Some instructions for the level',
  collapsed: false,
  noVisualization: false,
  toggleInstructionsCollapsed: () => {},
  setInstructionsHeight: () => {},
  setInstructionsRenderedHeight: () => {},
  setInstructionsMaxHeightNeeded: () => {},
  viewAs: 'Teacher',
  readOnlyWorkspace: false,
  serverLevelId: 123,
  user: 5
};

describe('TopInstructionsCSP', () => {
  describe('viewing the Feedback Tab', () => {
    describe('as a teacher', () => {
      it('does not show the feedback tab on a level with no rubric where the teacher is not giving feedback', () => {
        const wrapper = shallow(<TopInstructionsCSP {...DEFAULT_PROPS} />);

        wrapper.setState({
          tabSelected: 'instructions',
          feedbacks: [],
          rubric: null,
          displayFeedbackTeacherFacing: false
        });

        expect(wrapper.find('.uitest-feedback')).to.have.lengthOf(0);
      });

      it('shows the feedback tab on a level with a rubric where the teacher is not giving feedback', () => {
        const wrapper = shallow(<TopInstructionsCSP {...DEFAULT_PROPS} />);

        wrapper.setState({
          tabSelected: 'instructions',
          feedbacks: [],
          rubric: {
            keyConcept: 'This is the key concept',
            exceeds: 'Includes more than needed',
            meets: 'Includes exactly all needed elements',
            approaches: 'Has some of the needed elements',
            noEvidence: 'No work done'
          },
          displayFeedbackTeacherFacing: false
        });

        expect(wrapper.find('.uitest-feedback')).to.have.lengthOf(1);
      });
    });

    describe('as a student', () => {
      it('shows the feedback tab on a level where the teacher has given feedback', () => {
        const wrapper = shallow(
          <TopInstructionsCSP {...DEFAULT_PROPS} viewAs={'Student'} />
        );

        wrapper.setState({
          tabSelected: 'instructions',
          feedbacks: [
            {
              comment: 'Good work!',
              created_at: '2019-03-26T19:56:53.000Z',
              id: 5,
              level_id: 123,
              performance: 'meets',
              student_id: 1,
              teacher_name: 'Tim The Teacher'
            }
          ],
          rubric: null,
          displayFeedbackTeacherFacing: false
        });

        expect(wrapper.find('.uitest-feedback')).to.have.lengthOf(1);
      });

      it('does not show the feedback tab on a level where the teacher has not given feedback', () => {
        const wrapper = shallow(
          <TopInstructionsCSP {...DEFAULT_PROPS} viewAs={'Student'} />
        );

        wrapper.setState({
          tabSelected: 'instructions',
          feedbacks: [],
          rubric: null,
          displayFeedbackTeacherFacing: false
        });

        expect(wrapper.find('.uitest-feedback')).to.have.lengthOf(0);
      });
    });
  });
});
