import {Link, TextLink} from '@dsco_/link';
import $ from 'jquery';
import PropTypes from 'prop-types';
import React, {useState} from 'react';

import Dialog, {
  Title as DialogTitle,
} from '@cdo/apps/legacySharedComponents/Dialog';
import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';

const DataDocEditAll = props => {
  const {dataDocs: initialDataDocs} = props;
  const [dataDocs, setDataDocs] = useState(initialDataDocs);
  const [showDeleteWarningDialog, setShowDeleteWarningDialog] = useState(false);
  const [pendingDeleteDocKey, setPendingDeleteDocKey] = useState(null);

  const initiateDeleteDataDoc = docKeyToDelete => {
    setPendingDeleteDocKey(docKeyToDelete);
    setShowDeleteWarningDialog(true);
  };

  const deleteDataDoc = () => {
    $.ajax({
      url: `/data_docs/${pendingDeleteDocKey}`,
      method: 'DELETE',
      success: () => deleteRequestCleanup(),
      error: (xhr, ajaxOptions, thrownError) => {
        if (xhr.status === 404) {
          deleteRequestCleanup();
        }
      },
    });
  };

  const deleteRequestCleanup = () => {
    setDataDocs([
      ...dataDocs.filter(dataDoc => !pendingDeleteDocKey.includes(dataDoc.key)),
    ]);
    setShowDeleteWarningDialog(false);
    setPendingDeleteDocKey(null);
  };

  return (
    <div>
      <h1 style={{marginBottom: 30}}>Data Docs</h1>
      <div className="page-actions">
        <TextLink
          className="create-btn"
          id="create_new_data_doc"
          icon={<FontAwesome icon="plus" />}
          iconBefore={true}
          href={'/data_docs/new'}
          text="Create New Data Doc"
        />
      </div>
      {showDeleteWarningDialog && (
        <Dialog
          body={
            <DialogTitle>{`Are you sure you want to permanently delete data doc ${pendingDeleteDocKey}?`}</DialogTitle>
          }
          cancelText="Cancel"
          confirmText="Delete"
          confirmType="danger"
          isOpen={true}
          handleClose={() => setShowDeleteWarningDialog(false)}
          onCancel={() => setShowDeleteWarningDialog(false)}
          onConfirm={() => deleteDataDoc()}
        />
      )}
      <div className="guides-table">
        <span className="header">Actions</span>
        <span className="header">Data Docs</span>
        {dataDocs.map(dataDoc => {
          return [
            <React.Fragment key={`${dataDoc.key}_row`}>
              <div className="actions-box">
                <TextLink
                  id={`edit_${dataDoc.key}`}
                  icon={<FontAwesome icon={'pencil-square-o'} title={'edit'} />}
                  href={`/data_docs/${dataDoc.key}/edit`}
                />
                <TextLink
                  id={`delete_${dataDoc.key}`}
                  icon={<FontAwesome icon={'trash'} title={'delete'} />}
                  onClick={() => initiateDeleteDataDoc(dataDoc.key)}
                />
              </div>
              <div className="guide-box">
                <Link href={`/data_docs/${dataDoc.key}`}>{dataDoc.name}</Link>
              </div>
            </React.Fragment>,
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
      content: PropTypes.string,
    })
  ),
};

export default DataDocEditAll;
