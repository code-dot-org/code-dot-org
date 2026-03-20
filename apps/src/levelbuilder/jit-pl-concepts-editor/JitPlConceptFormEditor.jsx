import $ from 'jquery';
import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {connect} from 'react-redux';

import ResourcesEditor from '@cdo/apps/levelbuilder/lesson-editor/ResourcesEditor';
import SaveBar from '@cdo/apps/levelbuilder/SaveBar';
import {resourceShape} from '@cdo/apps/levelbuilder/shapes';
import TextareaWithMarkdownPreview from '@cdo/apps/levelbuilder/TextareaWithMarkdownPreview';
import RailsAuthenticityToken from '@cdo/apps/lib/util/RailsAuthenticityToken';
import {navigateToHref} from '@cdo/apps/utils';

const JitPlConceptFormEditor = ({
  conceptId,
  originalName,
  originalDisplayName,
  originalTextContent,
  resources,
}) => {
  const [name, setName] = useState(originalName);
  const [displayName, setDisplayName] = useState(originalDisplayName);
  const [textContent, setTextContent] = useState(originalTextContent);
  const [isSaving, setIsSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  const save = (e, saveAndClose) => {
    if (isSaving) {
      return;
    }
    setIsSaving(true);
    $.ajax({
      url: `/jit_pl_concepts/${conceptId}`,
      method: 'PUT',
      data: {
        name: name,
        display_name: displayName,
        text_content: textContent,
        resource_ids: resources.map(r => r.id),
      },
    })
      .done(() => {
        setIsSaving(false);
        setLastUpdated(Date.now());
        if (saveAndClose) {
          navigateToHref('/jit_pl_concepts/edit');
        }
      })
      .fail(err => setError(err.responseText));
  };

  return (
    <div>
      <RailsAuthenticityToken />
      <h1>Edit JIT PL Concept</h1>
      <label style={styles.label}>
        Name
        <input
          className="input"
          name="name"
          style={styles.input}
          value={name || ''}
          onChange={e => setName(e.target.value)}
        />
      </label>
      <label style={styles.label}>
        Display Name
        <input
          className="input"
          name="display_name"
          style={styles.input}
          value={displayName || ''}
          onChange={e => setDisplayName(e.target.value)}
        />
      </label>
      <TextareaWithMarkdownPreview
        name="text_content"
        label="Text Content"
        handleMarkdownChange={e => setTextContent(e.target.value)}
        markdown={textContent || ''}
      />
      <h2>Resources</h2>
      {/* TODO: create a dedicated JIT PL course version and use its ID here */}
      <ResourcesEditor
        courseVersionId={1}
        resourceContext="jitPlConceptResource"
        resources={resources}
      />
      <br />
      <SaveBar
        handleSave={save}
        isSaving={isSaving}
        lastSaved={lastUpdated}
        error={error}
        pathForShowButton="/jit_pl_concepts/edit"
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
};

JitPlConceptFormEditor.propTypes = {
  conceptId: PropTypes.number.isRequired,
  originalName: PropTypes.string,
  originalDisplayName: PropTypes.string,
  originalTextContent: PropTypes.string,
  resources: PropTypes.arrayOf(resourceShape).isRequired,
};

export default connect(state => ({resources: state.resources}))(
  JitPlConceptFormEditor
);
