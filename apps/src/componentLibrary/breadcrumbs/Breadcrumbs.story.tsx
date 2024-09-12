import {Meta, StoryFn} from '@storybook/react';
import React from 'react';

import {Breadcrumbs, BreadcrumbsProps} from './index';

export default {
  title: 'DesignSystem/[WIP]Breadcrumbs', // eslint-disable-line storybook/no-title-property-in-meta
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
    {text: 'Breadcrumb1', href: 'https://studio.code.org/home'},
    {text: 'Breadcrumb2', href: 'https://studio.code.org/home'},
    {text: 'Breadcrumb3', href: 'https://studio.code.org/home'},
    {text: 'Breadcrumb4', href: 'https://studio.code.org/home'},
    {text: 'Breadcrumb5', href: 'https://studio.code.org/home'},
  ],
};

export const GroupOfSizesOfBreadcrumbs = MultipleTemplate.bind({});
GroupOfSizesOfBreadcrumbs.args = {
  components: [
    {
      name: 'test-Breadcrumbsl',
      size: 'l',
      breadcrumbs: [
        {text: 'LBreadcrumb1', href: 'https://studio.code.org/home'},
        {text: 'LBreadcrumb2', href: 'https://studio.code.org/home'},
        {text: 'LBreadcrumb3', href: 'https://studio.code.org/home'},
        {text: 'LBreadcrumb4', href: 'https://studio.code.org/home'},
        {text: 'LBreadcrumb5', href: 'https://studio.code.org/home'},
      ],
    },
    {
      name: 'test-Breadcrumbsm',
      size: 'm',
      breadcrumbs: [
        {text: 'MBreadcrumb1', href: 'https://studio.code.org/home'},
        {text: 'MBreadcrumb2', href: 'https://studio.code.org/home'},
        {text: 'MBreadcrumb3', href: 'https://studio.code.org/home'},
        {text: 'MBreadcrumb4', href: 'https://studio.code.org/home'},
        {text: 'MBreadcrumb5', href: 'https://studio.code.org/home'},
      ],
    },
    {
      name: 'test-Breadcrumbs3',
      size: 's',
      breadcrumbs: [
        {text: 'SBreadcrumb1', href: 'https://studio.code.org/home'},
        {text: 'SBreadcrumb2', href: 'https://studio.code.org/home'},
        {text: 'SBreadcrumb3', href: 'https://studio.code.org/home'},
        {text: 'SBreadcrumb4', href: 'https://studio.code.org/home'},
        {text: 'SBreadcrumb5', href: 'https://studio.code.org/home'},
      ],
    },
    {
      name: 'test-Breadcrumbs4',
      size: 'xs',
      breadcrumbs: [
        {text: 'XSBreadcrumb1', href: 'https://studio.code.org/home'},
        {text: 'XSBreadcrumb2', href: 'https://studio.code.org/home'},
        {text: 'XSBreadcrumb3', href: 'https://studio.code.org/home'},
        {text: 'XSBreadcrumb4', href: 'https://studio.code.org/home'},
        {text: 'XSBreadcrumb5', href: 'Breadcrumb5'},
      ],
    },
  ],
};
