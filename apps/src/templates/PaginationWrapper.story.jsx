import React from 'react';
import PaginationWrapper from './PaginationWrapper';

export default {
  title: 'PaginationWrapper',
  component: PaginationWrapper
};

function defaultFunction() {}

function Template(args) {
  return (
    <PaginationWrapper
      onChangePage={defaultFunction}
      totalPages={3}
      {...args}
    />
  );
}

export const Page1Example = Template.bind({});
Page1Example.args = {
  currentPage: 1
};

export const Page2Example = Template.bind({});
Page2Example.args = {
  currentPage: 2
};

export const Page3Example = Template.bind({});
Page3Example.args = {
  currentPage: 3
};
