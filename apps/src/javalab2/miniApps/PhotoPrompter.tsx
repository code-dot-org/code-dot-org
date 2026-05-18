// Photo prompter overlay. Rendered by TheaterPreview while Javabuilder is
// blocked waiting for a GET_IMAGE response.
//
// The user picks a file; we PUT it directly to the upload URL Javabuilder
// supplied with the prompt; success or failure is reported back over the
// WebSocket via the parent's `onResult` callback. This mirrors the legacy
// PhotoSelectionView / Theater.onPhotoPrompterFileSelected flow without
// the legacy redux plumbing.
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React, {useId, useState} from 'react';

import moduleStyles from './photo-prompter.module.scss';

interface PhotoPrompterProps {
  prompt: string;
  uploadUrl: string;
  onResult: (success: boolean) => void;
}

const uploadFile = (uploadUrl: string, file: File): Promise<boolean> =>
  new Promise(resolve => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl, true);
    xhr.onload = () => resolve(xhr.status >= 200 && xhr.status < 300);
    xhr.onerror = () => resolve(false);
    xhr.send(file);
  });

const PhotoPrompter: React.FunctionComponent<PhotoPrompterProps> = ({
  prompt,
  uploadUrl,
  onResult,
}) => {
  const inputId = useId();
  const [uploading, setUploading] = useState(false);

  const onChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ok = await uploadFile(uploadUrl, file);
    setUploading(false);
    onResult(ok);
  };

  return (
    <div className={moduleStyles.overlay}>
      <label htmlFor={inputId} className={moduleStyles.target}>
        <input
          id={inputId}
          type="file"
          accept="image/*"
          capture="environment"
          className={moduleStyles.hiddenInput}
          onChange={onChange}
          disabled={uploading}
        />
        <FontAwesomeV6Icon
          iconName="camera"
          iconStyle="solid"
          className={moduleStyles.icon}
        />
        <div className={moduleStyles.prompt}>
          {uploading ? 'Uploading…' : prompt || 'Tap to choose a photo'}
        </div>
      </label>
    </div>
  );
};

export default PhotoPrompter;
