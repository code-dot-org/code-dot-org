import React, {useState, useCallback} from 'react';
import RadioButton from './index';

export default {
  title: 'DesignSystem/Radio Button Component',
  component: RadioButton,
};

//
// TEMPLATE
//
// This is needed to fix children type error (passing string instead of React.ReactNode type)
// eslint-disable-next-line
const MultipleTemplate = (args = []) => {
  const componentArgs = args.components || [];
  const initialValues = componentArgs.reduce((acc = {}, componentArg) => {
    acc[componentArg.name] = false;
    return acc;
  });
  const [values, setValue] = useState(initialValues || {});

  const onChange = useCallback(
    e => {
      const {name} = e.target;
      console.log('clicked', name);
      setValue({...initialValues, [name]: true});
    },
    [setValue, initialValues]
  );
  return (
    <>
      {args.components?.map(componentArg => (
        <RadioButton
          key={componentArg.name}
          {...componentArg}
          checked={values[componentArg.name]}
          onChange={onChange}
        />
      ))}
    </>
  );
};
export const DefaultRadioButton = MultipleTemplate.bind({});
DefaultRadioButton.args = {
  components: [
    {name: 'radio1', label: 'RadioButton 1'},
    {name: 'radio2', label: 'RadioButton 2'},
  ],
};

export const DisabledRadioButton = MultipleTemplate.bind({});
DisabledRadioButton.args = {
  components: [
    {name: 'test-disabled', label: 'Disabled radioButton', disabled: true},
    {
      name: 'test-disabled-checked',
      label: 'Disabled checked radioButton',
      checked: true,
      disabled: true,
    },
  ],
};

export const SizesOfRadioButton = MultipleTemplate.bind({});
SizesOfRadioButton.args = {
  components: [
    {name: 'test-xs', label: 'Label - XS', size: 'xs'},
    {name: 'test-s', label: 'Label - S', size: 's'},
    {name: 'test-m', label: 'Label - M', size: 'm'},
    {name: 'test-l', label: 'Label - L', size: 'l'},
  ],
};
