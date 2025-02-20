import {Meta, StoryFn} from '@storybook/react';

import FormFieldWrapper, {FormFieldWrapperProps} from '../index';

export default {
  title: 'DesignSystem/FormFieldWrapper',
  component: FormFieldWrapper,
} as Meta;

const defaultArgs = {
  children: <input type="text" value="Child component" />,
};

const defaultComponents: FormFieldWrapperProps[] = [
  {
    ...defaultArgs,
    label: 'Label text',
  },
  {
    ...defaultArgs,
    helper: {text: 'Helper message', icon: {iconName: 'tag'}},
  },
  {
    ...defaultArgs,
    error: 'Error message',
  },
];

//
// TEMPLATE
//
const SingleTemplate: StoryFn<FormFieldWrapperProps> = args => (
  <FormFieldWrapper {...args} />
);
const MultipleTemplate: StoryFn<{
  components: FormFieldWrapperProps[];
}> = args => (
  <div style={{display: 'flex', gap: '1rem'}}>
    {args.components?.map((componentArg, index) => (
      <FormFieldWrapper key={index} {...componentArg} />
    ))}
  </div>
);

export const Default = SingleTemplate.bind({});
Default.args = {
  ...defaultArgs,
};

export const WithLabel = SingleTemplate.bind({});
WithLabel.args = {
  ...defaultArgs,
  label: 'FormFieldWrapper label',
};

export const WithHelperMessage = SingleTemplate.bind({});
WithHelperMessage.args = {
  ...defaultArgs,
  helper: {text: 'Helper message'},
};

export const WithHelperIconAndMessage = SingleTemplate.bind({});
WithHelperIconAndMessage.args = {
  ...defaultArgs,
  helper: {text: 'Helper message', icon: {iconName: 'tag'}},
};

export const WithError = SingleTemplate.bind({});
WithError.args = {
  ...defaultArgs,
  error: 'Error message',
};

export const WithDisabledChildElement = MultipleTemplate.bind({});
WithDisabledChildElement.args = {
  components: defaultComponents.map(component => ({
    ...component,
    children: <input type="text" value="Disabled child field" disabled />,
  })),
};

export const Sizes = MultipleTemplate.bind({});
Sizes.args = {
  components: [
    {
      ...defaultArgs,
      size: 's',
      label: 'S Label text',
      helper: {text: 'S Helper message', icon: {iconName: 'tag'}},
    },
    {
      ...defaultArgs,
      size: 'm',
      label: 'M Label text',
      helper: {text: 'M Helper message', icon: {iconName: 'tag'}},
    },
    {
      ...defaultArgs,
      size: 'l',
      label: 'L Label text',
      helper: {text: 'L Helper message', icon: {iconName: 'tag'}},
    },
  ],
};

export const Black = MultipleTemplate.bind({});
Black.args = {
  components: defaultComponents.map(component => ({
    ...component,
    color: 'black',
  })),
};

export const Gray = MultipleTemplate.bind({});
Gray.args = {
  components: defaultComponents.map(component => ({
    ...component,
    color: 'gray',
  })),
};

export const White = MultipleTemplate.bind({});
White.args = {
  components: defaultComponents.map(component => ({
    ...component,
    color: 'white',
  })),
};
White.parameters = {
  backgrounds: {
    default: 'dark',
  },
};
