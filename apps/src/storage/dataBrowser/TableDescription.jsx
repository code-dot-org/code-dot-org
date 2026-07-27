/**
 * @overview Component for description of a data table.
 */
import Link from '@code-dot-org/component-library/link';
import {Typography} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import {getDatasetInfo} from '@cdo/apps/storage/dataBrowser/dataUtils';
import msg from '@cdo/locale';

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
          <Typography variant="body3" sx={{mb: '10px'}}>
            {datasetInfo.description}
          </Typography>
          {datasetInfo.docUrl && (
            <Link href={datasetInfo.docUrl} openInNewTab external size="s">
              {msg.moreInfo()}
            </Link>
          )}
        </div>
      );
    }
    return null;
  }
}
