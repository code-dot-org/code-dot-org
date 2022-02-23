import PropTypes from 'prop-types';
import React, {useState} from 'react';
import OrderableList from './OrderableList';
import ExampleEditor from './ExampleEditor';
import ParameterEditor from './ParameterEditor';
import TextareaWithMarkdownPreview from '@cdo/apps/lib/levelbuilder/TextareaWithMarkdownPreview';
import CollapsibleEditorSection from '@cdo/apps/lib/levelbuilder/CollapsibleEditorSection';
import HelpTip from '@cdo/apps/lib/ui/HelpTip';
import SaveBar from '@cdo/apps/lib/levelbuilder/SaveBar';
import Button from '@cdo/apps/templates/Button';
import UploadImageDialog from '@cdo/apps/lib/levelbuilder/lesson-editor/UploadImageDialog';
import {createUuid, navigateToHref} from '@cdo/apps/utils';
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

function renderParameterEditor(param, updateFunc) {
  return (
    <ParameterEditor
      parameter={param}
      update={(key, value) => updateFunc(key, value)}
    />
  );
}

function renderExampleEditor(example, updateFunc) {
  return (
    <ExampleEditor
      example={example}
      updateExample={(key, value) => updateFunc(key, value)}
    />
  );
}

export default function ProgrammingExpressionEditor({
  initialProgrammingExpression,
  environmentCategories,
  videoOptions
}) {
  // We don't want to update id or key
  const {
    id,
    key,
    ...remainingProgrammingExpression
  } = initialProgrammingExpression;
  remainingProgrammingExpression.parameters.forEach(
    p => (p.key = createUuid())
  );
  remainingProgrammingExpression.examples.forEach(e => (e.key = createUuid()));
  const [
    programmingExpression,
    updateProgrammingExpression
  ] = useProgrammingExpression(remainingProgrammingExpression);
  const [isSaving, setIsSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const [uploadImageDialogOpen, setUploadImageDialogOpen] = useState(false);

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
      {programmingExpression.environmentEditorType === 'blockly' && (
        <label>
          Block Name
          <input
            value={programmingExpression.blockName}
            onChange={e =>
              updateProgrammingExpression('blockName', e.target.value)
            }
            style={styles.textInput}
          />
        </label>
      )}
      <label>
        Video
        <select
          value={programmingExpression.videoKey || ''}
          onChange={e =>
            updateProgrammingExpression('videoKey', e.target.value)
          }
          style={styles.selectInput}
        >
          <option value={''}>---</option>
          {videoOptions.map(video => (
            <option key={video.key} value={video.key}>
              {video.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Image
        <Button
          onClick={() => setUploadImageDialogOpen(true)}
          text="Choose Image"
          color="gray"
          icon="plus-circle"
        />
        {programmingExpression.imageUrl && (
          <span>{programmingExpression.imageUrl}</span>
        )}
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
            value={programmingExpression.categoryKey}
            onChange={e =>
              updateProgrammingExpression('categoryKey', e.target.value)
            }
            style={styles.selectInput}
          >
            <option key="none" value={''}>
              (None)
            </option>
            {environmentCategories.map(category => (
              <option key={category.key} value={category.key}>
                {category.name}
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
      <CollapsibleEditorSection title="Parameters" collapsed>
        <OrderableList
          list={programmingExpression.parameters}
          setList={list => updateProgrammingExpression('parameters', list)}
          addButtonText="Add Another Parameter"
          renderItem={renderParameterEditor}
        />
      </CollapsibleEditorSection>
      <CollapsibleEditorSection title="Examples" collapsed>
        <OrderableList
          list={programmingExpression.examples || []}
          setList={list => updateProgrammingExpression('examples', list)}
          addButtonText="Add Another Example"
          renderItem={renderExampleEditor}
        />
      </CollapsibleEditorSection>
      <SaveBar
        handleSave={save}
        isSaving={isSaving}
        lastSaved={lastUpdated}
        error={error}
        handleView={() => navigateToHref(`/programming_expressions/${id}`)}
      />
      <UploadImageDialog
        isOpen={uploadImageDialogOpen}
        handleClose={() => setUploadImageDialogOpen(false)}
        uploadImage={imgUrl => updateProgrammingExpression('imageUrl', imgUrl)}
        allowExpandable={false}
      />
    </div>
  );
}

const programmingExpressionShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  key: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  categoryKey: PropTypes.string,
  shortDescription: PropTypes.string,
  externalDocumentation: PropTypes.string,
  content: PropTypes.string,
  syntax: PropTypes.string,
  returnValue: PropTypes.string,
  tips: PropTypes.string,
  parameters: PropTypes.arrayOf(PropTypes.object).isRequired,
  examples: PropTypes.arrayOf(PropTypes.object).isRequired
});

ProgrammingExpressionEditor.propTypes = {
  initialProgrammingExpression: programmingExpressionShape.isRequired,
  environmentCategories: PropTypes.arrayOf(PropTypes.object).isRequired,
  videoOptions: PropTypes.arrayOf(PropTypes.object).isRequired
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
    marginBottom: 0,
    marginLeft: 5
  }
};
