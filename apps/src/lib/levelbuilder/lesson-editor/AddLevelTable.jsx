import React, {Component} from 'react';
import PropTypes from 'prop-types';
import PaginationWrapper from '@cdo/apps/templates/PaginationWrapper';
import AddLevelTableRow from '@cdo/apps/lib/levelbuilder/lesson-editor/AddLevelTableRow';
import color from '@cdo/apps/util/color';

export default class AddLevelTable extends Component {
  static propTypes = {
    addLevel: PropTypes.func.isRequired,
    levels: PropTypes.array.isRequired,
    currentPage: PropTypes.number.isRequired,
    setCurrentPage: PropTypes.func.isRequired,
    numPages: PropTypes.number.isRequired
  };

  render() {
    return (
      <div>
        <table style={{width: '100%'}}>
          <thead>
            <tr>
              <th style={{width: '13%'}}>Actions</th>
              <th style={{width: '33%'}}>Name</th>
              <th style={{width: '18%'}}>Type</th>
              <th style={{width: '15%'}}>Owner</th>
              <th style={{width: '20%'}}>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {this.props.levels.map(level => (
              <AddLevelTableRow
                key={level.id}
                addLevel={this.props.addLevel}
                level={level}
              />
            ))}
          </tbody>
        </table>
        {this.props.levels.length === 0 && (
          <div style={{color: color.red}}>
            {'There are no levels matching the search you entered.'}
          </div>
        )}
        <PaginationWrapper
          totalPages={this.props.numPages}
          currentPage={this.props.currentPage}
          onChangePage={this.props.setCurrentPage}
        />
      </div>
    );
  }
}
