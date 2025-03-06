import type {Meta, StoryObj} from '@storybook/react';
import {within, expect} from '@storybook/test';

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

const getComputedStylePropValue = (property: string) =>
  window.getComputedStyle(document.body).getPropertyValue(property);

export const Playground: Story = {
  args: {
    ...defaultArgs,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const expectedColor = getComputedStylePropValue('--text-neutral-primary');

    const labelText = canvas.getByText('Label text');

    expect(labelText).toHaveStyle(`color: ${expectedColor};`);
  },
};

export const WithHelperMessage: Story = {
  args: {
    ...defaultArgs,
    helperMessage: 'Helper message',
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const expectedColor = getComputedStylePropValue('--text-neutral-primary');

    const helperMessage = canvas.getByText('Helper message');

    expect(helperMessage).toHaveStyle(`color: ${expectedColor};`);
  },
};

export const WithHelperIconAndMessage: Story = {
  args: {
    ...defaultArgs,
    helperMessage: 'Helper message',
    helperIcon: {iconName: 'tag'},
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const expectedColor = getComputedStylePropValue('--text-neutral-primary');

    const helperMessage = canvas.getByText('Helper message');
    const helperIcon = helperMessage.previousElementSibling;

    expect(helperIcon).toHaveStyle(`color: ${expectedColor};`);
    expect(helperMessage).toHaveStyle(`color: ${expectedColor};`);
  },
};

export const WithError: Story = {
  args: {
    ...defaultArgs,
    errorMessage: 'Error message',
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const expectedColor = getComputedStylePropValue('--text-error-primary');

    const errorMessage = canvas.getByText('Error message');
    const errorIcon = errorMessage.previousElementSibling;

    expect(errorIcon).toHaveStyle(`color: ${expectedColor};`);
    expect(errorMessage).toHaveStyle(`color: ${expectedColor};`);
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
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const expectedColor = getComputedStylePropValue('--text-neutral-disabled');

    const labelText = canvas.getAllByText('Label text')[0];
    const helperMessage = canvas.getByText('Helper message');
    const helperIcon = helperMessage.previousElementSibling;
    const errorMessage = canvas.getByText('Error message');
    const errorIcon = errorMessage.previousElementSibling;

    expect(labelText).toHaveStyle(`color: ${expectedColor};`);
    expect(helperIcon).toHaveStyle(`color: ${expectedColor};`);
    expect(helperMessage).toHaveStyle(`color: ${expectedColor};`);
    expect(errorIcon).toHaveStyle(`color: ${expectedColor};`);
    expect(errorMessage).toHaveStyle(`color: ${expectedColor};`);
    expect(helperIcon).toHaveStyle(`color: ${expectedColor};`);
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
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const sLabelText = canvas.getAllByText('S Label text')[0];
    const sHelperMessage = canvas.getByText('S Helper message');
    const sHelperIcon = sHelperMessage.previousElementSibling;

    expect(sLabelText).toHaveStyle('font-size: 12px;');
    expect(sLabelText).toHaveStyle('line-height: 19.68px;');
    expect(sHelperMessage).toHaveStyle('font-size: 13.008px;');
    expect(sHelperMessage).toHaveStyle('line-height: 21.3331px;');
    expect(sHelperIcon).toHaveStyle('font-size: 13.008px;');
    expect(sHelperIcon).toHaveStyle('line-height: 13.008px;');

    const mLabelText = canvas.getAllByText('M Label text')[0];
    const mHelperMessage = canvas.getByText('M Helper message');
    const mHelperIcon = mHelperMessage.previousElementSibling;

    expect(mLabelText).toHaveStyle('font-size: 14px;');
    expect(mLabelText).toHaveStyle('line-height: 21.56px;');
    expect(mHelperMessage).toHaveStyle('font-size: 14px;');
    expect(mHelperMessage).toHaveStyle('line-height: 21.56px;');
    expect(mHelperIcon).toHaveStyle('font-size: 14px;');
    expect(mHelperIcon).toHaveStyle('line-height: 14px;');

    const lLabelText = canvas.getAllByText('L Label text')[0];
    const lHelperMessage = canvas.getByText('L Helper message');
    const lHelperIcon = lHelperMessage.previousElementSibling;

    expect(lLabelText).toHaveStyle('font-size: 16px;');
    expect(lLabelText).toHaveStyle('line-height: 23.68px;');
    expect(lHelperMessage).toHaveStyle('font-size: 16px;');
    expect(lHelperMessage).toHaveStyle('line-height: 23.68px;');
    expect(lHelperIcon).toHaveStyle('font-size: 16px;');
    expect(lHelperIcon).toHaveStyle('line-height: 16px;');
  },
};

export const Colors: Story = {
  args: [
    {
      ...defaultArgs,
      color: 'black',
      label: 'Black Label text',
      errorMessage: 'Black Error message',
    },
    {
      ...defaultArgs,
      color: 'gray',
      label: 'Gray Label text',
      errorMessage: 'Gray Error message',
    },
    {
      ...defaultArgs,
      color: 'white',
      label: 'White Label text',
      errorMessage: 'White Error message',
    },
  ],
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const defaultTextColor = getComputedStylePropValue(
      '--text-neutral-primary',
    );
    const defaultErrorColor = getComputedStylePropValue('--text-error-primary');
    const whiteTextColor = getComputedStylePropValue('--text-neutral-inverse');

    const blackLabelText = canvas.getByText('Black Label text');
    const blackErrorMessage = canvas.getByText('Black Error message');
    const blackErrorIcon = blackErrorMessage.previousElementSibling;

    expect(blackLabelText).toHaveStyle(`color: ${defaultTextColor};`);
    expect(blackErrorIcon).toHaveStyle(`color: ${defaultErrorColor};`);
    expect(blackErrorMessage).toHaveStyle(`color: ${defaultErrorColor};`);

    const grayLabelText = canvas.getByText('Gray Label text');
    const grayErrorMessage = canvas.getByText('Gray Error message');
    const grayErrorIcon = grayErrorMessage.previousElementSibling;

    expect(grayLabelText).toHaveStyle(`color: ${defaultTextColor};`);
    expect(grayErrorMessage).toHaveStyle(`color: ${defaultErrorColor};`);
    expect(grayErrorIcon).toHaveStyle(`color: ${defaultErrorColor};`);

    const whiteLabelText = canvas.getByText('White Label text');
    const whiteErrorMessage = canvas.getByText('White Error message');
    const whiteErrorIcon = whiteErrorMessage.previousElementSibling;

    expect(whiteLabelText).toHaveStyle(`color: ${whiteTextColor};`);
    expect(whiteErrorMessage).toHaveStyle(`color: ${whiteTextColor};`);
    expect(whiteErrorIcon).toHaveStyle(`color: ${whiteTextColor};`);
  },
};
