import React, {Component} from 'react';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import PropTypes from 'prop-types';
import PaginationWrapper from '@cdo/apps/templates/PaginationWrapper';

export default class AddLevelTable extends Component {
  static propTypes = {
    addLevel: PropTypes.func,
    levels: PropTypes.array,
    currentPage: PropTypes.number,
    setCurrentPage: PropTypes.func,
    numPages: PropTypes.number
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
              <tr key={level.id}>
                <td>
                  <button
                    type="button"
                    onClick={() => {
                      console.log('Add');
                    }}
                  >
                    <FontAwesome icon="plus" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      console.log('Clone and Add');
                    }}
                  >
                    <FontAwesome icon="files-o" />
                  </button>
                </td>
                <td>
                  <div>{level.name}</div>
                </td>
                <td>
                  <div>{level.type}</div>
                </td>
                <td>
                  <div>{level.owner}</div>
                </td>
                <td>
                  <div>{level.updated_at}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <PaginationWrapper
          totalPages={this.props.numPages}
          currentPage={this.props.currentPage}
          onChangePage={this.props.setCurrentPage}
        />
      </div>
    );
  }
}
