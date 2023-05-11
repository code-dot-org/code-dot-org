import React, {useState} from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import MultiSelectGroup from '@cdo/apps/templates/teacherDashboard/MultiSelectGroup';
import PropTypes from 'prop-types';
import {multiSelectOptionShape} from '@cdo/apps/templates/teacherDashboard/shapes';

// This component is an integrated example for the <MultiSelectGroup>.
// It needs to be its own component so that it adheres to React hooks
// linting (i.e., this can't be a template or the exported story itself).
const BasicExampleComponent = props => {
  const [values, setValues] = useState([]);

  return <MultiSelectGroup values={values} setValues={setValues} {...props} />;
};
BasicExampleComponent.propTypes = {
  options: PropTypes.arrayOf(multiSelectOptionShape).isRequired,
};

describe('MultiSelectGroup', () => {
  it('toggles required on checkboxes correctly', () => {
    const wrapper = mount(
      <BasicExampleComponent
        label="Pick at least one"
        name="test_name"
        required={true}
        options={[
          {
            label: 'test 1',
            value: 'test-value-1',
          },
          {
            label: 'test 2',
            value: 'test-value-2',
          },
        ]}
      />
    );

    const checkbox1 = () => wrapper.find('input[type="checkbox"]').at(0);
    const checkbox2 = () => wrapper.find('input[type="checkbox"]').at(1);
    const check = checkbox =>
      checkbox().simulate('change', {
        target: {setCustomValidity: () => {}, checked: true},
      });
    const uncheck = checkbox =>
      checkbox().simulate('change', {
        target: {setCustomValidity: () => {}, checked: false},
      });

    expect(checkbox1().exists()).to.be.true;
    expect(checkbox2().exists()).to.be.true;

    expect(checkbox1().prop('required')).to.be.true;
    expect(checkbox2().prop('required')).to.be.true;

    check(checkbox1);
    expect(checkbox1().prop('required')).to.be.false;
    expect(checkbox2().prop('required')).to.be.false;

    check(checkbox2);
    expect(checkbox1().prop('required')).to.be.false;
    expect(checkbox2().prop('required')).to.be.false;

    uncheck(checkbox1);
    expect(checkbox1().prop('required')).to.be.false;
    expect(checkbox2().prop('required')).to.be.false;

    uncheck(checkbox2);
    expect(checkbox1().prop('required')).to.be.true;
    expect(checkbox2().prop('required')).to.be.true;
  });
});
