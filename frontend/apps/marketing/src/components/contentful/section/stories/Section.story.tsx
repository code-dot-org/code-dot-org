import type {Meta, StoryObj} from '@storybook/nextjs-vite';

import Section from '../Section';

const meta: Meta<typeof Section> = {
  title: 'Marketing/Section',
  component: Section,
  tags: ['autodocs', 'marketing'],
};
export default meta;
type Story = StoryObj<typeof Section>;

const backgrounds = [
  'primary',
  'secondary',
  'dark',
  'brandPrimary',
  'brandLightPrimary',
  'brandSecondary',
  'brandLightSecondary',
  'brandTertiary',
  'brandLightTertiary',
  'patternDark',
  'patternPrimary',
  'transparent',
] as const;
const paddings = ['m', 'l'] as const;
const themes = ['Light', 'Dark'] as const;
const dividers = ['none', 'primary', 'strong'] as const;

const createStory = (background: (typeof backgrounds)[number]): Story => ({
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      {paddings.flatMap(padding =>
        themes.flatMap(themeOpt =>
          dividers.map(divider => (
            <Section
              key={`${background}-${padding}-${themeOpt}-${divider}`}
              background={background}
              padding={padding}
              theme={themeOpt}
              divider={divider}
              id={`${background}-${padding}-${themeOpt}-${divider}`}
              className="storybook-section"
            >
              {`Section | background: ${background} | padding: ${padding} | theme: ${themeOpt} | divider: ${divider}`}
            </Section>
          )),
        ),
      )}
    </div>
  ),
});

// Example usage for each background:
export const Primary = createStory('primary');
export const Secondary = createStory('secondary');
export const Dark = createStory('dark');
export const BrandPrimary = createStory('brandPrimary');
export const BrandLightPrimary = createStory('brandLightPrimary');
export const BrandSecondary = createStory('brandSecondary');
export const BrandLightSecondary = createStory('brandLightSecondary');
export const BrandTertiary = createStory('brandTertiary');
export const BrandLightTertiary = createStory('brandLightTertiary');
export const PatternDark = createStory('patternDark');
export const PatternPrimary = createStory('patternPrimary');
export const Transparent = createStory('transparent');

export const Playground: Story = {
  args: {
    background: 'primary',
    padding: 'l',
    theme: 'Light',
    divider: 'none',
    id: 'playground-section',
    className: '',
    children: 'Playground Section',
  },
  argTypes: {
    background: {control: 'select', options: backgrounds},
    padding: {control: 'select', options: paddings},
    theme: {control: 'select', options: themes},
    divider: {control: 'select', options: dividers},
    id: {control: 'text'},
    className: {control: 'text'},
    children: {control: 'text'},
  },
};
