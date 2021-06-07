import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import TopInstructionsHeader from '@cdo/apps/templates/instructions/TopInstructionsHeader';
import {TabType} from '@cdo/apps/templates/instructions/TopInstructions';
import InlineAudio from '@cdo/apps/templates/instructions/InlineAudio';
import {PaneButton} from '@cdo/apps/templates/PaneHeader';
import CollapserIcon from '@cdo/apps/templates/CollapserIcon';

const DEFAULT_PROPS = {
  teacherOnly: false,
  tabSelected: TabType.INSTRUCTIONS,
  isCSDorCSP: true,
  displayHelpTab: true,
  displayFeedback: true,
  displayKeyConcept: false,
  isViewingAsTeacher: false,
  fetchingData: false,
  handleDocumentationClick: () => {},
  handleInstructionTabClick: () => {},
  handleHelpTabClick: () => {},
  handleCommentTabClick: () => {},
  handleDocumentationTabClick: () => {},
  handleReviewTabClick: () => {},
  handleTeacherOnlyTabClick: () => {},
  handleClickCollapser: () => {},
  isMinecraft: false,
  ttsLongInstructionsUrl: '',
  hasContainedLevels: false,
  isRtl: false,
  documentationUrl: '',
  teacherMarkdown: 'Some teacher only markdown',
  isEmbedView: false,
  isCollapsed: false,
  collapsible: true
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
      isCSDorCSP: true
    });
    expect(wrapper.find(InlineAudio)).to.have.length(1);
  });

  it('on the instructions tab selects the instructions tab', () => {
    const wrapper = setUp({
      tabSelected: TabType.INSTRUCTIONS
    });
    const instructionsTab = wrapper.find('.uitest-instructionsTab');
    expect(instructionsTab.props().selected).to.be.true;
  });

  it('on the comments tab does not display the PaneButton', () => {
    const wrapper = setUp({
      tabSelected: TabType.COMMENTS
    });
    expect(wrapper.find(PaneButton)).to.have.length(0);
  });

  it('on the comments tab selects and displays the comment tab when displayFeedback is true', () => {
    const wrapper = setUp({
      displayFeedback: true,
      tabSelected: TabType.COMMENTS
    });
    const commentTab = wrapper.find('.uitest-feedback');
    expect(commentTab.props().selected).to.be.true;
  });

  it('hides comment tab when displayFeedback is false', () => {
    const wrapper = setUp({
      displayFeedback: false,
      tabSelected: TabType.COMMENTS
    });
    expect(wrapper.find('.uitest-feedback')).to.have.length(0);
  });

  it('on the resources tab selects the resources tab', () => {
    const wrapper = setUp({
      tabSelected: TabType.RESOURCES
    });
    const resourcesTab = wrapper.find('.uitest-helpTab');
    expect(resourcesTab.props().selected).to.be.true;
  });

  it('hides the teacher only tab if not viewing as teacher', () => {
    const wrapper = setUp({
      isViewingAsTeacher: false,
      teacherMarkdown: 'teacher markdown'
    });
    expect(wrapper.find('.uitest-teacherOnlyTab')).to.have.length(0);
  });

  it('hides the teacher only tab if viewing as teacher but no teacher markdown', () => {
    const wrapper = setUp({
      isViewingAsTeacher: true,
      teacherMarkdown: null
    });
    expect(wrapper.find('.uitest-teacherOnlyTab')).to.have.length(0);
  });

  it('shows the teacher only tab if viewing as teacher and teacher markdown exists', () => {
    const wrapper = setUp({
      isViewingAsTeacher: true,
      teacherMarkdown: 'teacher markdown'
    });
    expect(wrapper.find('.uitest-teacherOnlyTab')).to.have.length(1);
  });

  it('does not display CollapserIcon in embed view', () => {
    const wrapper = setUp({
      isEmbedView: true
    });
    expect(wrapper.find(CollapserIcon)).to.have.length(0);
  });
});
