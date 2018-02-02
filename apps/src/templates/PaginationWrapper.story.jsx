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

export default storybook => {
  return storybook
    .storiesOf('PaginationWrapper', module)
    .add( 'Default', () => <StorybookHarness/>);
};
