import {GlobalFooterProps} from '@/components/footer/common/types';
import FooterCorporateSite from '@/components/footer/corporateSite';
import FooterCSforAll from '@/components/footer/csForAll'; // Adjust import path as needed
import {SupportedLocale} from '@/config/locale';
import {Meta, StoryObj} from '@storybook/react';

const meta: Meta = {
  title: 'Marketing/Footer',
  tags: ['marketing'],
  parameters: {
    disableSectionDecorator: true,
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/',
        query: {},
      },
    },
  },
};

export default meta;

const defaultArgs: Partial<GlobalFooterProps> = {
  locale: SupportedLocale['en-US'],
};

export const CorporateSite: StoryObj<typeof FooterCorporateSite> = {
  render: args => <FooterCorporateSite {...args} />,
  args: {
    ...defaultArgs,
  },
  parameters: {
    eyes: {
      themes: ['code.org'],
    },
  },
};

export const CSForAll: StoryObj<typeof FooterCSforAll> = {
  render: args => <FooterCSforAll {...args} />,
  args: {
    ...defaultArgs,
  },
  parameters: {
    eyes: {
      browser: [
        {width: 1400, height: 768, name: 'chrome'},
        {width: 1400, height: 768, name: 'firefox'},
        {width: 1400, height: 768, name: 'safari'},
      ],
    },
  },
};
