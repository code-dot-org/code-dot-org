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
  const [programmingMethod, setProgrammingMethod] = useState(
    initialProgrammingMethod
  );

  function updateProgrammingMethod(key, value) {
    setProgrammingMethod({...programmingMethod, [key]: value});
  }

  return [programmingMethod, updateProgrammingMethod, setProgrammingMethod];
}

function renderExampleEditor(example, updateFunc) {
  return <ExampleEditor example={example} updateExample={updateFunc} />;
}

function renderParameterEditor(parameter, updateFunc) {
  return <ParameterEditor parameter={parameter} update={updateFunc} />;
}

export default function ProgrammingMethodEditor({initialProgrammingMethod}) {
  // We don't want to update id or key
  const {id, key, ...remainingProgrammingMethod} = initialProgrammingMethod;
  if (remainingProgrammingMethod.examples) {
    remainingProgrammingMethod.examples.forEach(e => (e.key = createUuid()));
  }
  if (remainingProgrammingMethod.parameters) {
    remainingProgrammingMethod.parameters.forEach(p => (p.key = createUuid()));
  }
  const [
    programmingMethod,
    updateProgrammingMethod,
    setProgrammingMethod
  ] = useProgrammingMethod(remainingProgrammingMethod);
  const [isSaving, setIsSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  const save = (e, shouldCloseAfterSave) => {
    if (isSaving) {
      return;
    }
    setIsSaving(true);
    fetch(`/programming_methods/${id}`, {
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
          setProgrammingMethod(json);
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
          onChange={e => updateProgrammingMethod('name', e.target.value)}
          style={styles.textInput}
        />
      </label>
      <label>
        Key (Used in URLs)
        <input value={key} readOnly style={styles.textInput} />
      </label>
      <CollapsibleEditorSection title="Documentation" collapsed>
        <label>
          External Documentation
          <HelpTip>Link to external documentation</HelpTip>
          <input
            value={programmingMethod.externalDocumentation}
            onChange={e =>
              updateProgrammingMethod('externalDocumentation', e.target.value)
            }
            style={styles.textInput}
          />
        </label>
        <TextareaWithMarkdownPreview
          markdown={programmingMethod.content}
          label={'Content'}
          handleMarkdownChange={e =>
            updateProgrammingMethod('content', e.target.value)
          }
          features={markdownEditorFeatures}
        />
      </CollapsibleEditorSection>
      <CollapsibleEditorSection title="Details" collapsed>
        <TextareaWithMarkdownPreview
          markdown={programmingMethod.syntax}
          label={'Syntax'}
          handleMarkdownChange={e =>
            updateProgrammingMethod('syntax', e.target.value)
          }
          features={markdownEditorFeatures}
        />
      </CollapsibleEditorSection>
      <CollapsibleEditorSection title="Parameters" collapsed>
        <OrderableList
          list={programmingMethod.parameters || []}
          setList={list => updateProgrammingMethod('parameters', list)}
          addButtonText="Add Another Parameter"
          renderItem={renderParameterEditor}
        />
      </CollapsibleEditorSection>
      <CollapsibleEditorSection title="Examples" collapsed>
        <OrderableList
          list={programmingMethod.examples || []}
          setList={list => updateProgrammingMethod('examples', list)}
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
  externalDocumentation: PropTypes.string,
  content: PropTypes.string,
  syntax: PropTypes.string,
  tips: PropTypes.string,
  examples: PropTypes.arrayOf(PropTypes.object),
  fields: PropTypes.arrayOf(PropTypes.object),
  methods: PropTypes.arrayOf(PropTypes.object)
});

ProgrammingMethodEditor.propTypes = {
  initialProgrammingMethod: programmingMethodShape.isRequired
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
