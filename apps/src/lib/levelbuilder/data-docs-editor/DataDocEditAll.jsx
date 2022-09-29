import React from 'react';
import PropTypes from 'prop-types';
import {Link, TextLink} from '@dsco_/link';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

const DataDocEditAll = ({dataDocs}) => {
  const initiateDeleteDataDoc = docKeyToDelete => {
    console.log('Doc to delete: ' + docKeyToDelete);
  };

  return (
    <div>
      <h1 style={{marginBottom: 30}}>Data Docs</h1>
      <div className="page-actions">
        <TextLink
          className="create-btn"
          icon={<FontAwesome icon="plus" />}
          iconBefore={true}
          href={'/data_docs/new'}
          text="Create New Data Doc"
        />
      </div>
      <div className="guides-table">
        <span className="header">Actions</span>
        <span className="header">Data Docs</span>
        {dataDocs.map(({key, name, content}) => {
          return [
            <React.Fragment key={`${key}_row`}>
              <div className="actions-box">
                <TextLink
                  icon={<FontAwesome icon={'pencil-square-o'} title={'edit'} />}
                  href={`/data_docs/${key}/edit`}
                />
                <TextLink
                  icon={<FontAwesome icon={'trash'} title={'delete'} />}
                  onClick={() => initiateDeleteDataDoc(key)}
                />
              </div>
              <div className="guide-box">
                <Link href={`/data_docs/${key}`}>{name}</Link>
              </div>
            </React.Fragment>
          ];
        })}
      </div>
    </div>
  );
};

DataDocEditAll.propTypes = {
  dataDocs: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      name: PropTypes.string,
      content: PropTypes.string
    })
  )
};

export default DataDocEditAll;
