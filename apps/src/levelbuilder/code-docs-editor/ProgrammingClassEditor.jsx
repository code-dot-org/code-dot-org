import $ from 'jquery';
import PropTypes from 'prop-types';
import React, {useState} from 'react';

import HelpTip from '@cdo/apps/legacySharedComponents/HelpTip';
import CollapsibleEditorSection from '@cdo/apps/lib/levelbuilder/CollapsibleEditorSection';
import SaveBar from '@cdo/apps/lib/levelbuilder/SaveBar';
import TextareaWithMarkdownPreview from '@cdo/apps/lib/levelbuilder/TextareaWithMarkdownPreview';
import color from '@cdo/apps/util/color';
import {createUuid, navigateToHref} from '@cdo/apps/utils';

import ExampleEditor from './ExampleEditor';
import FieldEditor from './FieldEditor';
import MethodNameEditor from './MethodNameEditor';
import OrderableList from './OrderableList';

function useProgrammingClass(initialProgrammingClass) {
  const initializeProgrammingClass = programmingClass => {
    const copiedClass = {...programmingClass};
    // We remove id and key from state as they should not be modified
    delete copiedClass.id;
    delete copiedClass.key;
    // Examples and fields don't have obvious unique identifiers so adding
    // some here. These are required by React when we transform these lists
    // into sets of components.
    if (copiedClass.examples) {
      copiedClass.examples.forEach(e => (e.key = createUuid()));
    }
    if (copiedClass.fields) {
      copiedClass.fields.forEach(p => (p.key = createUuid()));
    }
    return copiedClass;
  };

  const [programmingClass, setProgrammingClass] = useState(() =>
    initializeProgrammingClass(initialProgrammingClass)
  );

  const setProgrammingClassProperty = (key, value) => {
    setProgrammingClass({...programmingClass, [key]: value});
  };

  const resetProgrammingClass = newProgrammingClass => {
    setProgrammingClass(initializeProgrammingClass(newProgrammingClass));
  };

  return [programmingClass, setProgrammingClassProperty, resetProgrammingClass];
}

function renderExampleEditor(example, updateFunc) {
  return <ExampleEditor example={example} updateExample={updateFunc} />;
}

function renderFieldEditor(field, updateFunc) {
  return <FieldEditor field={field} updateField={updateFunc} />;
}

function renderMethodNameEditor(method, updateFunc) {
  return <MethodNameEditor method={method} updateMethod={updateFunc} />;
}

export default function ProgrammingClassEditor({
  initialProgrammingClass,
  environmentCategories,
}) {
  const [programmingClass, setProgrammingClassProperty, resetProgrammingClass] =
    useProgrammingClass(initialProgrammingClass);
  const [isSaving, setIsSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  const save = (e, shouldCloseAfterSave) => {
    if (isSaving) {
      return;
    }
    setIsSaving(true);
    fetch(`/programming_classes/${initialProgrammingClass.id}`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content'),
      },
      body: JSON.stringify(programmingClass),
    })
      .then(response => {
        setIsSaving(false);
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(response.statusText);
        }
      })
      .then(json => {
        if (shouldCloseAfterSave) {
          navigateToHref(programmingClass.showUrl);
        } else {
          setLastUpdated(Date.now());
          setError(null);
          resetProgrammingClass(json);
        }
      })
      .catch(error => {
        setIsSaving(false);
        setError(error.responseText);
      });
  };

  const markdownEditorFeatures = {
    imageUpload: true,
  };

  return (
    <div>
      <h1>{`Editing Class "${initialProgrammingClass.key}"`}</h1>
      <label>
        Display Name
        <input
          value={programmingClass.name}
          onChange={e => setProgrammingClassProperty('name', e.target.value)}
          style={styles.textInput}
        />
      </label>
      <label>
        Key (Used in URLs)
        <input
          value={initialProgrammingClass.key}
          readOnly
          style={styles.textInput}
        />
      </label>
      <label>
        Category
        <select
          value={programmingClass.categoryKey}
          onChange={e =>
            setProgrammingClassProperty('categoryKey', e.target.value)
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
      <CollapsibleEditorSection title="Documentation" collapsed>
        <label>
          External Documentation
          <HelpTip>Link to external documentation</HelpTip>
          <input
            value={programmingClass.externalDocumentation}
            onChange={e =>
              setProgrammingClassProperty(
                'externalDocumentation',
                e.target.value
              )
            }
            style={styles.textInput}
          />
        </label>
        <TextareaWithMarkdownPreview
          markdown={programmingClass.content}
          label={'Content'}
          handleMarkdownChange={e =>
            setProgrammingClassProperty('content', e.target.value)
          }
          features={markdownEditorFeatures}
        />
      </CollapsibleEditorSection>
      <CollapsibleEditorSection title="Details" collapsed>
        <TextareaWithMarkdownPreview
          markdown={programmingClass.syntax}
          label={'Syntax'}
          handleMarkdownChange={e =>
            setProgrammingClassProperty('syntax', e.target.value)
          }
          features={markdownEditorFeatures}
        />
      </CollapsibleEditorSection>
      <CollapsibleEditorSection title="Tips" collapsed>
        <TextareaWithMarkdownPreview
          markdown={programmingClass.tips}
          label={'Tips'}
          handleMarkdownChange={e =>
            setProgrammingClassProperty('tips', e.target.value)
          }
          features={markdownEditorFeatures}
          helpTip="List of tips for using this code documentation"
        />
      </CollapsibleEditorSection>
      <CollapsibleEditorSection title="Examples" collapsed>
        <OrderableList
          list={programmingClass.examples || []}
          setList={list => setProgrammingClassProperty('examples', list)}
          addButtonText="Add Another Example"
          renderItem={renderExampleEditor}
        />
      </CollapsibleEditorSection>
      <CollapsibleEditorSection title="Fields" collapsed>
        <OrderableList
          list={programmingClass.fields || []}
          setList={list => setProgrammingClassProperty('fields', list)}
          addButtonText="Add Another Field"
          renderItem={renderFieldEditor}
        />
      </CollapsibleEditorSection>
      <CollapsibleEditorSection title="Methods" collapsed>
        <OrderableList
          list={programmingClass.methods || []}
          setList={list => setProgrammingClassProperty('methods', list)}
          addButtonText="Add Another Method"
          renderItem={renderMethodNameEditor}
        />
      </CollapsibleEditorSection>
      <SaveBar
        handleSave={save}
        isSaving={isSaving}
        lastSaved={lastUpdated}
        error={error}
        handleView={() => navigateToHref(programmingClass.showUrl)}
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
  examples: PropTypes.arrayOf(PropTypes.object),
  fields: PropTypes.arrayOf(PropTypes.object),
  methods: PropTypes.arrayOf(PropTypes.object),
});

ProgrammingClassEditor.propTypes = {
  initialProgrammingClass: programmingClassShape.isRequired,
  environmentCategories: PropTypes.arrayOf(PropTypes.object).isRequired,
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
