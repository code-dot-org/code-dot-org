import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import sinon from 'sinon';
import {
  UnconnectedLevelToken as LevelToken,
  LevelTokenContents
} from '@cdo/apps/lib/levelbuilder/lesson-editor/LevelToken';
import _ from 'lodash';

const defaultScriptLevel = {
  id: '11',
  position: 1,
  activeId: '2001',
  levels: [
    {
      id: '11',
      name: 'My Level',
      url: '/path/to/edit/url'
    }
  ],
  kind: 'puzzle',
  assessment: false,
  challenge: false,
  bonus: false
};

describe('LevelToken', () => {
  let handleDragStart, removeLevel, toggleExpand, defaultProps;

  beforeEach(() => {
    handleDragStart = sinon.spy();
    removeLevel = sinon.spy();
    toggleExpand = sinon.spy();
    defaultProps = {
      activitySectionPosition: 1,
      activityPosition: 1,
      scriptLevel: defaultScriptLevel,
      dragging: false,
      delta: 0,
      handleDragStart,
      removeLevel,
      toggleExpand
    };
  });

  it('renders a Motion component', () => {
    const wrapper = shallow(<LevelToken {...defaultProps} />);
    expect(wrapper.find('Motion').length).to.equal(1);
  });
});

describe('LevelTokenContents', () => {
  let handleDragStart, removeLevel, toggleExpand, defaultProps;

  beforeEach(() => {
    handleDragStart = sinon.spy();
    removeLevel = sinon.spy();
    toggleExpand = sinon.spy();
    defaultProps = {
      y: 0,
      scale: 0,
      shadow: 0,
      activitySectionPosition: 2,
      activityPosition: 3,
      scriptLevel: defaultScriptLevel,
      handleDragStart,
      removeLevel,
      toggleExpand
    };
  });

  it('renders a ProgressBubble', () => {
    const wrapper = shallow(<LevelTokenContents {...defaultProps} />);
    expect(wrapper.find('ProgressBubble').length).to.equal(1);
  });

  it('shows no purple indicators when not an assessment, challenge or bonus', () => {
    const wrapper = shallow(<LevelTokenContents {...defaultProps} />);
    expect(wrapper.containsMatchingElement(<span>assessment</span>)).to.be
      .false;
    expect(wrapper.containsMatchingElement(<span>bonus</span>)).to.be.false;
    expect(wrapper.containsMatchingElement(<span>challenge</span>)).to.be.false;
  });

  it('shows assessment indicator when assessment', () => {
    let tempScriptLevel = _.cloneDeep(defaultScriptLevel);
    tempScriptLevel.assessment = true;
    const wrapper = shallow(
      <LevelTokenContents {...defaultProps} scriptLevel={tempScriptLevel} />
    );
    expect(wrapper.containsMatchingElement(<span>assessment</span>)).to.be.true;
  });

  it('shows bonus indicator when bonus', () => {
    let tempScriptLevel = _.cloneDeep(defaultScriptLevel);
    tempScriptLevel.bonus = true;
    const wrapper = shallow(
      <LevelTokenContents {...defaultProps} scriptLevel={tempScriptLevel} />
    );
    expect(wrapper.containsMatchingElement(<span>bonus</span>)).to.be.true;
  });

  it('shows challenge indicator when challenge', () => {
    let tempScriptLevel = _.cloneDeep(defaultScriptLevel);
    tempScriptLevel.challenge = true;
    const wrapper = shallow(
      <LevelTokenContents {...defaultProps} scriptLevel={tempScriptLevel} />
    );
    expect(wrapper.containsMatchingElement(<span>challenge</span>)).to.be.true;
  });

  it('calls toggleExpand when level name is clicked', () => {
    const wrapper = shallow(<LevelTokenContents {...defaultProps} />);
    expect(wrapper.find('LevelTokenDetails').length).to.equal(0);
    expect(toggleExpand).not.to.have.been.called;
    const nameWrapper = wrapper.find('.uitest-level-token-name');
    nameWrapper.simulate('click');
    expect(toggleExpand).to.have.been.calledWith(3, 2, 1);
  });

  it('shows LevelTokenDetails when expanded', () => {
    defaultProps.scriptLevel.expand = true;
    const wrapper = shallow(<LevelTokenContents {...defaultProps} />);
    console.log(wrapper.debug());
    expect(wrapper.find('Connect(LevelTokenDetails)').length).to.equal(1);
  });
});
