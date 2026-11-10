import {Meta, StoryFn} from '@storybook/react-vite';
import {useState} from 'react';

import FontAwesomeV6Icon from '@/fontAwesomeV6Icon';

import CardButton, {CardButtonProps} from '../CardButton';

// `containerWidth` is story-only: it sizes a wrapper so a `fullWidth` card can
// be shown at Figma's canvas width.
type CardButtonStoryArgs = CardButtonProps & {containerWidth?: number};

export default {
  title: 'DesignSystem/CardButton',
  component: CardButton,
  parameters: {
    docs: {
      description: {
        component:
          'A clickable card for actions, navigation and choices that need more presence than a Button. Horizontal rows or vertical tiles, with a selected state for single-select groups.',
      },
    },
  },
  argTypes: {
    layout: {control: 'radio', options: ['horizontal', 'vertical']},
    size: {control: 'radio', options: ['medium', 'small']},
    title: {control: 'text'},
    description: {control: 'text'},
    selected: {control: 'boolean'},
    disabled: {control: 'boolean'},
    fullWidth: {control: 'boolean'},
    startIcon: {control: 'object'},
    endIcon: {control: 'object'},
    startIconColor: {control: 'text'},
    startContent: {control: false},
    containerWidth: {control: {type: 'number', min: 120, step: 10}},
    onClick: {action: 'clicked'},
  },
} as Meta<CardButtonStoryArgs>;

const Template: StoryFn<CardButtonStoryArgs> = ({containerWidth, ...args}) => (
  <div style={containerWidth ? {width: Number(containerWidth)} : undefined}>
    <CardButton {...args} />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  layout: 'horizontal',
  size: 'medium',
  title: 'Card button title',
  startIcon: {iconName: 'face-smile'},
  endIcon: {iconName: 'chevron-right'},
};

export const WithDescription = Template.bind({});
WithDescription.args = {
  ...Default.args,
  title: 'AI Foundations',
  description: 'Lesson 1: Prompting AI',
  startIcon: {iconName: 'fire'},
  fullWidth: true,
  containerWidth: 451,
};

export const Vertical = Template.bind({});
Vertical.args = {
  layout: 'vertical',
  size: 'medium',
  title: 'Card button title',
  description: 'Supporting description text',
  startIcon: {iconName: 'face-smile'},
};

export const WithStartContent = Template.bind({});
WithStartContent.args = {
  layout: 'horizontal',
  size: 'medium',
  endIcon: {iconName: 'chevron-right'},
  title: 'Web Apps',
  description: 'Lesson 1: Welcome to Web Apps',
  fullWidth: true,
  containerWidth: 451,
  startContent: (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 48,
        height: 48,
        borderRadius: 24,
        background: 'var(--background-neutral-primary-inverse)',
        color: 'var(--text-neutral-primary-inverse)',
        fontSize: 24,
      }}
    >
      <FontAwesomeV6Icon iconName="ghost" aria-hidden />
    </span>
  ),
};

export const AsLink = Template.bind({});
AsLink.args = {
  ...Default.args,
  title: 'Go to the next lesson',
  endIcon: {iconName: 'arrow-right'},
  href: '#',
};

export const AllVariants = () => (
  <div style={{display: 'grid', gap: '1.5rem'}}>
    {(['horizontal', 'vertical'] as const).map(layout =>
      (['medium', 'small'] as const).map(size => (
        <div
          key={`${layout}-${size}`}
          style={{display: 'flex', flexWrap: 'wrap', gap: '1rem'}}
        >
          {[
            {label: 'Default'},
            {label: 'Selected', selected: true},
            {label: 'Disabled', disabled: true},
            {label: 'Selected disabled', selected: true, disabled: true},
          ].map(({label, ...state}) => (
            <div
              key={label}
              style={{width: layout === 'horizontal' ? 360 : 200}}
            >
              <CardButton
                {...state}
                {...(layout === 'horizontal'
                  ? {layout, endIcon: {iconName: 'chevron-right'}}
                  : {layout})}
                fullWidth
                size={size}
                title={`${label} ${size}`}
                description="Supporting description text"
                startIcon={{iconName: 'face-smile'}}
              />
            </div>
          ))}
        </div>
      )),
    )}
  </div>
);

export const StartIconColors = () => (
  <div style={{display: 'grid', gap: 8, width: 360}}>
    {[
      {title: 'Practice', icon: 'dumbbell', color: 'var(--text-info-primary)'},
      {
        title: 'Challenge',
        icon: 'trophy',
        color: 'var(--text-warning-secondary)',
      },
      {title: 'Explore', icon: 'compass', color: 'var(--text-success-primary)'},
    ].map(({title, icon, color}) => (
      <CardButton
        key={title}
        fullWidth
        title={title}
        startIcon={{iconName: icon}}
        startIconColor={color}
        endIcon={{iconName: 'chevron-right'}}
      />
    ))}
    <CardButton
      fullWidth
      selected
      title="Selected ignores the color"
      startIcon={{iconName: 'compass'}}
      startIconColor="var(--text-success-primary)"
    />
  </div>
);

export const SingleSelectGroup = () => {
  const [mode, setMode] = useState('practice');
  const options = [
    {value: 'practice', title: 'Practice', icon: 'dumbbell'},
    {value: 'challenge', title: 'Challenge', icon: 'trophy'},
    {value: 'explore', title: 'Explore', icon: 'compass'},
  ];
  return (
    <div
      role="group"
      aria-label="Choose a mode"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 140px)',
        gap: 16,
      }}
    >
      {options.map(option => (
        <CardButton
          key={option.value}
          layout="vertical"
          size="small"
          fullWidth
          title={option.title}
          startIcon={{iconName: option.icon}}
          selected={mode === option.value}
          onClick={() => setMode(option.value)}
        />
      ))}
    </div>
  );
};
