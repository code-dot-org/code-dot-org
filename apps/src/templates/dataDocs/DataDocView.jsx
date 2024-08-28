import PropTypes from 'prop-types';
import React from 'react';

import CopyrightInfo from '@cdo/apps/templates/CopyrightInfo';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import i18n from '@cdo/locale';

const DataDocView = props => {
  const {dataDocName, dataDocContent} = props;

  return (
    <>
      <h1 style={{marginBottom: 30}}>{dataDocName}</h1>
      <div id="data-doc-content">
        <EnhancedSafeMarkdown markdown={dataDocContent} />
      </div>
      <div id="bug-report-and-licensing" style={{marginTop: 50}}>
        <hr />
        <EnhancedSafeMarkdown markdown={i18n.documentationBug()} />
        <CopyrightInfo />
      </div>
    </>
  );
};

DataDocView.propTypes = {
  dataDocName: PropTypes.string,
  dataDocContent: PropTypes.string,
};

DataDocView.defaultProps = {
  dataDocName: 'Un-named Data Doc',
  dataDocContent: '[No content]',
};

export default DataDocView;
