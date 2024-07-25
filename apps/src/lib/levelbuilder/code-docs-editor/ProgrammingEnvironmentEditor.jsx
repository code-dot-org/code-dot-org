import $ from 'jquery';
import PropTypes from 'prop-types';
import React, {useState} from 'react';

import CollapsibleEditorSection from '@cdo/apps/lib/levelbuilder/CollapsibleEditorSection';
import SaveBar from '@cdo/apps/lib/levelbuilder/SaveBar';
import TextareaWithMarkdownPreview from '@cdo/apps/lib/levelbuilder/TextareaWithMarkdownPreview';
import HelpTip from '@cdo/apps/lib/ui/HelpTip';
import color from '@cdo/apps/util/color';
import {navigateToHref} from '@cdo/apps/utils';

import ImageInput from '../ImageInput';

import OrderableList from './OrderableList';

const EDITOR_LANGUAGES = ['blockly', 'droplet', 'html/css', 'java'];

const useProgrammingEnvironment = initialProgrammingEnvironment => {
  const [programmingEnvironment, setProgrammingEnvironment] = useState(
    initialProgrammingEnvironment
  );
  const updateProgrammingEnvironment = (key, value) => {
    setProgrammingEnvironment({...programmingEnvironment, [key]: value});
  };

  return [
    programmingEnvironment,
    updateProgrammingEnvironment,
    setProgrammingEnvironment,
  ];
};

const renderCategoryEditor = (category, updateFunc) => {
  return (
    <div>
      <label>
        Name
        <input
          value={category.name || ''}
          onChange={e => updateFunc('name', e.target.value)}
          style={styles.textInput}
        />
      </label>
      <label>
        Color
        <input
          value={category.color || ''}
          onChange={e => updateFunc('color', e.target.value)}
          type="color"
          style={styles.colorInput}
        />
      </label>
    </div>
  );
};

export default function ProgrammingEnvironmentEditor({
  initialProgrammingEnvironment,
}) {
  const {name, showPath, ...remainingProgrammingEnvironment} =
    initialProgrammingEnvironment;
  const [
    programmingEnvironment,
    updateProgrammingEnvironment,
    setProgrammingEnvironment,
  ] = useProgrammingEnvironment(remainingProgrammingEnvironment);
  const [isSaving, setIsSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  const save = (e, shouldCloseAfterSave) => {
    if (isSaving) {
      return;
    }
    setIsSaving(true);
    fetch(`/programming_environments/${name}`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content'),
      },
      body: JSON.stringify(programmingEnvironment),
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
          navigateToHref(showPath);
        } else {
          setLastUpdated(Date.now());
          setError(null);
          delete json.name;
          setProgrammingEnvironment(json);
        }
      })
      .catch(error => {
        setIsSaving(false);
        setError(error);
      });
  };

  return (
    <div>
      <h1>{`Editing ${name}`}</h1>
      <label>
        Title
        <input
          value={programmingEnvironment.title || ''}
          onChange={e => updateProgrammingEnvironment('title', e.target.value)}
          style={styles.textInput}
        />
      </label>
      <label>
        IDE URL (Slug)
        <input value={name} style={styles.textInput} readOnly />
      </label>
      <label>
        Published
        <HelpTip>
          If checked, this programming environment will appear on /docs and all
          pages will be accessible. If unchecked, only levelbuilders will be
          able to access the pages.
        </HelpTip>
        <input
          checked={programmingEnvironment.published}
          onChange={e =>
            updateProgrammingEnvironment('published', e.target.checked)
          }
          type="checkbox"
          style={styles.checkboxInput}
        />
      </label>
      <label>
        How should this document render?
        <select
          value={programmingEnvironment.editorLanguage || EDITOR_LANGUAGES[0]}
          onChange={e =>
            updateProgrammingEnvironment('editorLanguage', e.target.value)
          }
          style={styles.selectInput}
        >
          {EDITOR_LANGUAGES.map(type => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>
      {programmingEnvironment.editorLanguage === 'blockly' && (
        <label>
          Block Pool Name
          <HelpTip>
            The block pool that will be used to show embedded blocks.{' '}
          </HelpTip>
          <input
            value={programmingEnvironment.blockPoolName || ''}
            onChange={e =>
              updateProgrammingEnvironment('blockPoolName', e.target.value)
            }
            style={styles.textInput}
          />
        </label>
      )}
      <label>
        Project URL
        <input
          value={programmingEnvironment.projectUrl || ''}
          onChange={e =>
            updateProgrammingEnvironment('projectUrl', e.target.value)
          }
          style={styles.textInput}
        />
      </label>
      <ImageInput
        initialImageUrl={programmingEnvironment.imageUrl}
        updateImageUrl={imgUrl =>
          updateProgrammingEnvironment('imageUrl', imgUrl)
        }
      />
      <TextareaWithMarkdownPreview
        markdown={programmingEnvironment.description || ''}
        label={'Description'}
        handleMarkdownChange={e =>
          updateProgrammingEnvironment('description', e.target.value)
        }
        features={{imageUpload: true}}
      />
      <CollapsibleEditorSection title="Categories" collapsed>
        <OrderableList
          list={programmingEnvironment.categories || []}
          setList={list => updateProgrammingEnvironment('categories', list)}
          addButtonText="Add Category"
          renderItem={renderCategoryEditor}
          checkItemDeletionAllowed={item => !!item.deletable}
        />
      </CollapsibleEditorSection>
      <SaveBar
        handleSave={save}
        isSaving={isSaving}
        lastSaved={lastUpdated}
        error={error}
        handleView={() => navigateToHref(showPath)}
      />
    </div>
  );
}

ProgrammingEnvironmentEditor.propTypes = {
  initialProgrammingEnvironment: PropTypes.object.isRequired,
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
  colorInput: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '4px 6px',
    color: '#555',
    border: `1px solid ${color.bootstrap_border_color}`,
    borderRadius: 4,
    marginBottom: 0,
    height: 25,
  },
  checkboxInput: {
    margin: '0px 4px',
  },
};
