import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {UnconnectedProgressLevelSet as ProgressLevelSet} from '@cdo/apps/templates/progress/ProgressLevelSet';
import {
  fakeLevels,
  fakeLevel,
} from '@cdo/apps/templates/progress/progressTestHelpers';

describe('ProgressLevelSet', function () {
  it('has a pill and no bubbles for a single level', () => {
    const wrapper = shallow(
      <ProgressLevelSet
        name="My Level Name"
        levels={fakeLevels(1)}
        disabled={false}
      />
    );

    expect(wrapper.find('Connect(ProgressPill)').length).toEqual(1);
    expect(wrapper.find('Connect(ProgressBubbleSet)').length).toEqual(0);
    expect(wrapper.find('Connect(ProgressPill)').props().text).toEqual('1');
  });

  it('has a pill and no link for a single level with an onBubbleClick prop', () => {
    const wrapper = shallow(
      <ProgressLevelSet
        name="My Level Name"
        levels={fakeLevels(1)}
        disabled={false}
        onBubbleClick={() => {}}
      />
    );

    expect(wrapper.find('Connect(ProgressPill)').length).toEqual(1);
    expect(wrapper.find('Connect(ProgressBubbleSet)').length).toEqual(0);
    expect(wrapper.find('Connect(ProgressPill)').props().text).toEqual('1');
    expect(wrapper.find('a').props().href).not.toBeDefined();
  });

  it('has a pill and bubbles when we have multiple levels', () => {
    const wrapper = shallow(
      <ProgressLevelSet
        name="My Progression Name"
        levels={fakeLevels(3)}
        disabled={false}
      />
    );

    expect(wrapper.find('Connect(ProgressPill)').length).toEqual(1);
    expect(wrapper.find('Connect(ProgressBubbleSet)').length).toEqual(1);
    expect(wrapper.find('Connect(ProgressPill)').props().text).toEqual('1-3');
  });

  it('renders a pill with no text when first level is unplugged', () => {
    const wrapper = shallow(
      <ProgressLevelSet
        name={undefined}
        levels={[fakeLevel({isUnplugged: true}), ...fakeLevels(5)].map(
          level => ({...level, name: undefined})
        )}
        disabled={false}
      />
    );
    expect(wrapper.find('Connect(ProgressPill)').props().text).toEqual('');
  });

  it('renders a pill with no text when last level is unplugged', () => {
    const wrapper = shallow(
      <ProgressLevelSet
        name={undefined}
        levels={[...fakeLevels(5), fakeLevel({isUnplugged: true})].map(
          level => ({...level, name: undefined})
        )}
        disabled={false}
      />
    );
    expect(wrapper.find('Connect(ProgressPill)').props().text).toEqual('');
  });

  it('renders a pill with unplugged text when only level is unplugged', () => {
    const wrapper = shallow(
      <ProgressLevelSet
        name={undefined}
        levels={[fakeLevel({isUnplugged: true})].map(level => ({
          ...level,
          name: undefined,
        }))}
        disabled={false}
      />
    );
    expect(wrapper.find('Connect(ProgressPill)').props().text).toEqual(
      'Unplugged Activity'
    );
  });
});
