import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import NewProgrammingClassForm from '@cdo/apps/lib/levelbuilder/code-docs-editor/NewProgrammingClassForm';

describe('NewProgrammingClassForm', () => {
  it('renders form', () => {
    const wrapper = shallow(
      <NewProgrammingClassForm
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
