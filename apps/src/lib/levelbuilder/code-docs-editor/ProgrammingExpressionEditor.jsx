import PropTypes from 'prop-types';
import React, {useState} from 'react';
import TextareaWithMarkdownPreview from '@cdo/apps/lib/levelbuilder/TextareaWithMarkdownPreview';
import SaveBar from '@cdo/apps/lib/levelbuilder/SaveBar';
import {navigateToHref} from '@cdo/apps/utils';
import $ from 'jquery';
import color from '@cdo/apps/util/color';

function useProgrammingExpression(initialProgrammingExpression) {
  const [programmingExpression, setProgrammingExpression] = useState(
    initialProgrammingExpression
  );

  function updateProgrammingExpression(key, value) {
    setProgrammingExpression({...programmingExpression, [key]: value});
  }

  return [programmingExpression, updateProgrammingExpression];
}

export default function ProgrammingExpressionEditor({
  initialProgrammingExpression
}) {
  // We don't want to update id or key
  const {
    id,
    key,
    ...remainingProgrammingExpression
  } = initialProgrammingExpression;
  const [
    programmingExpression,
    updateProgrammingExpression
  ] = useProgrammingExpression(remainingProgrammingExpression);
  const [isSaving, setIsSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  const save = () => {
    if (isSaving) {
      return;
    }
    setIsSaving(true);
    fetch(`/programming_expressions/${id}`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
      },
      body: JSON.stringify(programmingExpression)
    })
      .then(response => {
        setIsSaving(false);
        if (response.ok) {
          setLastUpdated(Date.now());
        } else {
          setError(response.statusText);
        }
      })
      .catch(error => {
        setIsSaving(false);
        setError(error.responseText);
      });
  };

  return (
    <div>
      <h1>{`Editing ${key}`}</h1>
      <h2>
        This feature is in development. Please continue to use curriculum
        builder to edit code documentation.
      </h2>
      <label>
        Display Name
        <input
          value={programmingExpression.name}
          onChange={e => updateProgrammingExpression('name', e.target.value)}
          style={styles.textInput}
        />
      </label>
      <label>
        Key (Used in URLs)
        <input value={key} readOnly style={styles.textInput} />
      </label>
      <TextareaWithMarkdownPreview
        markdown={programmingExpression.shortDescription}
        label="Short Description"
        handleMarkdownChange={e =>
          updateProgrammingExpression('shortDescription', e.target.value)
        }
        features={{
          imageUpload: true
        }}
      />
      <SaveBar
        handleSave={save}
        isSaving={isSaving}
        lastSaved={lastUpdated}
        error={error}
        handleView={() => navigateToHref('/')}
      />
    </div>
  );
}

const programmingExpressionShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  key: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  shortDescription: PropTypes.string
});

ProgrammingExpressionEditor.propTypes = {
  initialProgrammingExpression: programmingExpressionShape.isRequired
};

const styles = {
  textInput: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '4px 6px',
    color: '#555',
    border: `1px solid ${color.bootstrap_border_color}`,
    borderRadius: 4,
    margin: 0
  },
  selectInput: {
    boxSizing: 'border-box',
    padding: '4px 6px',
    color: '#555',
    border: `1px solid ${color.bootstrap_border_color}`,
    borderRadius: 4,
    marginLeft: 5
  }
};
