import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import sinon from 'sinon';
import queryString from 'query-string';
import NewProgrammingClassForm from '@cdo/apps/lib/levelbuilder/code-docs-editor/NewProgrammingClassForm';

describe('NewProgrammingClassForm', () => {
  it('renders form', () => {
    const wrapper = shallow(
      <NewProgrammingClassForm
        programmingEnvironmentsForSelect={[
          {id: 1, name: 'gamelab'},
          {id: 2, name: 'spritelab'}
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

  it('uses query param to determine default programming environment', () => {
    const queryStringSpy = sinon
      .stub(queryString, 'parse')
      .returns({programming_environment: 'spritelab'});

    const wrapper = shallow(
      <NewProgrammingClassForm
        programmingEnvironmentsForSelect={[
          {id: 1, name: 'gamelab'},
          {id: 2, name: 'spritelab'}
        ]}
      />
    );

    const programmingEnvironmentSelect = wrapper.find('select');
    expect(programmingEnvironmentSelect.props().defaultValue).to.equal(2);

    queryStringSpy.restore();
  });
});
