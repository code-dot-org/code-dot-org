import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';
import TextareaWithMarkdownPreview from '@cdo/apps/lib/levelbuilder/TextareaWithMarkdownPreview';
import SaveBar from '@cdo/apps/lib/levelbuilder/SaveBar';

export default function ProgrammingExpressionEditor({
  initialProgrammingExpression,
  videoOptions
}) {
  const [name, setName] = useState(initialProgrammingExpression.name);
  const [shortDescription, setShortDescription] = useState(
    initialProgrammingExpression.shortDescription
  );
  const [lastUpdated, setLastUpdated] = useState(
    initialProgrammingExpression.lastUpdated
  );
  const [isSaving, setIsSaving] = useState(false);
  const [videoKey, setVideoKey] = useState(
    initialProgrammingExpression.videoKey || ''
  );

  useEffect(() => {
    if (isSaving) {
      $.ajax({
        url: `/programming_expressions/${initialProgrammingExpression.id}`,
        method: 'PUT',
        dataType: 'json',
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify({
          id: initialProgrammingExpression.id,
          name: name,
          shortDescription: shortDescription,
          videoKey: videoKey
        })
      }).done(data => {
        setIsSaving(false);
        setLastUpdated(Date.now());
      });
    }
  }, [isSaving]);

  return (
    <div>
      <h1>{`Editing ${initialProgrammingExpression.name}`}</h1>
      <label>
        Display Name
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          style={styles.textInput}
        />
      </label>
      <label>
        Key (Used in URLs)
        <input
          value={initialProgrammingExpression.key}
          readOnly
          style={styles.textInput}
        />
      </label>
      <label>
        Video
        <select value={videoKey} onChange={e => setVideoKey(e.target.value)}>
          {videoOptions.map(video => (
            <option key={video.key} value={video.key}>
              {video.name}
            </option>
          ))}
        </select>
      </label>
      <TextareaWithMarkdownPreview
        markdown={shortDescription}
        label={'Short Description'}
        handleMarkdownChange={e => setShortDescription(e.target.value)}
        features={{
          imageUpload: true
        }}
      />
      <SaveBar
        handleSave={() => setIsSaving(true)}
        isSaving={isSaving}
        lastSaved={lastUpdated}
      />
    </div>
  );
}

ProgrammingExpressionEditor.propTypes = {
  initialProgrammingExpression: PropTypes.object.isRequired,
  videoOptions: PropTypes.arrayOf(
    PropTypes.shape({key: PropTypes.string, name: PropTypes.string})
  ).isRequired
};

const styles = {
  textInput: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '4px 6px',
    color: '#555',
    border: '1px solid #ccc',
    borderRadius: 4,
    margin: 0
  }
};
