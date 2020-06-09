import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {UnconnectedTopInstructions as TopInstructions} from '@cdo/apps/templates/instructions/TopInstructions';

const DEFAULT_PROPS = {
  isEmbedView: false,
  hasContainedLevels: false,
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
  user: 5,
  teacherMarkdown: 'Some teacher only markdown',
  noInstructionsWhenCollapsed: true,
  shortInstructions: '',
  hidden: false,
  isMinecraft: false,
  isRtl: false
};

describe('TopInstructions', () => {
  it('is an empty div if passed the "hidden" property', () => {
    const wrapper = shallow(
      <TopInstructions {...DEFAULT_PROPS} hidden={true} />
    );
    expect(wrapper.find('div')).to.have.lengthOf(1);
  });

  it('is an empty div if there are no instructions to display', () => {
    const wrapper = shallow(
      <TopInstructions
        {...DEFAULT_PROPS}
        shortInstructions={null}
        longInstructions={null}
        hasContainedLevels={false}
      />
    );
    expect(wrapper.find('div')).to.have.lengthOf(1);
  });

  describe('viewing the Feedback Tab', () => {
    describe('as a teacher', () => {
      it('does not show the feedback tab on a level with no rubric where the teacher is not giving feedback', () => {
        const wrapper = shallow(<TopInstructions {...DEFAULT_PROPS} />);

        wrapper.setState({
          tabSelected: 'instructions',
          feedbacks: [],
          rubric: null,
          teacherViewingStudentWork: false,
          studentId: null,
          fetchingData: false,
          token: null
        });

        expect(wrapper.find('.uitest-feedback')).to.have.lengthOf(0);
      });

      it('shows the feedback tab on a level with a rubric where the teacher is not giving feedback', () => {
        const wrapper = shallow(<TopInstructions {...DEFAULT_PROPS} />);

        wrapper.setState({
          tabSelected: 'instructions',
          feedbacks: [],
          rubric: {
            keyConcept: 'This is the key concept',
            performanceLevel1: 'Includes more than needed',
            performanceLevel2: 'Includes exactly all needed elements',
            performanceLevel3: 'Has some of the needed elements',
            performanceLevel4: 'No work done'
          },
          teacherViewingStudentWork: false,
          studentId: null,
          fetchingData: false,
          token: null
        });

        expect(wrapper.find('.uitest-feedback')).to.have.lengthOf(1);
      });
    });

    describe('as a student', () => {
      it('shows the feedback tab on a level where the teacher has given feedback', () => {
        const wrapper = shallow(
          <TopInstructions {...DEFAULT_PROPS} viewAs={'Student'} />
        );

        wrapper.setState({
          tabSelected: 'instructions',
          feedbacks: [
            {
              comment: 'Good work!',
              created_at: '2019-03-26T19:56:53.000Z',
              id: 5,
              level_id: 123,
              performance: 'performanceLevel2',
              student_id: 1,
              teacher_name: 'Tim The Teacher'
            }
          ],
          rubric: {
            keyConcept: 'This is the key concept',
            performanceLevel1: 'Includes more than needed',
            performanceLevel2: 'Includes exactly all needed elements',
            performanceLevel3: 'Has some of the needed elements',
            performanceLevel4: 'No work done'
          },
          teacherViewingStudentWork: false,
          studentId: 1,
          fetchingData: false,
          token: null
        });

        expect(wrapper.find('.uitest-feedback')).to.have.lengthOf(1);
      });

      it('does not show the feedback tab on a level where the teacher has not given feedback and there is no rubric', () => {
        const wrapper = shallow(
          <TopInstructions {...DEFAULT_PROPS} viewAs={'Student'} />
        );

        wrapper.setState({
          tabSelected: 'instructions',
          feedbacks: [],
          rubric: null,
          teacherViewingStudentWork: false,
          studentId: 1,
          fetchingData: false,
          token: null
        });

        expect(wrapper.find('.uitest-feedback')).to.have.lengthOf(0);
      });
    });
  });
  describe('viewing the Teacher Instructions Tab', () => {
    describe('as a teacher', () => {
      it('does not show the Teacher Instructions tab on a level with no markdown', () => {
        const wrapper = shallow(
          <TopInstructions {...DEFAULT_PROPS} teacherMarkdown={null} />
        );

        wrapper.setState({
          tabSelected: 'instructions',
          feedbacks: [],
          rubric: null,
          teacherViewingStudentWork: false,
          studentId: null,
          fetchingData: false,
          token: null
        });

        expect(wrapper.find('.uitest-teacherOnlyTab')).to.have.lengthOf(0);
      });

      it('shows the Teacher Instructions on a level with markdown', () => {
        const wrapper = shallow(<TopInstructions {...DEFAULT_PROPS} />);

        wrapper.setState({
          tabSelected: 'instructions',
          feedbacks: [],
          rubric: null,
          teacherViewingStudentWork: false,
          studentId: null,
          fetchingData: false,
          token: null
        });

        expect(wrapper.find('.uitest-teacherOnlyTab')).to.have.lengthOf(1);
      });
    });

    describe('as a student', () => {
      it('does not show the Teacher Instructions tab', () => {
        const wrapper = shallow(
          <TopInstructions
            {...DEFAULT_PROPS}
            viewAs={'Student'}
            teacherMarkdown={null}
          />
        );

        wrapper.setState({
          tabSelected: 'instructions',
          feedbacks: [],
          rubric: null,
          teacherViewingStudentWork: false,
          studentId: 1,
          fetchingData: false,
          token: null
        });

        expect(wrapper.find('.uitest-teacherOnlyTab')).to.have.lengthOf(0);
      });
    });
  });
});
