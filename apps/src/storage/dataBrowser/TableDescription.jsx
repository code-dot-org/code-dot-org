/**
 * @overview Component for description of a data table.
 */
import PropTypes from 'prop-types';
import React from 'react';
import msg from '@cdo/locale';
import {getDatasetInfo} from '@cdo/apps/storage/dataBrowser/dataUtils';

export default class TableDescription extends React.Component {
  static propTypes = {
    tableName: PropTypes.string.isRequired,
    libraryTables: PropTypes.array.isRequired
  };

  render() {
    const {tableName, libraryTables} = this.props;

    const datasetInfo = getDatasetInfo(tableName, libraryTables);
    let moreInfo;
    if (datasetInfo) {
      if (datasetInfo.docUrl) {
        moreInfo = (
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={datasetInfo.docUrl}
          >
            {msg.moreInfo()}
          </a>
        );
      }
      return (
        <div>
          <span style={{display: 'block'}}>{datasetInfo.description}</span>
          {moreInfo}
        </div>
      );
    }
    return null;
  }
}
