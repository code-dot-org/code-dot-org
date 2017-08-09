import React from 'react';
import createReactClass from 'create-react-class';
import PaginationWrapper from './PaginationWrapper';

const StorybookHarness = createReactClass({
  getInitialState() {
    return {
      currentPage: 1
    };
  },

  onValueChange(newValue) {
    this.setState({currentPage: newValue});
  },

  render() {
    return (
      <PaginationWrapper totalPages={3} currentPage={this.state.currentPage} onChangePage={this.onValueChange} />
    );
  }
});

export default storybook => {
  return storybook
    .storiesOf('PaginationWrapper', module)
    .addWithInfo(
      'Default',
      '',
      () => <StorybookHarness/>);
};
