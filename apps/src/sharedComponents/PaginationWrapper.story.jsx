import React from 'react';

import PaginationWrapper from './PaginationWrapper';

class StorybookHarness extends React.Component {
  state = {currentPage: 1};

  onValueChange = newValue => this.setState({currentPage: newValue});

  render() {
    return (
      <PaginationWrapper
        totalPages={3}
        currentPage={this.state.currentPage}
        onChangePage={this.onValueChange}
      />
    );
  }
}

export default {
  component: PaginationWrapper,
};

const Template = args => {
  return <StorybookHarness />;
};

export const BasicExample = Template.bind({});
BasicExample.args = {
  currentPage: 1,
};
