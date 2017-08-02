import { assert } from '../../../util/configuredChai';
import {throwOnConsoleWarnings, throwOnConsoleErrors} from '../../../util/testUtils';
import React from 'react';
import { shallow } from 'enzyme';
import ProgressPill from '@cdo/apps/templates/progress/ProgressPill';
import { LevelStatus, LevelKind } from '@cdo/apps/util/sharedConstants';
import ReactTooltip from 'react-tooltip';

const unpluggedLevel = {
  kind: LevelKind.unplugged,
  isUnplugged: true,
  status: LevelStatus.perfect
};

describe('ProgressPill', () => {
  throwOnConsoleWarnings();
  throwOnConsoleErrors();

  it('can render an unplugged pill', () => {
    shallow(
      <ProgressPill
        levels={[unpluggedLevel]}
        text="Unplugged Activity"
      />
    );
  });

  it('renders a provided tooltip', () => {
    const tooltip = <ReactTooltip id="123"/>;

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
});
