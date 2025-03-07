import {FolderId} from '@codebridge/types';
import {shouldShowFile} from '@codebridge/utils';
import classNames from 'classnames';
import React from 'react';

import {START_SOURCES} from '@cdo/apps/lab2/constants';
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/lab2Redux';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {MultiFileSource, ProjectFileType} from '@cdo/apps/lab2/types';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {useDndDataContext} from './DnDDataContextProvider';
import {NotDraggable, Draggable} from './Draggable';
import {Droppable} from './Droppable';
import {FolderRow, FileRowProps, FileRow} from './FileBrowserRow';
import {setFileType, DragType} from './types';

import moduleStyles from './styles/filebrowser.module.scss';

type FilesComponentProps = {
  files: MultiFileSource['files'];
  folders: MultiFileSource['folders'];
  parentId?: FolderId;
  setFileType: setFileType;
  appName?: string;
};

/**
 * Recursive component that renders the file tree, starting from the folder with the given parentId
 * (there is an implicit root folder with a default parentId).
 */
const InnerFileBrowser = React.memo(
  ({parentId, folders, files, setFileType, appName}: FilesComponentProps) => {
    const {dragData, dropData} = useDndDataContext();
    const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;

    const hasValidationFile = !!Object.values(files).find(
      f => f.type === ProjectFileType.VALIDATION
    );
    const isReadOnly = useAppSelector(isReadOnlyWorkspace);

    return (
      <>
        {Object.values(folders)
          .filter(f => f.parentId === parentId)
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(f => {
            const MaybeDraggable = isReadOnly ? NotDraggable : Draggable;
            return (
              <Droppable
                data={{id: f.id}}
                key={f.id + f.open}
                Component="li"
                className={classNames(moduleStyles.droppableArea, {
                  [moduleStyles.acceptingDrop]:
                    f.id === dropData?.id && dragData?.parentId !== f.id,
                })}
              >
                <MaybeDraggable
                  data={{id: f.id, type: DragType.FOLDER, parentId: f.parentId}}
                >
                  <FolderRow
                    item={f}
                    enableMenu={!isReadOnly && !dragData?.id}
                  />
                  {f.open && (
                    <ul>
                      <InnerFileBrowser
                        folders={folders}
                        parentId={f.id}
                        files={files}
                        setFileType={setFileType}
                        appName={appName}
                      />
                    </ul>
                  )}
                </MaybeDraggable>
              </Droppable>
            );
          })}
        {Object.values(files)
          .filter(f => f.folderId === parentId && shouldShowFile(f))
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(f => {
            const isDraggingLocked =
              isReadOnly ||
              (!isStartMode && f.type === ProjectFileType.LOCKED_STARTER);
            const fileRowProps: FileRowProps = {
              item: f,
              hasValidationFile,
              enableMenu: !isReadOnly && (!dragData?.id || isDraggingLocked),
            };
            const MaybeDraggable = isDraggingLocked ? NotDraggable : Draggable;
            return (
              <MaybeDraggable
                data={{id: f.id, type: DragType.FILE, parentId: f.folderId}}
                key={f.id}
                Component="li"
              >
                <FileRow {...fileRowProps} />
              </MaybeDraggable>
            );
          })}
      </>
    );
  }
);

export default InnerFileBrowser;
