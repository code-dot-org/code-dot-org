import React from 'react';
import PropTypes from 'prop-types';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import i18n from '@cdo/locale';
import CopyrightInfo from '@cdo/apps/templates/CopyrightInfo';

const DataDocView = props => {
  const {dataDocName, dataDocContent} = props;

  return (
    <>
      <h1>{dataDocName}</h1>
      <div className="page-content">
        <EnhancedSafeMarkdown markdown={dataDocContent} />
        <EnhancedSafeMarkdown markdown={i18n.documentationBug()} />
        <CopyrightInfo />
      </div>
    </>
  );
};

DataDocView.propTypes = {
  dataDocName: PropTypes.string,
  dataDocContent: PropTypes.string
};

DataDocView.defaultProps = {
  dataDocName: 'Un-named Data Doc',
  dataDocContent: '[No content]'
};

export default DataDocView;
