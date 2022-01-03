import React, {useState} from 'react';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';
import TextareaWithMarkdownPreview from '@cdo/apps/lib/levelbuilder/TextareaWithMarkdownPreview';
import Button from '@cdo/apps/templates/Button';
import UploadImageDialog from '@cdo/apps/lib/levelbuilder/lesson-editor/UploadImageDialog';

const EDITOR_TYPES = ['blockly', 'droplet', 'text'];

const useProgrammingEnvironment = initialProgrammingEnvironment => {
  const [programmingEnvironment, setProgrammingEnvironment] = useState(
    initialProgrammingEnvironment
  );
  const updateProgrammingEnvironment = (key, value) => {
    setProgrammingEnvironment({...programmingEnvironment, [key]: value});
  };

  return [programmingEnvironment, updateProgrammingEnvironment];
};

export default function ProgrammingEnvironmentEditor({
  initialProgrammingEnvironment
}) {
  const [
    programmingEnvironment,
    updateProgrammingEnvironment
  ] = useProgrammingEnvironment(initialProgrammingEnvironment);
  const [uploadImageDialogOpen, setUploadImageDialogOpen] = useState(false);

  return (
    <div>
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
        <input
          value={programmingEnvironment.name || ''}
          onChange={e => updateProgrammingEnvironment('name', e.target.value)}
          style={styles.textInput}
          readOnly
        />
      </label>
      <label>
        Image
        <Button
          onClick={() => setUploadImageDialogOpen(true)}
          text="Choose Image"
          color="gray"
          icon="plus-circle"
        />
        {programmingEnvironment.imageUrl && (
          <span>{programmingEnvironment.imageUrl}</span>
        )}
      </label>

      <TextareaWithMarkdownPreview
        markdown={programmingEnvironment.description || ''}
        label={'Description'}
        handleMarkdownChange={e =>
          updateProgrammingEnvironment('description', e.target.value)
        }
        features={{imageUpload: true}}
      />
      <label>
        How should this document render?
        <select
          value={programmingEnvironment.editor_type}
          onChange={e =>
            updateProgrammingEnvironment('editorType', e.target.value)
          }
          style={styles.selectStyle}
        >
          {EDITOR_TYPES.map(type => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>
      <UploadImageDialog
        isOpen={uploadImageDialogOpen}
        handleClose={() => setUploadImageDialogOpen(false)}
        uploadImage={imgUrl => updateProgrammingEnvironment('imageUrl', imgUrl)}
        allowExpandable={false}
      />
    </div>
  );
}

ProgrammingEnvironmentEditor.propTypes = {
  initialProgrammingEnvironment: PropTypes.object.isRequired
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
