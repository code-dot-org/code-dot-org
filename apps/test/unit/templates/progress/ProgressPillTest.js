import {assert, expect} from '../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import {UnconnectedProgressPill as ProgressPill} from '@cdo/apps/templates/progress/ProgressPill';
import {LevelStatus, LevelKind} from '@cdo/apps/util/sharedConstants';
import ReactTooltip from 'react-tooltip';

const unpluggedLevel = {
  id: '1',
  kind: LevelKind.unplugged,
  isUnplugged: true,
  status: LevelStatus.perfect,
  isLocked: false
};

const assessmentLevel = {
  id: '2',
  kind: LevelKind.assessment,
  isUnplugged: false,
  status: LevelStatus.perfect,
  isLocked: false
};

const levelWithUrl = {
  ...unpluggedLevel,
  url: '/foo/bar'
};

const DEFAULT_PROPS = {
  levels: [],
  icon: 'desktop',
  text: '1',
  fontSize: 12,
  disabled: false
};

describe('ProgressPill', () => {
  it('can render an unplugged pill', () => {
    shallow(
      <ProgressPill levels={[unpluggedLevel]} text="Unplugged Activity" />
    );
  });

  it('renders a provided tooltip', () => {
    const tooltip = <ReactTooltip tooltipId="123" />;

    const wrapper = shallow(
      <ProgressPill
        levels={[unpluggedLevel]}
        text="Unplugged Activity"
        tooltip={tooltip}
      />
    );
    assert.equal(wrapper.find('ReactTooltip').length, 1);
    assert.equal(
      wrapper
        .find('div')
        .first()
        .props()['data-tip'],
      true
    );
    assert.equal(
      wrapper
        .find('div')
        .first()
        .props()['data-for'],
      123
    );
  });

  it('has an href when single level with url', () => {
    const wrapper = shallow(
      <ProgressPill levels={[levelWithUrl]} text="Unplugged Activity" />
    );
    assert.equal(wrapper.find('a').props().href, '/foo/bar');
  });

  it('does not have an href when disabled', () => {
    const wrapper = shallow(
      <ProgressPill
        levels={[levelWithUrl]}
        text="Unplugged Activity"
        disabled={true}
      />
    );
    assert.equal(wrapper.find('a').props().href, undefined);
  });

  it('has an assessment icon when single level is assessment', () => {
    const wrapper = shallow(
      <ProgressPill {...DEFAULT_PROPS} levels={[assessmentLevel]} />
    );
    expect(wrapper.find('BubbleBadge')).to.have.lengthOf(1);
    expect(wrapper.find('BubbleBadge').props().type).to.equal('assessment');
  });

  it('does not have an assessment icon when single level is not assessment', () => {
    const wrapper = shallow(
      <ProgressPill {...DEFAULT_PROPS} levels={[unpluggedLevel]} />
    );
    expect(wrapper.find('BubbleBadge')).to.have.lengthOf(0);
  });

  it('does not have an assessment icon when multiple assessment levels', () => {
    const wrapper = shallow(
      <ProgressPill
        {...DEFAULT_PROPS}
        levels={[assessmentLevel, assessmentLevel]}
      />
    );
    expect(wrapper.find('BubbleBadge')).to.have.lengthOf(0);
  });
});
