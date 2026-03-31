import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import _ from 'lodash';
import React from 'react';

import {
  UnconnectedLevelToken as LevelToken,
  LevelTokenContents,
} from '@cdo/apps/levelbuilder/lesson-editor/LevelToken';

const defaultScriptLevel = {
  id: '11',
  position: 1,
  activeId: '2001',
  key: 'level-one',
  levels: [
    {
      id: '2001',
      name: 'Level One',
      key: 'level-one',
      url: '/path/to/edit/1',
    },
  ],
  kind: 'puzzle',
  assessment: false,
  challenge: false,
  bonus: false,
  instructor_in_training: false,
};

describe('LevelToken', () => {
  let handleDragStart, removeLevel, toggleExpand, defaultProps;

  beforeEach(() => {
    handleDragStart = jest.fn();
    removeLevel = jest.fn();
    toggleExpand = jest.fn();
    defaultProps = {
      activitySectionPosition: 1,
      activityPosition: 1,
      scriptLevel: _.cloneDeep(defaultScriptLevel),
      dragging: false,
      allowMajorCurriculumChanges: true,
      delta: 0,
      handleDragStart,
      removeLevel,
      toggleExpand,
    };
  });

  it('renders a Motion component', () => {
    const wrapper = shallow(<LevelToken {...defaultProps} />);
    expect(wrapper.find('Motion').length).toBe(1);
  });
});

describe('LevelTokenContents', () => {
  let handleDragStart, removeLevel, toggleExpand, defaultProps;

  beforeEach(() => {
    handleDragStart = jest.fn();
    removeLevel = jest.fn();
    toggleExpand = jest.fn();
    defaultProps = {
      y: 0,
      scale: 0,
      shadow: 0,
      activitySectionPosition: 2,
      activityPosition: 3,
      scriptLevel: defaultScriptLevel,
      allowMajorCurriculumChanges: true,
      handleDragStart,
      removeLevel,
      toggleExpand,
    };
  });

  it('renders a ProgressBubble and level key', () => {
    const wrapper = shallow(<LevelTokenContents {...defaultProps} />);
    expect(wrapper.find('ProgressBubble').length).toBe(1);
    const nameWrapper = wrapper.find('.uitest-level-token-name');
    expect(nameWrapper.text()).toContain('level-one');
  });

  it('shows no purple indicators when not an assessment, challenge or bonus', () => {
    const wrapper = shallow(<LevelTokenContents {...defaultProps} />);
    expect(wrapper.containsMatchingElement(<span>assessment</span>)).toBe(
      false
    );
    expect(wrapper.containsMatchingElement(<span>bonus</span>)).toBe(false);
    expect(
      wrapper.containsMatchingElement(<span>instructor in training</span>)
    ).toBe(false);
    expect(wrapper.containsMatchingElement(<span>challenge</span>)).toBe(false);
    expect(wrapper.containsMatchingElement(<span>variants</span>)).toBe(false);
  });

  it('hides movement and deletion buttons when not allowed to make major curriculum changes', () => {
    const wrapper = shallow(
      <LevelTokenContents
        {...defaultProps}
        allowMajorCurriculumChanges={false}
      />
    );
    expect(wrapper.find('.fa-arrows-v').length).toBe(0);
    expect(wrapper.find('.fa-times').length).toBe(0);
  });

  it('show movement and deletion buttons when allowed to make major curriculum changes', () => {
    const wrapper = shallow(
      <LevelTokenContents
        {...defaultProps}
        allowMajorCurriculumChanges={true}
      />
    );
    expect(wrapper.find('.fa-arrows-v').length).toBe(1);
    expect(wrapper.find('.fa-times').length).toBe(1);
  });

  it('shows assessment indicator when assessment', () => {
    let tempScriptLevel = _.cloneDeep(defaultScriptLevel);
    tempScriptLevel.assessment = true;
    const wrapper = shallow(
      <LevelTokenContents {...defaultProps} scriptLevel={tempScriptLevel} />
    );
    expect(wrapper.containsMatchingElement(<span>assessment</span>)).toBe(true);
  });

  it('shows bonus indicator when bonus', () => {
    let tempScriptLevel = _.cloneDeep(defaultScriptLevel);
    tempScriptLevel.bonus = true;
    const wrapper = shallow(
      <LevelTokenContents {...defaultProps} scriptLevel={tempScriptLevel} />
    );
    expect(wrapper.containsMatchingElement(<span>bonus</span>)).toBe(true);
  });

  it('shows instructor in training indicator when instructor in training', () => {
    let tempScriptLevel = _.cloneDeep(defaultScriptLevel);
    tempScriptLevel.instructor_in_training = true;
    const wrapper = shallow(
      <LevelTokenContents {...defaultProps} scriptLevel={tempScriptLevel} />
    );
    expect(
      wrapper.containsMatchingElement(<span>instructor in training</span>)
    ).toBe(true);
  });

  it('shows challenge indicator when challenge', () => {
    let tempScriptLevel = _.cloneDeep(defaultScriptLevel);
    tempScriptLevel.challenge = true;
    const wrapper = shallow(
      <LevelTokenContents {...defaultProps} scriptLevel={tempScriptLevel} />
    );
    expect(wrapper.containsMatchingElement(<span>challenge</span>)).toBe(true);
  });

  it('shows variants indicator when level variants are present', () => {
    let tempScriptLevel = _.cloneDeep(defaultScriptLevel);
    tempScriptLevel.levels.push({
      id: '2002',
      name: 'Level Two',
      url: '/path/to/edit/2',
    });

    const wrapper = shallow(
      <LevelTokenContents {...defaultProps} scriptLevel={tempScriptLevel} />
    );
    expect(wrapper.containsMatchingElement(<span>variants</span>)).toBe(true);
  });

  it('calls toggleExpand when level name is clicked', () => {
    const wrapper = shallow(<LevelTokenContents {...defaultProps} />);
    expect(wrapper.find('LevelTokenDetails').length).toBe(0);
    expect(toggleExpand).not.toHaveBeenCalled();
    const nameWrapper = wrapper.find('.uitest-level-token-name');
    nameWrapper.simulate('click');
    expect(toggleExpand).toHaveBeenCalledWith(3, 2, 1);
  });

  it('shows LevelTokenDetails when expanded', () => {
    defaultProps.scriptLevel.expand = true;
    const wrapper = shallow(<LevelTokenContents {...defaultProps} />);
    const details = wrapper.find('Connect(LevelTokenDetails)');
    expect(details.length).toBe(1);
    expect(details.props().inactiveLevelNames).toHaveLength(0);
  });

  it('passes inactive level variants to LevelTokenDetails when present', () => {
    defaultProps.scriptLevel.expand = true;
    defaultProps.scriptLevel.activeId = '2002';
    defaultProps.scriptLevel.key = 'level-two';
    defaultProps.scriptLevel.levels.push({
      id: '2002',
      name: 'Level Two',
      url: '/path/to/edit/2',
    });
    const wrapper = shallow(<LevelTokenContents {...defaultProps} />);
    const details = wrapper.find('Connect(LevelTokenDetails)');
    expect(details.length).toBe(1);
    expect(details.props().inactiveLevelNames).toHaveLength(1);
    expect(details.props().inactiveLevelNames[0]).toBe('Level One');
  });
});
