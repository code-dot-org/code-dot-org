import React, {useState} from 'react';
import MultiSelectGroup from './MultiSelectGroup';

export default {
  title: 'MultiSelectGroup',
  component: MultiSelectGroup
};

const Template = args => {
  const [values, setValues] = useState(
    Object.fromEntries(args.options.map(o => [o.value, false]))
  );
  const allArgs = {
    ...args,
    values: values,
    setValues: setValues
  };

  return <MultiSelectGroup {...allArgs} />;
};

export const NotRequired = Template.bind({});
NotRequired.args = {
  label: 'Pick some, if you want',
  name: 'test_name',
  options: [
    {
      label: 'test 1',
      value: 'test-value-1'
    },
    {
      label: 'test 2',
      value: 'test-value-2'
    }
  ]
};

export const Required = Template.bind({});
Required.args = {
  label: 'Pick at least one',
  name: 'test_name',
  required: true,
  options: [
    {
      label: 'test 1',
      value: 'test-value-1'
    },
    {
      label: 'test 2',
      value: 'test-value-2'
    }
  ]
};
