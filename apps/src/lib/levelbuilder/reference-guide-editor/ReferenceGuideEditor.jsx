import React, {useState} from 'react';
import PropTypes from 'prop-types';
import $ from 'jquery';
import TextareaWithMarkdownPreview from '@cdo/apps/lib/levelbuilder/TextareaWithMarkdownPreview';
import SaveBar from '@cdo/apps/lib/levelbuilder/SaveBar';
import {TextLink} from '@dsco_/link';
import {navigateToHref} from '@cdo/apps/utils';

// the edit url with the last '/edit' removed
const guideUrl = window.location.href
  .split('/')
  .slice(0, -1)
  .join('/');
// the edit url with the guide key removed
const editAllUrl = window.location.href
  .split('/')
  .slice(0, -2)
  .concat('edit')
  .join('/');

export default function ReferenceGuideEditor(props) {
  const [referenceGuide, setReferenceGuide] = useState(props.referenceGuide);
  const [isSaving, setIsSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  const save = (e, saveAndClose) => {
    if (isSaving) {
      return;
    }
    setIsSaving(true);
    fetch(guideUrl, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
      },
      body: JSON.stringify(referenceGuide)
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
        <h2>Key</h2>
        <input value={referenceGuide.key} disabled={true} />
      </label>
      <label>
        <h2>Course Version</h2>
        <input value={referenceGuide.course_version_name} disabled={true} />
      </label>
      <label>
        <h2>Display Name</h2>
        <input
          value={referenceGuide.display_name}
          onChange={e =>
            setReferenceGuide({...referenceGuide, display_name: e.target.value})
          }
        />
      </label>
      <label>
        <h2>Parent Reference Guide</h2>
        <input
          value={referenceGuide.parent_reference_guide_key}
          onChange={e =>
            setReferenceGuide({
              ...referenceGuide,
              parent_reference_guide_key: e.target.value
            })
          }
        />
      </label>
      <TextareaWithMarkdownPreview
        label={<h2>Content</h2>}
        handleMarkdownChange={e =>
          setReferenceGuide({...referenceGuide, content: e.target.value})
        }
        markdown={referenceGuide.content || ''}
        features={{imageUpload: true}}
      />
      <SaveBar
        handleSave={save}
        isSaving={isSaving}
        lastSaved={lastUpdated}
        error={error}
        handleView={() => navigateToHref(guideUrl)}
      />
    </div>
  );
}

const referenceGuideShape = PropTypes.shape({
  key: PropTypes.string,
  course_version_name: PropTypes.string,
  parent_reference_guide_key: PropTypes.string,
  display_name: PropTypes.string,
  content: PropTypes.string
});

ReferenceGuideEditor.propTypes = {
  referenceGuide: referenceGuideShape.isRequired
};
