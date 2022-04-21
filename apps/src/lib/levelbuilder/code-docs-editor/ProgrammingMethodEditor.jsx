import PropTypes from 'prop-types';
import React, {useState} from 'react';
import OrderableList from './OrderableList';
import ExampleEditor from './ExampleEditor';
import ParameterEditor from './ParameterEditor';
import TextareaWithMarkdownPreview from '@cdo/apps/lib/levelbuilder/TextareaWithMarkdownPreview';
import CollapsibleEditorSection from '@cdo/apps/lib/levelbuilder/CollapsibleEditorSection';
import HelpTip from '@cdo/apps/lib/ui/HelpTip';
import SaveBar from '@cdo/apps/lib/levelbuilder/SaveBar';
import {createUuid, navigateToHref} from '@cdo/apps/utils';
import $ from 'jquery';
import color from '@cdo/apps/util/color';

function useProgrammingMethod(initialProgrammingMethod) {
  const initializeProgrammingMethod = programmingMethod => {
    const copiedMethod = {...programmingMethod};
    // We remove id and key from state as they should not be modified
    delete copiedMethod.id;
    delete copiedMethod.key;
    // Examples and parameters don't have obvious unique identifiers so adding
    // some here. These are required by React when we transform these lists
    // into sets of components.
    if (copiedMethod.examples) {
      copiedMethod.examples.forEach(e => (e.key = createUuid()));
    }
    if (copiedMethod.parameters) {
      copiedMethod.parameters.forEach(p => (p.key = createUuid()));
    }
    return copiedMethod;
  };

  const [programmingMethod, setProgrammingMethod] = useState(() =>
    initializeProgrammingMethod(initialProgrammingMethod)
  );

  const setProgrammingMethodProperty = (key, value) => {
    setProgrammingMethod({...programmingMethod, [key]: value});
  };

  const resetProgrammingMethod = newProgrammingMethod => {
    setProgrammingMethod(initializeProgrammingMethod(newProgrammingMethod));
  };

  return [
    programmingMethod,
    setProgrammingMethodProperty,
    resetProgrammingMethod
  ];
}

function renderExampleEditor(example, updateFunc) {
  return <ExampleEditor example={example} updateExample={updateFunc} />;
}

function renderParameterEditor(parameter, updateFunc) {
  return <ParameterEditor parameter={parameter} update={updateFunc} />;
}

export default function ProgrammingMethodEditor({
  initialProgrammingMethod,
  overloadOptions
}) {
  const [
    programmingMethod,
    setProgrammingMethodProperty,
    resetProgrammingMethod
  ] = useProgrammingMethod(initialProgrammingMethod);
  const [isSaving, setIsSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  const save = (e, shouldCloseAfterSave) => {
    if (isSaving) {
      return;
    }
    setIsSaving(true);
    fetch(`/programming_methods/${initialProgrammingMethod.id}`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
      },
      body: JSON.stringify(programmingMethod)
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
          // TODO: update this when we have a show page for classes
          navigateToHref('/');
        } else {
          setLastUpdated(Date.now());
          setError(null);
          resetProgrammingMethod(json);
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
      <h1>{`Editing Method "${programmingMethod.name}"`}</h1>
      <h2>
        This feature is in development. Please continue to use curriculum
        builder to edit code documentation.
      </h2>
      <label>
        Display Name
        <input
          value={programmingMethod.name}
          onChange={e => setProgrammingMethodProperty('name', e.target.value)}
          style={styles.textInput}
        />
      </label>
      <label>
        Key (Used in URLs)
        <input
          value={initialProgrammingMethod.key}
          readOnly
          style={styles.textInput}
        />
      </label>
      {programmingMethod.canHaveOverload && (
        <label>
          Overload Of
          <select
            value={programmingMethod.overloadOf || ''}
            onChange={e =>
              setProgrammingMethodProperty('overloadOf', e.target.value)
            }
            style={styles.selectInput}
          >
            <option value="">None</option>
            {overloadOptions.map(option => (
              <option key={option.key} value={option.key}>
                {option.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <CollapsibleEditorSection title="Documentation" collapsed>
        <label>
          External Documentation
          <HelpTip>Link to external documentation</HelpTip>
          <input
            value={programmingMethod.externalLink}
            onChange={e =>
              setProgrammingMethodProperty('externalLink', e.target.value)
            }
            style={styles.textInput}
          />
        </label>
        <TextareaWithMarkdownPreview
          markdown={programmingMethod.content}
          label={'Content'}
          handleMarkdownChange={e =>
            setProgrammingMethodProperty('content', e.target.value)
          }
          features={markdownEditorFeatures}
        />
      </CollapsibleEditorSection>
      <CollapsibleEditorSection title="Details" collapsed>
        <TextareaWithMarkdownPreview
          markdown={programmingMethod.syntax}
          label={'Syntax'}
          handleMarkdownChange={e =>
            setProgrammingMethodProperty('syntax', e.target.value)
          }
          features={markdownEditorFeatures}
        />
      </CollapsibleEditorSection>
      <CollapsibleEditorSection title="Parameters" collapsed>
        <OrderableList
          list={programmingMethod.parameters || []}
          setList={list => setProgrammingMethodProperty('parameters', list)}
          addButtonText="Add Another Parameter"
          renderItem={renderParameterEditor}
        />
      </CollapsibleEditorSection>
      <CollapsibleEditorSection title="Examples" collapsed>
        <OrderableList
          list={programmingMethod.examples || []}
          setList={list => setProgrammingMethodProperty('examples', list)}
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

const programmingMethodShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  key: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  categoryKey: PropTypes.string,
  externalLink: PropTypes.string,
  content: PropTypes.string,
  syntax: PropTypes.string,
  tips: PropTypes.string,
  examples: PropTypes.arrayOf(PropTypes.object),
  fields: PropTypes.arrayOf(PropTypes.object),
  methods: PropTypes.arrayOf(PropTypes.object)
});

ProgrammingMethodEditor.propTypes = {
  initialProgrammingMethod: programmingMethodShape.isRequired,
  overloadOptions: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    })
  )
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
