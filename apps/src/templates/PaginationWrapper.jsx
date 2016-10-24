/** Pagination controls */
var React = require('react');
var Radium = require('radium');
import color from '../color';
import {Style} from 'radium';
import Pagination from "react-bootstrap/lib/Pagination";

/**
 * Pagination control for navigating between pages of a list.
 */
var PaginationWrapper = React.createClass({
  propTypes: {
    totalPages: React.PropTypes.number.isRequired,
    currentPage: React.PropTypes.number.isRequired,
    onChangePage: React.PropTypes.func.isRequired
  },

  render: function () {
    return (
      <div className="paginationControl">
        <Style
          scopeSelector=".pagination"
          rules={{
            listStyleType: 'none',
            display: 'inline',
            padding: 0,
            margin: 0,
            li: {
              display: 'inline'
            },
            a: {
              float: 'left',
              paddingLeft: 12,
              textDecoration: 'none',
              color: color.cyan
            },
            '.active a': {
              color: color.default_text
            },
            'a:hover': {
              color: color.default_text
            }
          }}
        />
        <Pagination
          bsSize={"small"}
          items={this.props.totalPages}
          activePage={this.props.currentPage}
          onSelect={this.props.onChangePage}
          maxButtons={10}
        />
      </div>
    );
  }
});
PaginationWrapper = Radium(PaginationWrapper);
module.exports = PaginationWrapper;

if (BUILD_STYLEGUIDE) {
  const StorybookHarness = React.createClass({
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

  PaginationWrapper.styleGuideExamples = storybook => {
    return storybook
      .storiesOf('PaginationWrapper', module)
      .addWithInfo(
        'Default',
        '',
        () => <StorybookHarness/>);
  };
}
