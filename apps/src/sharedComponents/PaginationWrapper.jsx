/** Pagination controls */
import {Pagination} from '@react-bootstrap/pagination';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import styles from './PaginationWrapper.module.scss';

/**
 * Pagination control for navigating between pages of a list.
 */
class PaginationWrapper extends Component {
  static propTypes = {
    totalPages: PropTypes.number.isRequired,
    currentPage: PropTypes.number.isRequired,
    onChangePage: PropTypes.func.isRequired,
    label: PropTypes.string,
  };

  render() {
    return (
      <div className={`${styles.container} paginationControl`}>
        {this.props.label && (
          <span className={styles.label}>{this.props.label}</span>
        )}
        <Pagination
          bsSize={'small'}
          items={this.props.totalPages}
          activePage={this.props.currentPage}
          onSelect={this.props.onChangePage}
          maxButtons={10}
        />
      </div>
    );
  }
}

export default PaginationWrapper;
