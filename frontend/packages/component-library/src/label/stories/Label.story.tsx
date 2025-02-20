import {Meta, StoryFn} from '@storybook/react';
import {capitalize} from 'lodash';

import Label, {LabelProps, labelColors, labelSizes} from '../Label';

export default {
  title: 'DesignSystem/Label',
  component: Label,
} as Meta;

const defaultArgs = {
  text: 'Label text',
  children: <input type="text" value="Label child" />,
};

const defaultComponents: LabelProps[] = [
  {
    ...defaultArgs,
  },
  {
    ...defaultArgs,
    text: 'Label with helper',
    helper: {text: 'Helper text', icon: {iconName: 'tag'}},
  },
  {
    ...defaultArgs,
    text: 'Label with error',
    error: 'Error message',
  },
];

interface LabelsProps extends LabelProps {
  components: LabelProps[];
}

const Template: StoryFn<LabelProps> = args => <Label {...args} />;
const Templates: StoryFn<LabelsProps> = ({
  components = defaultComponents,
  ...args
}) => (
  <>
    {components.map((componentArg, index) => (
      <Label key={index} {...componentArg} {...args} />
    ))}
  </>
);

export const Default = Template.bind({});
Default.args = {
  ...defaultArgs,
};

export const WithHelperMessage = Template.bind({});
WithHelperMessage.args = {
  ...defaultArgs,
  helper: {text: 'Helper text'},
};

export const WithHelperIconAndMessage = Template.bind({});
WithHelperIconAndMessage.args = {
  ...defaultArgs,
  helper: {text: 'Helper text', icon: {iconName: 'tag'}},
};

export const WithError = Template.bind({});
WithError.args = {
  ...defaultArgs,
  error: 'Error message',
};

export const WithDisabledChildElement = Templates.bind({});
WithDisabledChildElement.args = {
  children: <input type="text" value="Disabled child field" disabled />,
};

export const Sizes = Templates.bind({});
Sizes.args = {
  components: Object.values(labelSizes).map(size => ({
    ...defaultArgs,
    size,
    text: `${capitalize(size)} Label`,
  })),
  helper: {text: 'Helper text', icon: {iconName: 'tag'}},
};

export const Black = Templates.bind({});
Black.args = {
  color: labelColors.black,
};

export const Gray = Templates.bind({});
Gray.args = {
  color: labelColors.gray,
};

export const White = Templates.bind({});
White.args = {
  color: labelColors.white,
};
White.parameters = {
  backgrounds: {
    default: 'dark',
  },
};
