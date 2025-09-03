import {GlobalFooterProps} from '@/components/footer/common/types';
import FooterCorporateSite from '@/components/footer/corporateSite';
import {SupportedLocale} from '@/config/locale';
import {Meta, StoryObj} from '@storybook/react';

const meta: Meta<typeof FooterCorporateSite> = {
  title: 'Marketing/Footer/CorporateSite',
  component: FooterCorporateSite,
  tags: ['autodocs', 'marketing'],
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
type Story = StoryObj<typeof FooterCorporateSite>;

const defaultArgs: Partial<GlobalFooterProps> = {
  locale: SupportedLocale['en-US'],
};

export const Default: Story = {
  args: {
    ...defaultArgs,
  },
};
