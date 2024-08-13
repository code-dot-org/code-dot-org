import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import CollapserIcon from '@cdo/apps/templates/CollapserIcon';
import InlineAudio from '@cdo/apps/templates/instructions/InlineAudio';
import {TabType} from '@cdo/apps/templates/instructions/TopInstructions';
import TopInstructionsHeader from '@cdo/apps/templates/instructions/TopInstructionsHeader';
import {PaneButton} from '@cdo/apps/templates/PaneHeader';
import i18n from '@cdo/locale';

const DEFAULT_PROPS = {
  teacherOnly: false,
  tabSelected: TabType.INSTRUCTIONS,
  isCSDorCSP: true,
  displayHelpTab: true,
  displayFeedback: true,
  levelHasMiniRubric: false,
  isViewingAsTeacher: false,
  isViewingAsInstructorInTraining: false,
  hasBackgroundMusic: false,
  fetchingData: false,
  handleDocumentationClick: () => {},
  handleInstructionTabClick: () => {},
  handleReviewV2TabClick: () => {},
  handleHelpTabClick: () => {},
  handleCommentTabClick: () => {},
  handleDocumentationTabClick: () => {},
  handleReviewTabClick: () => {},
  handleTeacherOnlyTabClick: () => {},
  handleTaRubricTabClick: () => {},
  handleClickCollapser: () => {},
  isMinecraft: false,
  ttsLongInstructionsUrl: '',
  hasContainedLevels: false,
  isRtl: false,
  documentationUrl: '',
  teacherMarkdown: 'Some teacher only markdown',
  isEmbedView: false,
  isCollapsed: false,
  collapsible: true,
};

const setUp = (overrideProps = {}) => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<TopInstructionsHeader {...props} />);
};

describe('TopInstructionsHeader', () => {
  it('on the instructions tab when ttsLongInstructionsUrl and isCSDorCSP displays inline audio', () => {
    const wrapper = setUp({
      tabSelected: TabType.INSTRUCTIONS,
      ttsLongInstructionsUrl: 'some-url',
      isCSDorCSP: true,
    });
    expect(wrapper.find(InlineAudio)).toHaveLength(1);
  });

  it('on the instructions tab selects the instructions tab', () => {
    const wrapper = setUp({
      tabSelected: TabType.INSTRUCTIONS,
    });
    const instructionsTab = wrapper.find('.uitest-instructionsTab');
    expect(instructionsTab.props().selected).toBe(true);
  });

  it('on the comments tab does not display the PaneButton', () => {
    const wrapper = setUp({
      tabSelected: TabType.COMMENTS,
    });
    expect(wrapper.find(PaneButton)).toHaveLength(0);
  });

  it('on the comments tab selects and displays the comment tab when displayFeedback is true', () => {
    const wrapper = setUp({
      displayFeedback: true,
      tabSelected: TabType.COMMENTS,
    });
    const commentTab = wrapper.find('.uitest-feedback');
    expect(commentTab.props().selected).toBe(true);
  });

  it('on the comments tab selects when displayFeedback and levelHasMiniRubric text is rubric', () => {
    const wrapper = setUp({
      levelHasMiniRubric: true,
      displayFeedback: true,
      tabSelected: TabType.COMMENTS,
    });
    const commentTab = wrapper.find('.uitest-feedback');
    expect(commentTab.props().text).toBe(i18n.rubric());
  });

  it('on the comments tab selects when displayFeedback and levelHasMiniRubric = false text is feedback', () => {
    const wrapper = setUp({
      levelHasMiniRubric: false,
      displayFeedback: true,
      tabSelected: TabType.COMMENTS,
    });
    const commentTab = wrapper.find('.uitest-feedback');
    expect(commentTab.props().text).toBe(i18n.feedback());
  });

  it('hides comment tab when displayFeedback is false', () => {
    const wrapper = setUp({
      displayFeedback: false,
      tabSelected: TabType.COMMENTS,
    });
    expect(wrapper.find('.uitest-feedback')).toHaveLength(0);
  });

  it('shows comments tab for elementary-level lessons', () => {
    const wrapper = setUp({
      displayFeedback: true,
      isCSDorCSP: false,
      tabSelected: TabType.COMMENTS,
    });
    expect(wrapper.find('.uitest-feedback')).toHaveLength(1);
  });

  it('does not show mute button when hasBackgroundMusic is false', () => {
    const wrapper = setUp({
      hasBackgroundMusic: false,
    });
    expect(wrapper.find('.uitest-mute-music-button')).toHaveLength(0);
  });

  it('shows mute button when hasBackgroundMusic is true', () => {
    const wrapper = setUp({
      hasBackgroundMusic: true,
    });
    expect(wrapper.find('.uitest-mute-music-button')).toHaveLength(1);
  });

  it('on the resources tab selects the resources tab', () => {
    const wrapper = setUp({
      tabSelected: TabType.RESOURCES,
    });
    const resourcesTab = wrapper.find('.uitest-helpTab');
    expect(resourcesTab.props().selected).toBe(true);
  });

  it('hides the teacher only tab if not viewing as teacher of instructor in training level', () => {
    const wrapper = setUp({
      isViewingAsTeacher: false,
      isViewingAsInstructorInTraining: false,
      teacherMarkdown: 'teacher markdown',
    });
    expect(wrapper.find('.uitest-teacherOnlyTab')).toHaveLength(0);
  });

  it('does not display CollapserIcon in embed view', () => {
    const wrapper = setUp({
      isEmbedView: true,
    });
    expect(wrapper.find(CollapserIcon)).toHaveLength(0);
  });

  describe('viewing as teacher', () => {
    it('shows the teacher only tab if teacher markdown exists', () => {
      const wrapper = setUp({
        isViewingAsTeacher: true,
        teacherMarkdown: 'teacher markdown',
        exampleSolutions: [],
      });
      expect(wrapper.find('.uitest-teacherOnlyTab')).toHaveLength(1);
    });

    it('shows the teacher only tab if example solutions exists', () => {
      const wrapper = setUp({
        isViewingAsTeacher: true,
        teacherMarkdown: null,
        exampleSolutions: ['link/1', 'link/2'],
      });
      expect(wrapper.find('.uitest-teacherOnlyTab')).toHaveLength(1);
    });

    it('hides the teacher only tab if no teacher markdown or example solutions', () => {
      const wrapper = setUp({
        isViewingAsTeacher: true,
        teacherMarkdown: null,
        exampleSolutions: [],
      });
      expect(wrapper.find('.uitest-teacherOnlyTab')).toHaveLength(0);
    });
  });

  describe('viewing as participant on instructor in training level', () => {
    it('shows the teacher only tab if example solutions exists', () => {
      const wrapper = setUp({
        isViewingAsInstructorInTraining: true,
        teacherMarkdown: null,
        exampleSolutions: ['link/1', 'link/2'],
      });
      expect(wrapper.find('.uitest-teacherOnlyTab')).toHaveLength(1);
    });

    it('shows the teacher only tab if teacher markdown exists', () => {
      const wrapper = setUp({
        isViewingAsInstructorInTraining: true,
        teacherMarkdown: 'teacher markdown',
        exampleSolutions: [],
      });
      expect(wrapper.find('.uitest-teacherOnlyTab')).toHaveLength(1);
    });

    it('hides the teacher only tab if no teacher markdown or example solutions', () => {
      const wrapper = setUp({
        isViewingAsInstructorInTraining: true,
        teacherMarkdown: null,
        exampleSolutions: [],
      });
      expect(wrapper.find('.uitest-teacherOnlyTab')).toHaveLength(0);
    });
  });
});
