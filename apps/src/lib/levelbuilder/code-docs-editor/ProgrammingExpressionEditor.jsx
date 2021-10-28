import PropTypes from 'prop-types';
import React, {useState} from 'react';
import TextareaWithMarkdownPreview from '@cdo/apps/lib/levelbuilder/TextareaWithMarkdownPreview';
import {CollapsibleEditorSection} from '@cdo/apps/lib/levelbuilder/CollapsibleEditorSection';
import HelpTip from '@cdo/apps/lib/ui/HelpTip';
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
  initialProgrammingExpression,
  environmentCategories
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

  const markdownEditorFeatures = {
    imageUpload: true
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
      <label>
        Short Description
        <textarea
          value={programmingExpression.shortDescription}
          onChange={e =>
            updateProgrammingExpression('shortDescription', e.target.value)
          }
          style={styles.textInput}
        />
      </label>
      <CollapsibleEditorSection title="Documentation" collapsed>
        <label>
          External Documentation
          <HelpTip>Link to external documentation</HelpTip>
          <input
            value={programmingExpression.externalDocumentation}
            onChange={e =>
              updateProgrammingExpression(
                'externalDocumentation',
                e.target.value
              )
            }
            style={styles.textInput}
          />
        </label>
        <label>
          Category
          <select
            value={programmingExpression.category}
            onChange={e =>
              updateProgrammingExpression('category', e.target.value)
            }
            style={styles.selectInput}
          >
            <option key="none" value={''}>
              (None)
            </option>
            {environmentCategories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <HelpTip>
            Chose a category for the code documentation to fall beneath
          </HelpTip>
        </label>
        <TextareaWithMarkdownPreview
          markdown={programmingExpression.content}
          label={'Content'}
          handleMarkdownChange={e =>
            updateProgrammingExpression('content', e.target.value)
          }
          features={markdownEditorFeatures}
        />
      </CollapsibleEditorSection>
      <CollapsibleEditorSection title="Details" collapsed>
        <TextareaWithMarkdownPreview
          markdown={programmingExpression.syntax}
          label={'Syntax'}
          handleMarkdownChange={e =>
            updateProgrammingExpression('syntax', e.target.value)
          }
          features={markdownEditorFeatures}
        />
        <label>
          Return value
          <HelpTip>
            Description of return value or alternate functionality
          </HelpTip>
          <textarea
            value={programmingExpression.returnValue}
            onChange={e =>
              updateProgrammingExpression('returnValue', e.target.value)
            }
            style={styles.textInput}
          />
        </label>
      </CollapsibleEditorSection>
      <CollapsibleEditorSection title="Tips" collapsed>
        <TextareaWithMarkdownPreview
          markdown={programmingExpression.tips}
          label={'Tips'}
          handleMarkdownChange={e =>
            updateProgrammingExpression('tips', e.target.value)
          }
          features={markdownEditorFeatures}
          helpTip="List of tips for using this code documentation"
        />
      </CollapsibleEditorSection>
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
  category: PropTypes.string,
  shortDescription: PropTypes.string,
  externalDocumentation: PropTypes.string,
  content: PropTypes.string,
  syntax: PropTypes.string,
  returnValue: PropTypes.string,
  tips: PropTypes.string
});

ProgrammingExpressionEditor.propTypes = {
  initialProgrammingExpression: programmingExpressionShape.isRequired,
  environmentCategories: PropTypes.arrayOf(PropTypes.string).isRequired
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
