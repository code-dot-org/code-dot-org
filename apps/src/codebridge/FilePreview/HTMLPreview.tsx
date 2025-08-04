import {ProjectFile} from '@codebridge/types';
import {findFolder} from '@codebridge/utils';
import React, {useRef, useMemo} from 'react';

import {MultiFileSource} from '@cdo/apps/lab2/types';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import moduleStyles from './styles/filePreview.module.scss';

type HTMLPreviewProps = {
  file: ProjectFile;
};

export const HTMLPreview = ({file}: HTMLPreviewProps) => {
  const iframeRef = useRef(null);
  const {files, folders} = useAppSelector(
    state => state.lab2Project.projectSources?.source as MultiFileSource
  );

  const srcdoc = useMemo(() => {
    if (!file) {
      return '';
    }

    const contents = file.contents.replace(
      new RegExp('<link rel="stylesheet" href="([^"]+)"\\s*/>', 'g'),
      (_: unknown, styleURI: string) => {
        // this is tedious. Break apart the style URI and look up all folders to get the final folder ID.
        // THEN look for a file with the same name and folder and that's what we need.

        const styleFolders = styleURI.split('/');
        const styleName = styleFolders.pop();

        const folderId = findFolder(styleFolders, {
          folders: Object.values(folders),
        });

        const styleFile = Object.values(files).find(
          f => f.name === styleName && f.folderId === folderId
        );

        return `
          <style>
            ${styleFile?.contents}
          </style>
      `;
      }
    );

    return contents;
  }, [files, folders, file]);

  return (
    <div className={moduleStyles.previewContainer}>
      {file && (
        <iframe
          sandbox=""
          allow="self"
          title="Web Preview"
          ref={iframeRef}
          id="preview"
          style={{width: '100%', height: '100%', backgroundColor: 'white'}}
          srcDoc={srcdoc}
          className={moduleStyles.iframePreview}
        />
      )}
    </div>
  );
};
