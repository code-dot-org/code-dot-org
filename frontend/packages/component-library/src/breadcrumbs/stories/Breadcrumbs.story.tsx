import {Meta, StoryFn} from '@storybook/react';

import {Breadcrumbs, BreadcrumbsProps} from './../index';

export default {
  title: 'DesignSystem/Breadcrumbs',
  component: Breadcrumbs,
} as Meta;

//
// TEMPLATE
//
const SingleTemplate: StoryFn<BreadcrumbsProps> = args => {
  return <Breadcrumbs {...args} />;
};

const MultipleTemplate: StoryFn<{components: BreadcrumbsProps[]}> = args => {
  return (
    <>
      <p>
        * Margins on this screen do not represent Component's margins, and are
        only added to improve storybook view *
      </p>
      <p>Multiple Breadcrumbs:</p>
      <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
        {args.components.map(component => (
          <Breadcrumbs key={component.name} {...component} />
        ))}
      </div>
    </>
  );
};

export const DefaultBreadcrumbs = SingleTemplate.bind({});
DefaultBreadcrumbs.args = {
  name: 'test-Breadcrumbs',
  breadcrumbs: [
    {text: 'Breadcrumb 1', href: 'https://studio.code.org/home'},
    {text: 'Breadcrumb 2', href: 'https://studio.code.org/home'},
    {text: 'Breadcrumb 3', href: 'https://studio.code.org/home'},
    {text: 'Breadcrumb 4', href: 'https://studio.code.org/home'},
    {text: 'Breadcrumb 5', href: 'https://studio.code.org/home'},
  ],
};

export const GroupOfSizesOfBreadcrumbs = MultipleTemplate.bind({});
GroupOfSizesOfBreadcrumbs.args = {
  components: [
    {
      name: 'test-Breadcrumbsl',
      size: 'l',
      breadcrumbs: [
        {text: 'L Breadcrumb 1', href: 'https://studio.code.org/home'},
        {text: 'L Breadcrumb 2', href: 'https://studio.code.org/home'},
        {text: 'L Breadcrumb 3', href: 'https://studio.code.org/home'},
        {text: 'L Breadcrumb 4', href: 'https://studio.code.org/home'},
        {text: 'L Breadcrumb 5', href: 'https://studio.code.org/home'},
      ],
    },
    {
      name: 'test-Breadcrumbsm',
      size: 'm',
      breadcrumbs: [
        {text: 'M Breadcrumb 1', href: 'https://studio.code.org/home'},
        {text: 'M Breadcrumb 2', href: 'https://studio.code.org/home'},
        {text: 'M Breadcrumb 3', href: 'https://studio.code.org/home'},
        {text: 'M Breadcrumb 4', href: 'https://studio.code.org/home'},
        {text: 'M Breadcrumb 5', href: 'https://studio.code.org/home'},
      ],
    },
    {
      name: 'test-Breadcrumbs3',
      size: 's',
      breadcrumbs: [
        {text: 'S Breadcrumb 1', href: 'https://studio.code.org/home'},
        {text: 'S Breadcrumb 2', href: 'https://studio.code.org/home'},
        {text: 'S Breadcrumb 3', href: 'https://studio.code.org/home'},
        {text: 'S Breadcrumb 4', href: 'https://studio.code.org/home'},
        {text: 'S Breadcrumb 5', href: 'https://studio.code.org/home'},
      ],
    },
    {
      name: 'test-Breadcrumbs4',
      size: 'xs',
      breadcrumbs: [
        {text: 'XS Breadcrumb 1', href: 'https://studio.code.org/home'},
        {text: 'XS Breadcrumb 2', href: 'https://studio.code.org/home'},
        {text: 'XS Breadcrumb 3', href: 'https://studio.code.org/home'},
        {text: 'XS Breadcrumb 4', href: 'https://studio.code.org/home'},
        {text: 'XS Breadcrumb 5', href: 'Breadcrumb5'},
      ],
    },
  ],
};

export const BreadcrumbsWithHomeIcon = SingleTemplate.bind({});
BreadcrumbsWithHomeIcon.args = {
  name: 'test-breadcrumbs-with-home',
  showHomeIcon: true,
  breadcrumbs: [
    {text: 'Breadcrumb 1', href: 'https://studio.code.org/home'},
    {text: 'Breadcrumb 2', href: 'https://studio.code.org/home'},
    {text: 'Breadcrumb 3', href: 'https://studio.code.org/home'},
  ],
};
