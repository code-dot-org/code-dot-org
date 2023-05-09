/**
 * @overview Component for description of a data table.
 */
import PropTypes from 'prop-types';
import React from 'react';
import msg from '@cdo/locale';
import {getDatasetInfo} from '@cdo/apps/storage/dataBrowser/dataUtils';
import {Link} from '@dsco_/link';

export default class TableDescription extends React.Component {
  static propTypes = {
    tableName: PropTypes.string.isRequired,
    libraryTables: PropTypes.array.isRequired,
  };

  render() {
    const {tableName, libraryTables} = this.props;

    const datasetInfo = getDatasetInfo(tableName, libraryTables);
    if (datasetInfo) {
      return (
        <div>
          <p>{datasetInfo.description}</p>
          {datasetInfo.docUrl && (
            <Link href={datasetInfo.docUrl} openInNewTab external>
              {msg.moreInfo()}
            </Link>
          )}
        </div>
      );
    }
    return null;
  }
}
