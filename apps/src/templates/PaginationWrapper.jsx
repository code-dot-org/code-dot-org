/** Pagination controls */
import React, {Component} from 'react';
import PropTypes from 'prop-types';

import Radium, {Style} from 'radium';
import color from '../util/color';
import {Pagination} from '@react-bootstrap/pagination';

/**
 * Pagination control for navigating between pages of a list.
 */
class PaginationWrapper extends Component {
  static propTypes = {
    totalPages: PropTypes.number.isRequired,
    currentPage: PropTypes.number.isRequired,
    onChangePage: PropTypes.func.isRequired,
    label: PropTypes.string
  };

  render() {
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
        {this.props.label && (
          <span style={styles.label}>{this.props.label}</span>
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

const styles = {
  label: {
    float: 'left'
  }
};

export default Radium(PaginationWrapper);
