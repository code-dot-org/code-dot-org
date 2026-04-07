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

import ExemplarsEditor from './ExemplarsEditor';
import MisconceptionsEditor from './MisconceptionsEditor';
import TeachingTipsEditor from './TeachingTipsEditor';

import moduleStyles from './jitPlConceptsEditor.module.scss';

const JitPlConceptFormEditor = ({
  conceptId,
  originalName,
  originalDisplayName,
  originalTextContent,
  originalMisconceptions,
  originalExemplars,
  originalTeachingTips,
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
      .fail(err => {
        setIsSaving(false);
        setError(err.responseText);
      });
  };

  return (
    <div>
      <RailsAuthenticityToken />
      <h1>Edit JIT PL Concept</h1>
      <label className={moduleStyles.conceptLabel}>
        Name
        <input
          name="name"
          className={moduleStyles.conceptInput}
          value={name || ''}
          onChange={e => setName(e.target.value)}
        />
      </label>
      <label className={moduleStyles.conceptLabel}>
        Display Name
        <input
          name="display_name"
          className={moduleStyles.conceptInput}
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
      <ResourcesEditor
        forJitPl
        resourceContext="jitPlConceptResource"
        resources={resources}
      />
      <h2>Exemplars</h2>
      <ExemplarsEditor
        conceptId={conceptId}
        initialExemplars={originalExemplars}
      />
      <h2>Misconceptions</h2>
      <MisconceptionsEditor
        conceptId={conceptId}
        initialMisconceptions={originalMisconceptions}
      />
      <h2>Teaching Tips</h2>
      <TeachingTipsEditor
        conceptId={conceptId}
        initialTeachingTips={originalTeachingTips}
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

JitPlConceptFormEditor.propTypes = {
  conceptId: PropTypes.number.isRequired,
  originalName: PropTypes.string,
  originalDisplayName: PropTypes.string,
  originalTextContent: PropTypes.string,
  originalMisconceptions: PropTypes.array,
  originalExemplars: PropTypes.array,
  originalTeachingTips: PropTypes.array,
  resources: PropTypes.arrayOf(resourceShape).isRequired,
};

export default connect(state => ({resources: state.resources}))(
  JitPlConceptFormEditor
);
