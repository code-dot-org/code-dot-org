import React from 'react';
import { assert } from '../../../../util/configuredChai';
import { UnconnectedMiniView as MiniView } from
  '@cdo/apps/code-studio/components/progress/MiniView';
import { shallow } from 'enzyme';

describe('MiniView', () => {
  const defaultProps = {
    isSummaryView: false,
    hasGroups: false,
    scriptName: 'Classic Maze',
    hasFullProgress: false,
  };

  it('displays a loading div if we havent loaded progress yet', () => {
    const wrapper = shallow(
      <MiniView {...defaultProps} hasFullProgress={false}/>
    );

    const body = wrapper.childAt(1);

    assert.equal(body.props().className, 'loading');
    assert.equal(wrapper.find('MiniViewTopRow').length, 1);
    assert.equal(wrapper.find('ScriptOverview').length, 0);
  });

  it('shows course progress once progress has loaded', () => {
    const wrapper = shallow(
      <MiniView {...defaultProps} hasFullProgress={true}/>
    );

    assert.equal(wrapper.find(n => n.props().className === 'loading').length, 0);
    assert.equal(wrapper.find('MiniViewTopRow').length, 1);
    assert.equal(wrapper.find('Connect(ScriptOverview)').length, 1);
    assert.equal(wrapper.find('Connect(ScriptOverview)').props().onOverviewPage, false);
  });

  it('has larger margins in group view', () => {
    const wrapper = shallow(
      <MiniView {...defaultProps} hasFullProgress={true} hasGroups={true}/>
    );

    const bodyDiv = wrapper.children().last();
    assert.equal(bodyDiv.name(), 'div');
    assert.propertyVal(bodyDiv.prop('style'), 'margin', 20);
  });
});
