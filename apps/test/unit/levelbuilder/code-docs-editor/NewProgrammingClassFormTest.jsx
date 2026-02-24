import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import NewProgrammingClassForm from '@cdo/apps/levelbuilder/code-docs-editor/NewProgrammingClassForm';

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

    expect(wrapper.find('input').props().required).toBe(true);

    const programmingEnvironmentSelect = wrapper.find('select');
    expect(programmingEnvironmentSelect.props().required).toBe(true);
    expect(
      programmingEnvironmentSelect.find('option').map(env => env.props().value)
    ).toEqual([1, 2]);
  });
});
