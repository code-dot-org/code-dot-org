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

  it('holds the two-line layout, width and height in flow before the saved-at line arrives', () => {
    const inFlow = shallow(<ScriptName {...NAME} />);
    const column = inFlow.find('.script_name').childAt(0).childAt(0);
    expect(column.prop('style')).toMatchObject({width: 160});
    expect(column.childAt(1).prop('style')).toMatchObject({height: 14});
    const measured = shallow(<ScriptName {...NAME} width={100} />);
    expect(measured.find('.script_name').parent().prop('style').height).toBe(
      18
    );
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
