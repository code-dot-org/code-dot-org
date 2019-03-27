import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import {UnconnectedTopInstructionsCSP as TopInstructionsCSP} from '@cdo/apps/templates/instructions/TopInstructionsCSP';
//import {stubRedux, restoreRedux, getStore} from '@cdo/apps/redux';
//import {Provider} from 'react-redux';

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
  describe('Feedback Tab', () => {
    it('While giving feedback I switch to the instructions tab and back', () => {
      /* const wrapper = shallow(<TopInstructionsCSP {...DEFAULT_PROPS} />);

      wrapper.setState({
        tabSelected: 'comments',
        feedbacks: [],
        rubric: null,
        displayFeedbackTeacherFacing: true
      });

      const instructionsTab = wrapper.find('.uitest-instructionsTab').at(0);
      instructionsTab.simulate('click');
      expect(
        wrapper.find('TeacherFeedback').props().visible
      ).to.equal(false);

      const feedbackTab = wrapper.find('.uitest-feedback').at(0);
      feedbackTab.simulate('click');
      expect(
        wrapper.find('TeacherFeedback').props().visible
      ).to.equal(true);
      */
    });
    it('height of instructions area is full size needed for content when feedback tab opened', () => {
      /*
      stubRedux();
      const store = getStore();
      const wrapper = mount(
        <Provider store={store}>
          <TopInstructionsCSP {...DEFAULT_PROPS} />
        </Provider>
      );

      wrapper.setState({
        tabSelected:'comments',
        feedbacks: [],
        rubric: null,
        displayFeedbackTeacherFacing: false
      });

      expect(wrapper.props().height).to.equal(wrapper.props().maxHeight);
      restoreRedux();*/
    });
    describe('Teachers', () => {
      it('No Rubric - Viewing Level - Teacher Can Not See Feedback Tab', () => {
        const wrapper = shallow(<TopInstructionsCSP {...DEFAULT_PROPS} />);

        wrapper.setState({
          tabSelected: 'instructions',
          feedbacks: [],
          rubric: null,
          displayFeedbackTeacherFacing: false
        });

        expect(wrapper.find('.uitest-feedback')).to.have.lengthOf(0);
      });
      it('Rubric - Viewing Level - Teacher Can See Feedback Tab', () => {
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
    describe('Students', () => {
      it('teacher has given feedback', () => {
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
      it('teacher has not given feedback', () => {
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
