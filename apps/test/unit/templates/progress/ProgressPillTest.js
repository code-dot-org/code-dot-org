import { assert } from '../../../util/configuredChai';
import React from 'react';
import { shallow } from 'enzyme';
import ProgressPill from '@cdo/apps/templates/progress/ProgressPill';
import { LevelStatus, LevelKind } from '@cdo/apps/util/sharedConstants';
import ReactTooltip from 'react-tooltip';

const unpluggedLevel = {
  kind: LevelKind.unplugged,
  isUnplugged: true,
  status: LevelStatus.perfect,
};
const levelWithUrl = {
  ...unpluggedLevel,
  url: '/foo/bar'
};

describe('ProgressPill', () => {
  it('can render an unplugged pill', () => {
    shallow(
      <ProgressPill
        levels={[unpluggedLevel]}
        text="Unplugged Activity"
      />
    );
  });

  it('renders a provided tooltip', () => {
    const tooltip = <ReactTooltip tooltipId="123"/>;

    const wrapper = shallow(
      <ProgressPill
        levels={[unpluggedLevel]}
        text="Unplugged Activity"
        tooltip={tooltip}
      />
    );
    assert.equal(wrapper.find('ReactTooltip').length, 1);
    assert.equal(wrapper.find('div').first().props()['data-tip'], true);
    assert.equal(wrapper.find('div').first().props()['data-for'], 123);
  });

  it('has an href when single level with url', () => {
    const wrapper = shallow(
      <ProgressPill
        levels={[levelWithUrl]}
        text="Unplugged Activity"
      />
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
});
