import ImageEditor from '@toast-ui/react-image-editor';
import PropTypes from 'prop-types';
import React, {useRef} from 'react';

import 'tui-image-editor/dist/tui-image-editor.css';
import Button from '@cdo/apps/legacySharedComponents/Button';

const editorOptions = {
  includeUI: {
    loadImage: {
      path: '',
      name: 'SampleImage',
    },
    theme: {},
    menu: ['crop', 'flip', 'rotate', 'draw', 'shape', 'text', 'resize'], // Added 'resize' to the menu
    initMenu: 'crop',
    uiSize: {
      width: '100%',
      height: '100%',
    },
    menuBarPosition: 'bottom',
  },
  cssMaxWidth: 700,
  cssMaxHeight: 500,
  selectionStyle: {
    cornerSize: 20,
    rotatingPointOffset: 70,
  },
};

export default function UploadImageEditor({imageUrl, onSave, onCancel}) {
  const editorRef = useRef(null);

  const handleSave = () => {
    const editorInstance = editorRef.current.getInstance();
    const editedImageUrl = editorInstance.toDataURL();

    // Convert Data URL to a File object
    const dataUrlToFile = (dataUrl, filename) => {
      const arr = dataUrl.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, {type: mime});
    };

    const editedImageFile = dataUrlToFile(editedImageUrl, 'edited-image.png');

    onSave(editedImageUrl, editedImageFile);
  };

  return (
    <div className="image-editor-container">
      <ImageEditor
        ref={editorRef}
        {...editorOptions}
        includeUI={{
          ...editorOptions.includeUI,
          loadImage: {
            path: imageUrl,
            name: 'EditableImage',
          },
        }}
      />
      <div className="editor-controls">
        <Button
          text="Save"
          onClick={handleSave}
          color={Button.ButtonColor.brandPrimaryDefault}
        />
        <Button
          text="Cancel"
          onClick={onCancel}
          color={Button.ButtonColor.neutralDefault}
        />
      </div>
    </div>
  );
}

// Prop types
UploadImageEditor.propTypes = {
  imageUrl: PropTypes.string.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
