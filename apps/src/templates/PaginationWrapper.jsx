/** Pagination controls */
import React, {PropTypes} from 'react';
var Radium = require('radium');
import color from "../util/color";
import {Style} from 'radium';
import Pagination from "react-bootstrap/lib/Pagination";

/**
 * Pagination control for navigating between pages of a list.
 */
var PaginationWrapper = React.createClass({
  propTypes: {
    totalPages: PropTypes.number.isRequired,
    currentPage: PropTypes.number.isRequired,
    onChangePage: PropTypes.func.isRequired
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
