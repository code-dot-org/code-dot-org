import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {UnconnectedMiniView as MiniView} from '@cdo/apps/code-studio/components/progress/MiniView';

describe('MiniView', () => {
  const defaultProps = {
    isSummaryView: false,
    hasGroups: false,
    scriptName: 'Classic Maze',
    hasFullProgress: false,
  };

  it('displays a loading div if we havent loaded progress yet', () => {
    const wrapper = shallow(
      <MiniView {...defaultProps} hasFullProgress={false} />
    );

    const body = wrapper.childAt(1);

    expect(body.props().className).toEqual('loading');
    expect(wrapper.find('MiniViewTopRow').length).toEqual(1);
    expect(wrapper.find('UnitOverview').length).toEqual(0);
  });

  it('shows course progress once progress has loaded', () => {
    const wrapper = shallow(
      <MiniView {...defaultProps} hasFullProgress={true} />
    );

    expect(wrapper.find(n => n.props().className === 'loading').length).toEqual(
      0
    );
    expect(wrapper.find('Connect(ProgressTable)').length).toEqual(1);
  });

  it('shows GoogleClassroomAttributionLabel once progress has loaded', () => {
    const wrapper = shallow(
      <MiniView {...defaultProps} hasFullProgress={true} />
    );

    expect(wrapper.find(n => n.props().className === 'loading').length).toEqual(
      0
    );
    expect(
      wrapper.find('Connect(GoogleClassroomAttributionLabel)').length
    ).toEqual(1);
  });

  it('shows MiniViewTopRow if not minimal', () => {
    const wrapper = shallow(<MiniView {...defaultProps} minimal={false} />);
    expect(wrapper.find('MiniViewTopRow').length).toEqual(1);
  });

  it('hides MiniViewTopRow if minimal', () => {
    const wrapper = shallow(<MiniView {...defaultProps} minimal={true} />);
    expect(wrapper.find('MiniViewTopRow').length).toEqual(0);
  });

  it('has larger margins in group view', () => {
    const wrapper = shallow(
      <MiniView {...defaultProps} hasFullProgress={true} hasGroups={true} />
    );

    const bodyDiv = wrapper.children().last();
    expect(bodyDiv.name()).toEqual('div');
    expect(bodyDiv.prop('style')['margin']).toBe(20);
  });
});
