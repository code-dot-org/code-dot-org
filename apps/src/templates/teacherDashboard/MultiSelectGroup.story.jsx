import React, {useState} from 'react';
import MultiSelectGroup from './MultiSelectGroup';
import PropTypes from 'prop-types';
import {multiSelectOptionShape} from './shapes';

export default {
  title: 'MultiSelectGroup',
  component: MultiSelectGroup,
};

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

const Template = args => {
  return <BasicExampleComponent {...args} />;
};

export const NotRequired = Template.bind({});
NotRequired.args = {
  label: 'Pick some, if you want',
  name: 'test_name',
  options: [
    {
      label: 'test 1',
      value: 'test-value-1',
    },
    {
      label: 'test 2',
      value: 'test-value-2',
    },
  ],
};

export const Required = Template.bind({});
Required.args = {
  label: 'Pick at least one',
  name: 'test_name',
  required: true,
  options: [
    {
      label: 'test 1',
      value: 'test-value-1',
    },
    {
      label: 'test 2',
      value: 'test-value-2',
    },
  ],
};
