import {Meta, StoryFn} from '@storybook/react';
import React, {useState} from 'react';

import {Breadcrumbs, BreadcrumbsProps} from './index';

export default {
  title: 'DesignSystem/[WIP]Breadcrumbs', // eslint-disable-line storybook/no-title-property-in-meta
  component: Breadcrumbs,
} as Meta;

//
// TEMPLATE
//
const SingleTemplate: StoryFn<BreadcrumbsProps> = args => {
  const [values, setValues] = useState<string[]>([]);

  return (
    <Breadcrumbs
      {...args}
      values={values}
      setValues={setValues as (values: string[]) => void}
    />
  );
};

const MultipleTemplate: StoryFn<{groups: BreadcrumbsProps[]}> = args => {
  const [values, setValues] = useState([]);
  const {groups} = args;

  return (
    <>
      {groups.map(group => (
        <Breadcrumbs
          key={group.name}
          {...group}
          values={values}
          setValues={setValues as (values: string[]) => void}
        />
      ))}
    </>
  );
};

export const DefaultBreadcrumbs = SingleTemplate.bind({});
DefaultBreadcrumbs.args = {
  label: 'Breadcrumbs label',
  name: 'test-Breadcrumbs',
  required: true,
  options: [
    {value: 'Breadcrumb1', label: 'Breadcrumb1'},
    {value: 'Breadcrumb2', label: 'Breadcrumb2'},
    {value: 'Breadcrumb3', label: 'Breadcrumb3'},
    {value: 'Breadcrumb4', label: 'Breadcrumb4'},
    {value: 'Breadcrumb5', label: 'Breadcrumb5'},
  ],
};

export const GroupOfSizesOfBreadcrumbs = MultipleTemplate.bind({});
GroupOfSizesOfBreadcrumbs.args = {
  groups: [
    {
      label: 'Breadcrumbs L',
      name: 'test-Breadcrumbs1',
      required: true,
      size: 'l',
      options: [
        {value: 'LBreadcrumb1', label: 'Breadcrumb1'},
        {value: 'LBreadcrumb2', label: 'Breadcrumb2'},
        {value: 'LBreadcrumb3', label: 'Breadcrumb3'},
        {value: 'LBreadcrumb4', label: 'Breadcrumb4'},
        {value: 'LBreadcrumb5', label: 'Breadcrumb5'},
      ],
      values: [],
      setValues: () => null,
    },
    {
      label: 'Breadcrumbs M',
      name: 'test-Breadcrumbs2',
      required: true,
      size: 'm',
      options: [
        {value: 'MBreadcrumb1', label: 'Breadcrumb1'},
        {value: 'MBreadcrumb2', label: 'Breadcrumb2'},
        {value: 'MBreadcrumb3', label: 'Breadcrumb3'},
        {value: 'MBreadcrumb4', label: 'Breadcrumb4'},
        {value: 'MBreadcrumb5', label: 'Breadcrumb5'},
      ],
      values: [],
      setValues: () => null,
    },
    {
      label: 'Breadcrumbs S',
      name: 'test-Breadcrumbs3',
      required: true,
      size: 's',
      options: [
        {value: 'SBreadcrumb1', label: 'Breadcrumb1'},
        {value: 'SBreadcrumb2', label: 'Breadcrumb2'},
        {value: 'SBreadcrumb3', label: 'Breadcrumb3'},
        {value: 'SBreadcrumb4', label: 'Breadcrumb4'},
        {value: 'SBreadcrumb5', label: 'Breadcrumb5'},
      ],
      values: [],
      setValues: () => null,
    },
    {
      label: 'Breadcrumbs XS',
      name: 'test-Breadcrumbs4',
      required: true,
      size: 'xs',
      options: [
        {value: 'XSBreadcrumb1', label: 'Breadcrumb1'},
        {value: 'XSBreadcrumb2', label: 'Breadcrumb2'},
        {value: 'XSBreadcrumb3', label: 'Breadcrumb3'},
        {value: 'XSBreadcrumb4', label: 'Breadcrumb4'},
        {value: 'XSBreadcrumb5', label: 'Breadcrumb5'},
      ],
      values: [],
      setValues: () => null,
    },
  ],
};
