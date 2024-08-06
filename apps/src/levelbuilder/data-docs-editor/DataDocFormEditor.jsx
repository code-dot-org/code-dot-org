import $ from 'jquery';
import PropTypes from 'prop-types';
import React, {useState} from 'react';

import HelpTip from '@cdo/apps/legacySharedComponents/HelpTip';
import SaveBar from '@cdo/apps/lib/levelbuilder/SaveBar';
import TextareaWithMarkdownPreview from '@cdo/apps/lib/levelbuilder/TextareaWithMarkdownPreview';
import RailsAuthenticityToken from '@cdo/apps/util/RailsAuthenticityToken';
import {navigateToHref} from '@cdo/apps/utils';

const DataDocFormEditor = props => {
  const {dataDocKey, originalDataDocName, originalDataDocContent} = props;
  const [dataDocName, setDataDocName] = useState(originalDataDocName);
  const [dataDocContent, setDataDocContent] = useState(originalDataDocContent);
  const [isSaving, setIsSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  const save = (e, saveAndClose) => {
    if (isSaving) {
      return;
    }
    setIsSaving(true);
    $.ajax({
      url: `/data_docs/${dataDocKey}`,
      method: 'PUT',
      data: {
        name: dataDocName,
        content: dataDocContent,
      },
    })
      .done(() => {
        setIsSaving(false);
        setLastUpdated(Date.now());
        if (saveAndClose) {
          navigateToHref(`/data_docs/${dataDocKey}`);
        }
      })
      .fail(err => setError(err.responseText));
  };

  return (
    <div>
      <RailsAuthenticityToken />
      <h1>Edit Data Doc</h1>
      <label style={styles.label}>
        Slug
        <input
          className="input"
          name="key"
          style={styles.input}
          value={dataDocKey}
          disabled
        />
        <HelpTip style={styles.helptip}>
          <p>
            The data doc slug is used in URLs and cannot be updated once set. A
            slug can only contain lowercase letters, numbers, and dashes, and
            'new' and 'edit' are reserved.
          </p>
        </HelpTip>
      </label>
      <label style={styles.label}>
        Name
        <input
          className="input"
          name="name"
          style={styles.input}
          value={dataDocName}
          onChange={e => setDataDocName(e.target.value)}
        />
      </label>
      <TextareaWithMarkdownPreview
        name="content"
        label="Content"
        handleMarkdownChange={e => setDataDocContent(e.target.value)}
        markdown={dataDocContent || ''}
      />
      <br />
      <SaveBar
        handleSave={save}
        isSaving={isSaving}
        lastSaved={lastUpdated}
        error={error}
      />
    </div>
  );
};

const styles = {
  label: {
    marginBottom: 20,
  },
  input: {
    marginLeft: 10,
  },
  helptip: {
    marginLeft: 10,
  },
};

DataDocFormEditor.propTypes = {
  dataDocKey: PropTypes.string,
  originalDataDocName: PropTypes.string,
  originalDataDocContent: PropTypes.string,
};

export default DataDocFormEditor;
