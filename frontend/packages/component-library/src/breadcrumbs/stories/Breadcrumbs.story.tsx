import {Meta, StoryObj} from '@storybook/react';
import {within, expect} from '@storybook/test';

import FontAwesomeV6Icon from '@/fontAwesomeV6Icon';

import Breadcrumbs, {BreadcrumbsProps} from '../index';

export default {
  title: 'DesignSystem/Breadcrumbs',
  component: Breadcrumbs,
  parameters: {
    componentSubtitle: 'Renders navigation breadcrumbs',
  },
} as Meta<typeof Breadcrumbs>;

type Story = StoryObj<typeof Breadcrumbs>;

export const Default: Story = {
  args: {
    name: 'default',
    breadcrumbs: [
      {text: 'Home', href: '/'},
      {text: 'Products', href: '/products'},
      {text: 'Electronics', href: '/products/electronics'},
    ],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Home')).toBeInTheDocument();
    await expect(canvas.getByText('Products')).toBeInTheDocument();
    await expect(canvas.getByText('Electronics')).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  },
};

export const WithHomeIcon: Story = {
  args: {
    name: 'with-home-icon',
    showHomeIcon: true,
    breadcrumbs: [
      {text: 'Section', href: '/section'},
      {text: 'Subsection', href: '/section/subsection'},
      {text: 'Current Page', href: '/section/subsection/current'},
    ],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const homeIcon = canvas.getByTitle('Home');
    await expect(homeIcon).toBeInTheDocument();

    const firstBreadcrumb = canvas.getByText('Section');
    await expect(firstBreadcrumb).toHaveAttribute('href', '/section');
  },
};

export const CustomHomeIconHref: Story = {
  args: {
    name: 'custom-home-icon-href',
    showHomeIcon: true,
    homeIconHref: '/dashboard',
    breadcrumbs: [
      {text: 'Settings', href: '/dashboard/settings'},
      {text: 'Profile', href: '/dashboard/settings/profile'},
    ],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const homeLink = canvas.getByTitle('Home').closest('a');
    await expect(homeLink).toHaveAttribute('href', '/dashboard');
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
      {['xs', 's', 'm', 'l'].map(size => (
        <Breadcrumbs
          key={size}
          breadcrumbs={[
            {text: `Level 1 ${size}`, href: '/level1'},
            {text: `Level 2 ${size}`, href: '/level2'},
            {text: `Current ${size}`, href: '/current'},
          ]}
          name={`breadcrumbs-size-${size}`}
          size={size as BreadcrumbsProps['size']}
        />
      ))}
    </div>
  ),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    ['xs', 's', 'm', 'l'].forEach(async size => {
      await expect(
        canvas.getByTestId(`breadcrumbs-breadcrumbs-size-${size}`),
      ).toBeInTheDocument();
    });
  },
};

export const WithCustomClassName: Story = {
  args: {
    name: 'custom-classname',
    className: 'customBreadcrumbsClass',
    breadcrumbs: [
      {text: 'Custom Class', href: '/custom-class'},
      {text: 'Breadcrumb', href: '/breadcrumb'},
    ],
  },
  play: async ({canvasElement}) => {
    const container = canvasElement.querySelector('.customBreadcrumbsClass');
    await expect(container).toBeInTheDocument();
  },
};

export const BreadcrumbsWithIcons: Story = {
  args: {
    name: 'breadcrumbs-with-icons',
    breadcrumbs: [
      {
        children: (
          <>
            <FontAwesomeV6Icon iconName="folder" /> Files
          </>
        ),
        href: '/files',
      },
      {
        children: (
          <>
            <FontAwesomeV6Icon iconName="folder-open" /> Documents
          </>
        ),
        href: '/files/documents',
      },
      {
        children: (
          <>
            <FontAwesomeV6Icon iconName="file" /> Report.pdf
          </>
        ),
        href: '/files/documents/report.pdf',
      },
    ],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Files')).toBeInTheDocument();
    await expect(canvas.getByText('Documents')).toBeInTheDocument();
    await expect(canvas.getByText('Report.pdf')).toBeInTheDocument();

    const icons = canvas.getAllByTestId('font-awesome-v6-icon');
    expect(icons.length).toBe(5); // 3 breadcrumbs icons + 2 chevrons
  },
};
