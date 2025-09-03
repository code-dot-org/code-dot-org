import {GlobalFooterProps} from '@/components/footer/common/types';
import FooterCSforAll from '@/components/footer/csForAll';
import {SupportedLocale} from '@/config/locale';
import {Meta, StoryObj} from '@storybook/react';

const meta: Meta<typeof FooterCSforAll> = {
  title: 'Marketing/Footer/CSforAll',
  component: FooterCSforAll,
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
type Story = StoryObj<typeof FooterCSforAll>;

const defaultArgs: Partial<GlobalFooterProps> = {
  locale: SupportedLocale['en-US'],
};

export const Default: Story = {
  args: {
    ...defaultArgs,
  },
  parameters: {
    eyes: {
      themes: ['csforall'],
    },
  },
};
