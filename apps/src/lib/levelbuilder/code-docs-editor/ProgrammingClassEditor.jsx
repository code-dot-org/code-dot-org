import PropTypes from 'prop-types';
import React, {useState} from 'react';
import OrderableList from './OrderableList';
import ExampleEditor from './ExampleEditor';
import TextareaWithMarkdownPreview from '@cdo/apps/lib/levelbuilder/TextareaWithMarkdownPreview';
import CollapsibleEditorSection from '@cdo/apps/lib/levelbuilder/CollapsibleEditorSection';
import HelpTip from '@cdo/apps/lib/ui/HelpTip';
import SaveBar from '@cdo/apps/lib/levelbuilder/SaveBar';
import {createUuid, navigateToHref} from '@cdo/apps/utils';
import $ from 'jquery';
import color from '@cdo/apps/util/color';

function useProgrammingClass(initialProgrammingClass) {
  const [programmingClass, setProgrammingClass] = useState(
    initialProgrammingClass
  );

  function updateProgrammingClass(key, value) {
    setProgrammingClass({...programmingClass, [key]: value});
  }

  return [programmingClass, updateProgrammingClass];
}

function renderExampleEditor(example, updateFunc) {
  return (
    <ExampleEditor
      example={example}
      updateExample={(key, value) => updateFunc(key, value)}
    />
  );
}

export default function ProgrammingClassEditor({
  initialProgrammingClass,
  environmentCategories
}) {
  // We don't want to update id or key
  const {id, key, ...remainingProgrammingClass} = initialProgrammingClass;
  remainingProgrammingClass.examples.forEach(e => (e.key = createUuid()));
  const [programmingClass, updateProgrammingClass] = useProgrammingClass(
    remainingProgrammingClass
  );
  const [isSaving, setIsSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  const save = (e, shouldCloseAfterSave) => {
    if (isSaving) {
      return;
    }
    setIsSaving(true);
    fetch(`/programming_classes/${id}`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
      },
      body: JSON.stringify(programmingClass)
    })
      .then(response => {
        setIsSaving(false);
        if (response.ok) {
          if (shouldCloseAfterSave) {
            // TODO: update this when we have a show page for classes
            navigateToHref('/');
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
    imageUpload: true
  };

  return (
    <div>
      <h1>{`Editing Class "${key}"`}</h1>
      <h2>
        This feature is in development. Please continue to use curriculum
        builder to edit code documentation.
      </h2>
      <label>
        Display Name
        <input
          value={programmingClass.name}
          onChange={e => updateProgrammingClass('name', e.target.value)}
          style={styles.textInput}
        />
      </label>
      <label>
        Key (Used in URLs)
        <input value={key} readOnly style={styles.textInput} />
      </label>
      <label>
        Category
        <select
          value={programmingClass.categoryKey}
          onChange={e => updateProgrammingClass('categoryKey', e.target.value)}
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
      <CollapsibleEditorSection title="Documentation" collapsed>
        <label>
          External Documentation
          <HelpTip>Link to external documentation</HelpTip>
          <input
            value={programmingClass.externalDocumentation}
            onChange={e =>
              updateProgrammingClass('externalDocumentation', e.target.value)
            }
            style={styles.textInput}
          />
        </label>
        <TextareaWithMarkdownPreview
          markdown={programmingClass.content}
          label={'Content'}
          handleMarkdownChange={e =>
            updateProgrammingClass('content', e.target.value)
          }
          features={markdownEditorFeatures}
        />
      </CollapsibleEditorSection>
      <CollapsibleEditorSection title="Details" collapsed>
        <TextareaWithMarkdownPreview
          markdown={programmingClass.syntax}
          label={'Syntax'}
          handleMarkdownChange={e =>
            updateProgrammingClass('syntax', e.target.value)
          }
          features={markdownEditorFeatures}
        />
      </CollapsibleEditorSection>
      <CollapsibleEditorSection title="Tips" collapsed>
        <TextareaWithMarkdownPreview
          markdown={programmingClass.tips}
          label={'Tips'}
          handleMarkdownChange={e =>
            updateProgrammingClass('tips', e.target.value)
          }
          features={markdownEditorFeatures}
          helpTip="List of tips for using this code documentation"
        />
      </CollapsibleEditorSection>
      <CollapsibleEditorSection title="Examples" collapsed>
        <OrderableList
          list={programmingClass.examples || []}
          setList={list => updateProgrammingClass('examples', list)}
          addButtonText="Add Another Example"
          renderItem={renderExampleEditor}
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

const programmingClassShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  key: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  categoryKey: PropTypes.string,
  externalDocumentation: PropTypes.string,
  content: PropTypes.string,
  syntax: PropTypes.string,
  tips: PropTypes.string,
  examples: PropTypes.arrayOf(PropTypes.object)
});

ProgrammingClassEditor.propTypes = {
  initialProgrammingClass: programmingClassShape.isRequired,
  environmentCategories: PropTypes.arrayOf(PropTypes.object).isRequired
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
