import {Breadcrumbs as MUIBreadcrumbs} from '@mui/material';
import {ThemeProvider} from '@mui/material/styles';
import {Meta, StoryFn} from '@storybook/react-webpack5';
import {within, expect} from 'storybook/test';

import FontAwesomeV6Icon from '@/fontAwesomeV6Icon';
import theme from '@/themes/code.org';

import Breadcrumbs, {
  BreadcrumbsProps,
  convertBreadcrumbsPropsToMUI,
} from './../index';

export default {
  title: 'DesignSystem/Breadcrumbs',
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore-next-line
  component: Breadcrumbs.type,
  parameters: {
    useMui: true,
    componentSubtitle: 'Renders navigation breadcrumbs',
  },
} as Meta;

//
// TEMPLATE
//
const SingleTemplate: StoryFn<BreadcrumbsProps> = args => {
  const muiProps = convertBreadcrumbsPropsToMUI(args);

  return (
    <div style={{display: 'flex', gap: '20px', alignItems: 'center'}}>
      <div>
        <div style={{marginBottom: '8px', fontSize: '12px', color: '#666'}}>
          Current Breadcrumbs
        </div>
        <Breadcrumbs {...args} />
      </div>
      <div>
        <div style={{marginBottom: '8px', fontSize: '12px', color: '#666'}}>
          MUI Breadcrumbs
        </div>
        <ThemeProvider theme={theme}>
          <MUIBreadcrumbs {...muiProps} />
        </ThemeProvider>
      </div>
    </div>
  );
};

const MultipleTemplate: StoryFn<{
  components: BreadcrumbsProps[];
  gap?: '20px';
}> = args => (
  <div
    style={{display: 'flex', flexDirection: 'column', gap: args.gap || '20px'}}
  >
    {args.components?.map((componentArg, index) => {
      const muiProps = convertBreadcrumbsPropsToMUI(componentArg);
      const key = `${componentArg.size || 'm'}-${componentArg.name || index}`;

      return (
        <div
          key={key}
          style={{display: 'flex', flexDirection: 'column', gap: '8px'}}
        >
          <div style={{fontSize: '12px', color: '#666', marginBottom: '4px'}}>
            Current
          </div>
          <Breadcrumbs {...componentArg} />
          <div
            style={{
              fontSize: '12px',
              color: '#666',
              marginTop: '8px',
              marginBottom: '4px',
            }}
          >
            MUI
          </div>
          <ThemeProvider theme={theme}>
            <MUIBreadcrumbs {...muiProps} />
          </ThemeProvider>
        </div>
      );
    })}
  </div>
);

export const Default: StoryFn<BreadcrumbsProps> = SingleTemplate.bind({});
Default.args = {
  name: 'default',
  breadcrumbs: [
    {text: 'Home', href: '/'},
    {text: 'Products', href: '/products'},
    {text: 'Electronics', href: '/products/electronics'},
  ],
};
Default.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);

  await expect(canvas.getByText('Home')).toBeInTheDocument();
  await expect(canvas.getByText('Products')).toBeInTheDocument();
  await expect(canvas.getByText('Electronics')).toBeInTheDocument();
};

export const WithHomeIcon: StoryFn<BreadcrumbsProps> = SingleTemplate.bind({});
WithHomeIcon.args = {
  name: 'with-home-icon',
  showHomeIcon: true,
  breadcrumbs: [
    {text: 'Section', href: '/section'},
    {text: 'Subsection', href: '/section/subsection'},
    {text: 'Current Page', href: '/section/subsection/current'},
  ],
};
WithHomeIcon.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);

  const homeIcon = canvas.getByTitle('Home');
  await expect(homeIcon).toBeInTheDocument();

  const firstBreadcrumb = canvas.getByText('Section');
  await expect(firstBreadcrumb).toHaveAttribute('href', '/section');
};

export const CustomHomeIconHref: StoryFn<BreadcrumbsProps> =
  SingleTemplate.bind({});
CustomHomeIconHref.args = {
  name: 'custom-home-icon-href',
  showHomeIcon: true,
  homeIconHref: '/dashboard',
  breadcrumbs: [
    {text: 'Settings', href: '/dashboard/settings'},
    {text: 'Profile', href: '/dashboard/settings/profile'},
  ],
};
CustomHomeIconHref.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);

  const homeLink = canvas.getByTitle('Home').closest('a');
  await expect(homeLink).toHaveAttribute('href', '/dashboard');
};

export const Sizes: StoryFn<{
  components: BreadcrumbsProps[];
  gap?: '20px';
}> = MultipleTemplate.bind({});
Sizes.args = {
  gap: '20px',
  components: (['xs', 's', 'm', 'l'] as const).map(size => ({
    name: `breadcrumbs-size-${size}`,
    size,
    breadcrumbs: [
      {text: `Level 1 ${size}`, href: '/level1'},
      {text: `Level 2 ${size}`, href: '/level2'},
      {text: `Current ${size}`, href: '/current'},
    ],
  })),
};
Sizes.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);

  for (const size of ['xs', 's', 'm', 'l']) {
    // Verify breadcrumbs are rendered by checking for text content
    await expect(canvas.getByText(`Level 1 ${size}`)).toBeInTheDocument();
    await expect(canvas.getByText(`Current ${size}`)).toBeInTheDocument();
  }
};

export const WithCustomClassName: StoryFn<BreadcrumbsProps> =
  SingleTemplate.bind({});
WithCustomClassName.args = {
  name: 'custom-classname',
  className: 'customBreadcrumbsClass',
  breadcrumbs: [
    {text: 'Custom Class', href: '/custom-class'},
    {text: 'Breadcrumb', href: '/breadcrumb'},
  ],
};
WithCustomClassName.play = async ({canvasElement}) => {
  const container = canvasElement.querySelector('.customBreadcrumbsClass');
  await expect(container).toBeInTheDocument();
};

export const BreadcrumbsWithIcons: StoryFn<BreadcrumbsProps> =
  SingleTemplate.bind({});
BreadcrumbsWithIcons.args = {
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
};
BreadcrumbsWithIcons.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);

  await expect(canvas.getByText('Files')).toBeInTheDocument();
  await expect(canvas.getByText('Documents')).toBeInTheDocument();
  await expect(canvas.getByText('Report.pdf')).toBeInTheDocument();

  const icons = canvas.getAllByTestId('font-awesome-v6-icon');
  expect(icons.length).toBeGreaterThanOrEqual(5); // 3 breadcrumbs icons + 2 chevrons
};
