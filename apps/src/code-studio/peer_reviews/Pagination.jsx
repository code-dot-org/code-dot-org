import React from 'react';
import PropTypes from 'prop-types';
import ReactPaginate from 'react-paginate';
import './Pagination.scss';

export default class Pagination extends React.Component {
  static propTypes = {
    // 1-indexed current page number, to match kaminari pagination numbering
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    // Page change callback, passed new page number
    onPageChange: PropTypes.func.isRequired
  };

  handlePageChange = data => {
    this.props.onPageChange(data.selected + 1);
  };

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
      />
    );
  }
}
