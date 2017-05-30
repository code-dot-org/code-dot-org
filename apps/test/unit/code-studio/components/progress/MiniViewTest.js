import React from 'react';
import { assert } from 'chai';
import { UnconnectedMiniView as MiniView } from
  '@cdo/apps/code-studio/components/progress/MiniView';
import { shallow } from 'enzyme';

describe('MiniView', () => {
  it('displays a loading div if we havent loaded progress yet', () => {
    const wrapper = shallow(
      <MiniView hasFullProgress={false}/>
    );

    const body = wrapper.childAt(1);

    assert.equal(body.props().className, 'loading');
    assert.equal(wrapper.find('MiniViewTopRow').length, 1);
    assert.equal(wrapper.find('CourseProgress').length, 0);
  });

  it('shows course progress once progress has loaded', () => {
    const wrapper = shallow(
      <MiniView hasFullProgress={true}/>
    );

    assert.equal(wrapper.find(n => n.props().className === 'loading').length, 0);
    assert.equal(wrapper.find('MiniViewTopRow').length, 1);
    assert.equal(wrapper.find('Connect(CourseProgress)').length, 1);
    assert.equal(wrapper.find('Connect(CourseProgress)').props().onOverviewPage, false);
  });
});
