import {assert, expect} from '../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import ProgressPill from '@cdo/apps/templates/progress/ProgressPill';
import {LevelStatus, LevelKind} from '@cdo/apps/util/sharedConstants';
import ReactTooltip from 'react-tooltip';

const unpluggedLevel = {
  kind: LevelKind.unplugged,
  isUnplugged: true
};

const assessmentLevel = {
  kind: LevelKind.assessment,
  isUnplugged: false
};

const levelWithUrl = {
  ...unpluggedLevel,
  url: '/foo/bar'
};

const DEFAULT_PROPS = {
  levelStatus: LevelStatus.perfect,
  icon: 'desktop',
  text: '1',
  fontSize: 12,
  disabled: false
};

describe('ProgressPill', () => {
  it('can render an unplugged pill', () => {
    shallow(
      <ProgressPill
        level={unpluggedLevel}
        levelStatus={LevelStatus.perfect}
        text="Unplugged Activity"
      />
    );
  });

  it('renders a provided tooltip', () => {
    const tooltip = <ReactTooltip tooltipId="123" />;

    const wrapper = shallow(
      <ProgressPill
        level={unpluggedLevel}
        levelStatus={LevelStatus.perfect}
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
      <ProgressPill
        level={levelWithUrl}
        levelStatus={LevelStatus.perfect}
        text="Unplugged Activity"
      />
    );
    assert.equal(wrapper.find('a').props().href, '/foo/bar');
  });

  it('does not have an href when disabled', () => {
    const wrapper = shallow(
      <ProgressPill
        level={levelWithUrl}
        levelStatus={LevelStatus.perfect}
        text="Unplugged Activity"
        disabled={true}
      />
    );
    assert.equal(wrapper.find('a').props().href, undefined);
  });

  it('has an assessment icon when level is assessment and multilevel is false', () => {
    const wrapper = shallow(
      <ProgressPill {...DEFAULT_PROPS} level={assessmentLevel} />
    );
    expect(wrapper.find('SmallAssessmentIcon')).to.have.lengthOf(1);
  });

  it('does not have an assessment icon when single level is not assessment', () => {
    const wrapper = shallow(
      <ProgressPill {...DEFAULT_PROPS} level={unpluggedLevel} />
    );
    expect(wrapper.find('SmallAssessmentIcon')).to.have.lengthOf(0);
  });

  it('does not have an assessment icon when level is assessment and multilevel is true', () => {
    const wrapper = shallow(
      <ProgressPill
        {...DEFAULT_PROPS}
        level={assessmentLevel}
        multilevel={true}
      />
    );
    expect(wrapper.find('SmallAssessmentIcon')).to.have.lengthOf(0);
  });
});
