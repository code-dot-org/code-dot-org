import type {Meta, StoryObj} from '@storybook/react';

import FormFieldWrapper, {FormFieldWrapperProps} from '..';

type Story = StoryObj<typeof FormFieldWrapper> & {
  args: FormFieldWrapperProps | FormFieldWrapperProps[];
};

export default {
  title: 'DesignSystem/FormFieldWrapper',
  component: FormFieldWrapper,
  render: args => {
    const components = args[0] ? Object.values(args) : [args];
    return (
      <div style={{display: 'flex', gap: '1em'}}>
        {components.map((component, index) => (
          <FormFieldWrapper key={index} {...component} />
        ))}
      </div>
    );
  },
} as Meta;

const defaultArgs: FormFieldWrapperProps = {
  label: 'Label text',
  children: <input type="text" placeholder="Child component" />,
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

export const Default: Story = {
  args: {
    ...defaultArgs,
  },
};

export const WithHelperMessage: Story = {
  args: {
    ...defaultArgs,
    helperMessage: 'Helper message',
  },
};

export const WithHelperIconAndMessage: Story = {
  args: {
    ...defaultArgs,
    helperMessage: 'Helper message',
    helperIcon: {iconName: 'tag'},
  },
};

export const WithError: Story = {
  args: {
    ...defaultArgs,
    errorMessage: 'Error message',
  },
};

export const WithDisabledChildElement: Story = {
  args: defaultComponents.map(component => ({
    ...component,
    children: <input type="text" disabled />,
  })),
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
};

export const Sizes: Story = {
  args: [
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

export const Black: Story = {
  args: defaultComponents.map(component => ({
    ...component,
    color: 'black',
  })),
};

export const Gray: Story = {
  args: defaultComponents.map(component => ({
    ...component,
    color: 'gray',
  })),
};

export const White: Story = {
  args: defaultComponents.map(component => ({
    ...component,
    color: 'white',
  })),
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
};
