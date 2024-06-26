import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import NewProgrammingExpressionForm from '@cdo/apps/lib/levelbuilder/code-docs-editor/NewProgrammingExpressionForm';

import {expect} from '../../../../util/reconfiguredChai';

describe('NewProgrammingExpressionForm', () => {
  it('renders form', () => {
    const wrapper = shallow(
      <NewProgrammingExpressionForm
        programmingEnvironmentsForSelect={[
          {id: 1, name: 'gamelab'},
          {id: 2, name: 'spritelab'},
        ]}
      />
    );

    expect(wrapper.find('input').props().required).to.be.true;

    const programmingEnvironmentSelect = wrapper.find('select');
    expect(programmingEnvironmentSelect.props().required).to.be.true;
    expect(
      programmingEnvironmentSelect.find('option').map(env => env.props().value)
    ).to.eql([1, 2]);
  });
});
