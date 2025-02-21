import {Meta, StoryFn} from '@storybook/react';

import FormFieldWrapper, {FormFieldWrapperProps} from '../index';

export default {
  title: 'DesignSystem/FormFieldWrapper',
  component: FormFieldWrapper,
} as Meta;

const defaultArgs = {
  label: 'Label text',
  children: <input type="text" value="Child component" />,
};

const defaultComponents: FormFieldWrapperProps[] = [
  {
    ...defaultArgs,
  },
  {
    ...defaultArgs,
    helperMessage: 'Helper message',
    helperIcon: {iconName: 'tag'},
  },
  {
    ...defaultArgs,
    errorMessage: 'Error message',
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

export const WithHelperMessage = SingleTemplate.bind({});
WithHelperMessage.args = {
  ...defaultArgs,
  helperMessage: 'Helper message',
};

export const WithHelperIconAndMessage = SingleTemplate.bind({});
WithHelperIconAndMessage.args = {
  ...defaultArgs,
  helperMessage: 'Helper message',
  helperIcon: {iconName: 'tag'},
};

export const WithError = SingleTemplate.bind({});
WithError.args = {
  ...defaultArgs,
  errorMessage: 'Error message',
};

export const WithDisabledChildElement = MultipleTemplate.bind({});
WithDisabledChildElement.args = {
  components: defaultComponents.map(component => ({
    ...component,
    children: <input type="text" disabled />,
  })),
};
WithDisabledChildElement.parameters = {
  backgrounds: {
    default: 'dark',
  },
};

export const Sizes = MultipleTemplate.bind({});
Sizes.args = {
  components: [
    {
      ...defaultArgs,
      size: 's',
      label: 'S Label text',
      helperMessage: 'S Helper message',
      helperIcon: {iconName: 'tag'},
    },
    {
      ...defaultArgs,
      size: 'm',
      label: 'M Label text',
      helperMessage: 'M Helper message',
      helperIcon: {iconName: 'tag'},
    },
    {
      ...defaultArgs,
      size: 'l',
      label: 'L Label text',
      helperMessage: 'L Helper message',
      helperIcon: {iconName: 'tag'},
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
