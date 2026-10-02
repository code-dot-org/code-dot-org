import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {UnconnectedScriptName as ScriptName} from '@cdo/apps/code-studio/components/header/ScriptName';

const NAME = {name: 'hoai2026 dev', href: '/s/hoai2026-dev'};

describe('ScriptName', () => {
  it('ellipsizes in flow when the header gives it no width', () => {
    const wrapper = shallow(<ScriptName {...NAME} showProjectUpdatedAt />);
    expect(wrapper.find('a').prop('style')).toMatchObject({
      textOverflow: 'ellipsis',
      maxWidth: '100%',
    });
    expect(wrapper.find('.script_name').prop('style').position).toBeUndefined();
  });

  it('is laid out from outside when the header gives it a width', () => {
    const wrapper = shallow(
      <ScriptName {...NAME} showProjectUpdatedAt width={100} />
    );
    expect(wrapper.find('.script_name').prop('style').position).toBe(
      'absolute'
    );
  });
});
