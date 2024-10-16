import {TextLink} from '@dsco_/link';
import $ from 'jquery';
import PropTypes from 'prop-types';
import React, {useState} from 'react';

import SaveBar from '@cdo/apps/levelbuilder/SaveBar';
import TextareaWithMarkdownPreview from '@cdo/apps/levelbuilder/TextareaWithMarkdownPreview';
import HelpTip from '@cdo/apps/sharedComponents/HelpTip';
import {navigateToHref} from '@cdo/apps/utils';

export default function ReferenceGuideEditor(props) {
  const {
    referenceGuide: initialReferenceGuide,
    referenceGuides,
    updateUrl,
    editAllUrl,
  } = props;
  const [referenceGuide, setReferenceGuide] = useState(initialReferenceGuide);
  const [isSaving, setIsSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  const save = (e, saveAndClose) => {
    if (isSaving) {
      return;
    }
    setIsSaving(true);
    fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content'),
      },
      body: JSON.stringify(referenceGuide),
    })
      .then(response => response.json())
      .then(json => {
        setIsSaving(false);
        setLastUpdated(Date.now());
        setReferenceGuide(json);
        if (saveAndClose) {
          navigateToHref(editAllUrl);
        }
      })
      .catch(err => setError(err));
  };

  return (
    <div>
      <h1>Editing {referenceGuide.display_name}</h1>
      <TextLink
        href={editAllUrl}
        text={`All reference guides for ${referenceGuide.course_version_name}`}
      />
      <label>
        Key
        <input className="input" value={referenceGuide.key} disabled={true} />
      </label>
      <label>
        Course Version
        <input
          className="input"
          value={referenceGuide.course_version_name}
          disabled={true}
        />
      </label>
      <label>
        Display Name
        <input
          className="input"
          value={referenceGuide.display_name}
          onChange={e =>
            setReferenceGuide({...referenceGuide, display_name: e.target.value})
          }
        />
      </label>
      <label>
        Parent Reference Guide
        <HelpTip>
          <p>
            This will move the reference guide to be nested within a different
            reference guide. All guides nested within this guide will follow it.
          </p>
        </HelpTip>
        <select
          className="input"
          value={referenceGuide.parent_reference_guide_key}
          onChange={e => {
            const value = e.target.value === 'null' ? null : e.target.value;
            setReferenceGuide({
              ...referenceGuide,
              parent_reference_guide_key: value,
            });
          }}
        >
          <option key={'null'} value="null">
            No parent
          </option>
          {referenceGuides
            .filter(guide => guide.key !== referenceGuide.key) // don't let a guide parent to itself
            .sort((a, b) => a.key.localeCompare(b.key)) // sort alphabetically
            .map(guide => (
              <option key={guide.key}>{guide.key}</option>
            ))}
        </select>
      </label>
      <TextareaWithMarkdownPreview
        label="Content"
        handleMarkdownChange={e =>
          setReferenceGuide({...referenceGuide, content: e.target.value})
        }
        markdown={referenceGuide.content || ''}
        features={{imageUpload: true, programmingExpression: true}}
      />
      <SaveBar
        handleSave={save}
        isSaving={isSaving}
        lastSaved={lastUpdated}
        error={error}
        handleView={() => navigateToHref(updateUrl)}
      />
    </div>
  );
}

const referenceGuideShape = PropTypes.shape({
  key: PropTypes.string,
  course_version_name: PropTypes.string,
  parent_reference_guide_key: PropTypes.string,
  display_name: PropTypes.string,
  content: PropTypes.string,
});

ReferenceGuideEditor.propTypes = {
  referenceGuide: referenceGuideShape.isRequired,
  referenceGuides: PropTypes.arrayOf(referenceGuideShape).isRequired,
  updateUrl: PropTypes.string.isRequired,
  editAllUrl: PropTypes.string.isRequired,
};
