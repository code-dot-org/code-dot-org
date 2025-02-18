import PropTypes from 'prop-types';
import React from 'react';
import ReactPaginate from 'react-paginate';
import './Pagination.scss';

export default class Pagination extends React.Component {
  static propTypes = {
    // 1-indexed current page number, to match kaminari pagination numbering
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    // Page change callback, passed new page number
    onPageChange: PropTypes.func.isRequired,
  };

  handlePageChange = data => {
    this.props.onPageChange(data.selected + 1);
  };

  // REACT <16 WORKAROUND
  // The react-paginate library depends on the React 16 rename of componentWillReceiveProps
  // to UNSAFE_componentWillReceiveProps to implement its forcePage prop.  See:
  // https://github.com/AdeleD/react-paginate/blob/master/react_components/PaginationBoxView.js#L86-L93
  // This is a temporary workaround while we're still on 15.x.
  // We should remove this when we upgrade to React 16.
  forcePage(newPage) {
    this.innerComponent.setState({selected: newPage - 1});
  }

  render() {
    return (
      <ReactPaginate
        forcePage={this.props.currentPage - 1}
        pageCount={this.props.totalPages}
        onPageChange={this.handlePageChange}
        disableInitialCallback
        pageRangeDisplayed={5}
        marginPagesDisplayed={1}
        pageClassName="pagination-page"
        activeLinkClassName="pagination-active-page"
        previousClassName="pagination-previous-button"
        nextClassName="pagination-next-button"
        containerClassName="pagination-container"
        ref={ref => (this.innerComponent = ref)}
      />
    );
  }
}
