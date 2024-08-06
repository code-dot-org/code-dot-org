import $ from 'jquery';
import PropTypes from 'prop-types';
import React, {useState} from 'react';

import HelpTip from '@cdo/apps/legacySharedComponents/HelpTip';
import CollapsibleEditorSection from '@cdo/apps/lib/levelbuilder/CollapsibleEditorSection';
import SaveBar from '@cdo/apps/lib/levelbuilder/SaveBar';
import TextareaWithMarkdownPreview from '@cdo/apps/lib/levelbuilder/TextareaWithMarkdownPreview';
import color from '@cdo/apps/util/color';
import {createUuid, navigateToHref} from '@cdo/apps/utils';

import ImageInput from '../ImageInput';

import ExampleEditor from './ExampleEditor';
import OrderableList from './OrderableList';
import ParameterEditor from './ParameterEditor';

function useProgrammingExpression(initialProgrammingExpression) {
  const initializeProgrammingExpression = programmingExpression => {
    const copiedExpression = {...programmingExpression};
    // We remove id and key from state as they should not be modified
    delete copiedExpression.id;
    delete copiedExpression.key;
    // Examples and parameters don't have obvious unique identifiers so adding
    // some here. These are required by React when we transform these lists
    // into sets of components.
    if (copiedExpression.examples) {
      copiedExpression.examples.forEach(e => (e.key = createUuid()));
    }
    if (copiedExpression.parameters) {
      copiedExpression.parameters.forEach(p => (p.key = createUuid()));
    }
    return copiedExpression;
  };

  const [programmingExpression, setProgrammingExpression] = useState(() =>
    initializeProgrammingExpression(initialProgrammingExpression)
  );

  const setProgrammingExpressionProperty = (key, value) => {
    setProgrammingExpression({...programmingExpression, [key]: value});
  };

  return [programmingExpression, setProgrammingExpressionProperty];
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
  videoOptions,
}) {
  const [programmingExpression, setProgrammingExpressionProperty] =
    useProgrammingExpression(initialProgrammingExpression);
  const [isSaving, setIsSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  const save = (e, shouldCloseAfterSave) => {
    if (isSaving) {
      return;
    }
    setIsSaving(true);
    fetch(`/programming_expressions/${initialProgrammingExpression.id}`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content'),
      },
      body: JSON.stringify(programmingExpression),
    })
      .then(response => {
        setIsSaving(false);
        if (response.ok) {
          if (shouldCloseAfterSave) {
            navigateToHref(initialProgrammingExpression.showPath);
          } else {
            setLastUpdated(Date.now());
            setError(null);
          }
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
    imageUpload: true,
    programmingExpression: true,
  };

  return (
    <div>
      <h1>{`Editing ${initialProgrammingExpression.key}`}</h1>
      <label>
        Display Name
        <input
          value={programmingExpression.name}
          onChange={e =>
            setProgrammingExpressionProperty('name', e.target.value)
          }
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
        Category
        <select
          value={programmingExpression.categoryKey}
          onChange={e =>
            setProgrammingExpressionProperty('categoryKey', e.target.value)
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
          Choose a category for the code documentation to fall beneath
        </HelpTip>
      </label>

      {programmingExpression.environmentLanguageType === 'blockly' && (
        <label>
          Block Name
          <input
            value={programmingExpression.blockName}
            onChange={e =>
              setProgrammingExpressionProperty('blockName', e.target.value)
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
            setProgrammingExpressionProperty('videoKey', e.target.value)
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
      <ImageInput
        updateImageUrl={imgUrl =>
          setProgrammingExpressionProperty('imageUrl', imgUrl)
        }
        initialImageUrl={programmingExpression.imageUrl}
      />
      <label>
        Short Description
        <textarea
          value={programmingExpression.shortDescription}
          onChange={e =>
            setProgrammingExpressionProperty('shortDescription', e.target.value)
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
              setProgrammingExpressionProperty(
                'externalDocumentation',
                e.target.value
              )
            }
            style={styles.textInput}
          />
        </label>
        <TextareaWithMarkdownPreview
          markdown={programmingExpression.content}
          label={'Content'}
          handleMarkdownChange={e =>
            setProgrammingExpressionProperty('content', e.target.value)
          }
          features={markdownEditorFeatures}
        />
      </CollapsibleEditorSection>
      <CollapsibleEditorSection title="Details" collapsed>
        <TextareaWithMarkdownPreview
          markdown={programmingExpression.syntax}
          label={'Syntax'}
          handleMarkdownChange={e =>
            setProgrammingExpressionProperty('syntax', e.target.value)
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
              setProgrammingExpressionProperty('returnValue', e.target.value)
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
            setProgrammingExpressionProperty('tips', e.target.value)
          }
          features={markdownEditorFeatures}
          helpTip="List of tips for using this code documentation"
        />
      </CollapsibleEditorSection>
      <CollapsibleEditorSection title="Parameters" collapsed>
        <OrderableList
          list={programmingExpression.parameters}
          setList={list => setProgrammingExpressionProperty('parameters', list)}
          addButtonText="Add Another Parameter"
          renderItem={renderParameterEditor}
        />
      </CollapsibleEditorSection>
      <CollapsibleEditorSection title="Examples" collapsed>
        <OrderableList
          list={programmingExpression.examples || []}
          setList={list => setProgrammingExpressionProperty('examples', list)}
          addButtonText="Add Another Example"
          renderItem={renderExampleEditor}
        />
      </CollapsibleEditorSection>
      <SaveBar
        handleSave={save}
        isSaving={isSaving}
        lastSaved={lastUpdated}
        error={error}
        handleView={() => navigateToHref(initialProgrammingExpression.showPath)}
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
  examples: PropTypes.arrayOf(PropTypes.object).isRequired,
  showPath: PropTypes.string,
});

ProgrammingExpressionEditor.propTypes = {
  initialProgrammingExpression: programmingExpressionShape.isRequired,
  environmentCategories: PropTypes.arrayOf(PropTypes.object).isRequired,
  videoOptions: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const styles = {
  textInput: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '4px 6px',
    color: '#555',
    border: `1px solid ${color.bootstrap_border_color}`,
    borderRadius: 4,
    margin: 0,
  },
  selectInput: {
    boxSizing: 'border-box',
    padding: '4px 6px',
    color: '#555',
    border: `1px solid ${color.bootstrap_border_color}`,
    borderRadius: 4,
    marginBottom: 0,
    marginLeft: 5,
  },
};
