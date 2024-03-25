import {shallow} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import sinon from 'sinon';

import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {
  UnconnectedTopInstructions as TopInstructions,
  TabType,
} from '@cdo/apps/templates/instructions/TopInstructions';
import * as TopInstructionsDataApi from '@cdo/apps/templates/instructions/topInstructionsDataApi';
import TopInstructionsHeader from '@cdo/apps/templates/instructions/TopInstructionsHeader';

import {expect} from '../../../util/reconfiguredChai';

const DEFAULT_PROPS = {
  isEmbedView: false,
  hasContainedLevels: false,
  height: 200,
  expandedHeight: 300,
  maxHeight: 300,
  longInstructions: 'Some instructions for the level',
  isCollapsed: false,
  noVisualization: false,
  toggleInstructionsCollapsed: () => {},
  setInstructionsHeight: () => {},
  setInstructionsRenderedHeight: () => {},
  setInstructionsMaxHeightNeeded: () => {},
  viewAs: ViewType.Instructor,
  readOnlyWorkspace: false,
  serverLevelId: 123,
  user: 5,
  teacherMarkdown: 'Some teacher only markdown',
  noInstructionsWhenCollapsed: true,
  shortInstructions: '',
  hidden: false,
  isMinecraft: false,
  isBlockly: false,
  isRtl: false,
  hasBackgroundMusic: false,
  displayReviewTab: false,
  exampleSolutions: [],
  isViewingAsInstructorInTraining: false,
};

describe('TopInstructions', () => {
  it('shows contained level answers in teacher only tab if instructor in training level', () => {
    const wrapper = shallow(
      <TopInstructions
        {...DEFAULT_PROPS}
        hasContainedLevels={true}
        isViewingAsInstructorInTraining={true}
        initialSelectedTab={TabType.TEACHER_ONLY}
      />
    );
    expect(wrapper.find('ContainedLevelAnswer')).to.have.lengthOf(1);
  });

  it('shows ContainedLevelResetButton on instructions tab', () => {
    const wrapper = shallow(
      <TopInstructions
        {...DEFAULT_PROPS}
        hasContainedLevels={true}
        isViewingAsInstructorInTraining={true}
        initialSelectedTab={TabType.INSTRUCTIONS}
      />
    );
    expect(
      wrapper.find('Connect(UnconnectedContainedLevelResetButton)')
    ).to.have.lengthOf(1);
  });

  it('does not shows ContainedLevelResetButton on teacher only tab', () => {
    const wrapper = shallow(
      <TopInstructions
        {...DEFAULT_PROPS}
        hasContainedLevels={true}
        isViewingAsInstructorInTraining={true}
        initialSelectedTab={TabType.TEACHER_ONLY}
      />
    );
    expect(
      wrapper.find('Connect(UnconnectedContainedLevelResetButton)')
    ).to.have.lengthOf(0);
  });

  it('shows teacher only markdown in teacher only tab if instructor in training level', () => {
    const wrapper = shallow(
      <TopInstructions
        {...DEFAULT_PROPS}
        teacherMarkdown={'Some teacher markdown'}
        isViewingAsInstructorInTraining={true}
        initialSelectedTab={TabType.TEACHER_ONLY}
      />
    );
    expect(wrapper.find('TeacherOnlyMarkdown')).to.have.lengthOf(1);
  });

  it('uses the editor-column class if not in standalone mode', () => {
    const wrapper = shallow(<TopInstructions {...DEFAULT_PROPS} />);
    expect(wrapper.hasClass('editor-column')).to.be.true;
  });

  it('does not use the editor-column class if in standalone mode', () => {
    const wrapper = shallow(
      <TopInstructions {...DEFAULT_PROPS} standalone={true} />
    );
    expect(wrapper.hasClass('editor-column')).to.be.false;
  });

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

  it('displays initial selected tab if supplied', () => {
    const wrapper = shallow(
      <TopInstructions {...DEFAULT_PROPS} initialSelectedTab={TabType.REVIEW} />
    );

    expect(wrapper.state().tabSelected).to.equal(TabType.REVIEW);
  });

  it('does not display any buttons when there are no example solutions', () => {
    const wrapper = shallow(
      <TopInstructions
        {...DEFAULT_PROPS}
        initialSelectedTab={TabType.TEACHER_ONLY}
      />
    );

    expect(wrapper.state().tabSelected).to.equal(TabType.TEACHER_ONLY);
    expect(wrapper.find('Button')).to.have.lengthOf(0);
  });

  it('displays example solutions as buttons in teacher only tab when available', () => {
    const wrapper = shallow(
      <TopInstructions
        {...DEFAULT_PROPS}
        initialSelectedTab={TabType.TEACHER_ONLY}
        exampleSolutions={['link/1', 'link/2']}
      />
    );

    expect(wrapper.state().tabSelected).to.equal(TabType.TEACHER_ONLY);
    expect(wrapper.find('Button')).to.have.lengthOf(2);
    expect(wrapper.find('Button').at(0).props().text).to.equal(
      'Example Solution 1'
    );
  });

  it('does not display example solutions buttons in other tabs when available', () => {
    const wrapper = shallow(
      <TopInstructions
        {...DEFAULT_PROPS}
        initialSelectedTab={TabType.INSTRUCTIONS}
        exampleSolutions={['link/1', 'link/2']}
      />
    );

    expect(wrapper.state().tabSelected).to.equal(TabType.INSTRUCTIONS);
    expect(wrapper.find('Button')).to.have.lengthOf(0);
  });

  it('displays StudentRubricView when rubrics tab is selected', () => {
    const wrapper = shallow(
      <TopInstructions
        {...DEFAULT_PROPS}
        viewAs={ViewType.Participant}
        taRubric={{learningGoals: []}}
      />
    );
    // This is an anti-pattern but one we already use in this file.
    wrapper.setState({tabSelected: TabType.TA_RUBRIC});
    expect(wrapper.state().tabSelected).to.equal(TabType.TA_RUBRIC);
    expect(wrapper.find('StudentRubricView')).to.have.lengthOf(1);
  });

  it('passes displayTaRubricTab=true to TopInstructionsHeader if rubric is present', () => {
    const wrapper = shallow(
      <TopInstructions
        {...DEFAULT_PROPS}
        viewAs={ViewType.Participant}
        taRubric={{learningGoals: []}}
      />
    );

    expect(wrapper.find(TopInstructionsHeader).props().displayTaRubricTab).to.be
      .true;
  });

  describe('viewing the Feedback Tab', () => {
    describe('as an instructor', () => {
      it('passes displayFeedback = false to TopInstructionsHeader on a level with no miniRubric where the instructor is not viewing student work', () => {
        const wrapper = shallow(<TopInstructions {...DEFAULT_PROPS} />);

        wrapper.setState({
          tabSelected: 'instructions',
          feedbacks: [],
          miniRubric: null,
          teacherViewingStudentWork: false,
          studentId: null,
          fetchingData: false,
          token: null,
        });

        expect(wrapper.find(TopInstructionsHeader).props().displayFeedback).to
          .be.false;
      });

      it('passes displayFeedback = true to TopInstructionsHeader on a level with a miniRubric where the instructor is not viewing student work', () => {
        const wrapper = shallow(<TopInstructions {...DEFAULT_PROPS} />);

        wrapper.setState({
          tabSelected: 'instructions',
          feedbacks: [],
          miniRubric: {
            keyConcept: 'This is the key concept',
            performanceLevel1: 'Includes more than needed',
            performanceLevel2: 'Includes exactly all needed elements',
            performanceLevel3: 'Has some of the needed elements',
            performanceLevel4: 'No work done',
          },
          teacherViewingStudentWork: false,
          studentId: null,
          fetchingData: false,
          token: null,
        });

        expect(wrapper.find(TopInstructionsHeader).props().displayFeedback).to
          .be.true;
      });

      it('passes displayFeedback = false to TopInstructionsHeader on a level with a TA Rubric', () => {
        const wrapper = shallow(
          <TopInstructions {...DEFAULT_PROPS} taRubric={{learningGoals: []}} />
        );

        wrapper.setState({
          tabSelected: 'instructions',
          feedbacks: [],
          miniRubric: {
            keyConcept: 'This is the key concept',
            performanceLevel1: 'Includes more than needed',
            performanceLevel2: 'Includes exactly all needed elements',
            performanceLevel3: 'Has some of the needed elements',
            performanceLevel4: 'No work done',
          },
          teacherViewingStudentWork: false,
          studentId: null,
          fetchingData: false,
          token: null,
        });

        expect(wrapper.find(TopInstructionsHeader).props().displayFeedback).to
          .be.false;
      });

      it('passes displayFeedback = true to TopInstructionsHeader teacher is viewing student work and cannot leave feedback', () => {
        const props = {...DEFAULT_PROPS, displayReviewTab: true};
        const wrapper = shallow(<TopInstructions {...props} />);

        wrapper.setState({
          teacherViewingStudentWork: true,
          teacherCanLeaveFeedback: false,
        });

        expect(wrapper.find(TopInstructionsHeader).props().displayFeedback).to
          .be.false;
      });

      it('passes displayFeedback = true to TopInstructionsHeader teacher is viewing student work and can leave feedback', () => {
        const props = {...DEFAULT_PROPS, displayReviewTab: true};
        const wrapper = shallow(<TopInstructions {...props} />);

        wrapper.setState({
          teacherViewingStudentWork: true,
          teacherCanLeaveFeedback: true,
        });

        expect(wrapper.find(TopInstructionsHeader).props().displayFeedback).to
          .be.true;
      });
    });

    describe('as a participant', () => {
      it('passes displayFeedback = true to TopInstructionsHeader on a level where the instructor has given feedback', () => {
        const wrapper = shallow(
          <TopInstructions {...DEFAULT_PROPS} viewAs={ViewType.Participant} />
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
            },
          ],
          miniRubric: {
            keyConcept: 'This is the key concept',
            performanceLevel1: 'Includes more than needed',
            performanceLevel2: 'Includes exactly all needed elements',
            performanceLevel3: 'Has some of the needed elements',
            performanceLevel4: 'No work done',
          },
          teacherViewingStudentWork: false,
          studentId: 1,
          fetchingData: false,
          token: null,
        });

        expect(wrapper.find(TopInstructionsHeader).props().displayFeedback).to
          .be.true;
      });

      it('passes displayFeedback = false to TopInstructionsHeader on a level where there is a TA Rubric', () => {
        const wrapper = shallow(
          <TopInstructions
            {...DEFAULT_PROPS}
            viewAs={ViewType.Participant}
            taRubric={{learningGoals: []}}
          />
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
            },
          ],
          miniRubric: {
            keyConcept: 'This is the key concept',
            performanceLevel1: 'Includes more than needed',
            performanceLevel2: 'Includes exactly all needed elements',
            performanceLevel3: 'Has some of the needed elements',
            performanceLevel4: 'No work done',
          },
          teacherViewingStudentWork: false,
          studentId: 1,
          fetchingData: false,
          token: null,
        });

        expect(wrapper.find(TopInstructionsHeader).props().displayFeedback).to
          .be.false;
      });

      it('passes displayFeedback = false to TopInstructionsHeader on a level where the instructor has not given feedback and there is no miniRubric', () => {
        const wrapper = shallow(
          <TopInstructions {...DEFAULT_PROPS} viewAs={ViewType.Participant} />
        );

        wrapper.setState({
          tabSelected: 'instructions',
          feedbacks: [],
          miniRubric: null,
          teacherViewingStudentWork: false,
          studentId: 1,
          fetchingData: false,
          token: null,
        });

        expect(wrapper.find(TopInstructionsHeader).props().displayFeedback).to
          .be.false;
      });

      it('passes displayReviewTab=true to TopInstructionsHeader if displayReviewTab is true', () => {
        const wrapper = shallow(
          <TopInstructions
            {...DEFAULT_PROPS}
            viewAs={ViewType.Participant}
            displayReviewTab={true}
          />
        );

        expect(wrapper.find(TopInstructionsHeader).props().displayReviewTab).to
          .be.true;
      });
    });
  });

  describe('viewing the TA Rubric Tab', () => {
    let getTaRubricFeedbackForStudentStub;
    beforeEach(() => {
      getTaRubricFeedbackForStudentStub = sinon.stub(
        TopInstructionsDataApi,
        'getTaRubricFeedbackForStudent'
      );
    });
    afterEach(() => {
      getTaRubricFeedbackForStudentStub.restore();
    });

    it('defaults to the rubrics tab if there is feedback', async () => {
      getTaRubricFeedbackForStudentStub.returns(
        Promise.resolve({
          value: [{feedback: 'feedback', understanding: 3}],
        })
      );
      const wrapper = shallow(
        <TopInstructions
          {...DEFAULT_PROPS}
          viewAs={ViewType.Participant}
          taRubric={{learningGoals: []}}
        />
      );
      await act(async () => {
        await Promise.resolve();
      });
      wrapper.update();
      expect(getTaRubricFeedbackForStudentStub).to.have.been.calledOnce;
      expect(wrapper.find('StudentRubricView')).to.have.lengthOf(1);
    });

    it('does not default to the rubrics tab if there is no feedback', async () => {
      getTaRubricFeedbackForStudentStub.returns(
        Promise.resolve({
          value: [],
        })
      );
      const wrapper = shallow(
        <TopInstructions
          {...DEFAULT_PROPS}
          viewAs={ViewType.Participant}
          taRubric={{learningGoals: []}}
        />
      );
      await act(async () => {
        await Promise.resolve();
      });
      wrapper.update();
      expect(getTaRubricFeedbackForStudentStub).to.have.been.calledOnce;
      expect(wrapper.find('StudentRubricView')).to.have.lengthOf(0);
      expect(wrapper.find('TopInstructionsHeader').props().displayTaRubricTab)
        .to.be.true;
    });

    it('does not try to fetch TA rubric feedback if no rubric exists', () => {
      const wrapper = shallow(
        <TopInstructions
          {...DEFAULT_PROPS}
          viewAs={ViewType.Participant}
          taRubric={null}
        />
      );
      expect(getTaRubricFeedbackForStudentStub).to.not.have.been.called;
      expect(wrapper.find('TopInstructionsHeader').props().displayTaRubricTab)
        .to.be.false;
    });
  });
});
