import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {
  DndContext,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import classNames from 'classnames';
import React, {useMemo, useState} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/lab2Redux';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {DndDataContextProvider} from './DnDDataContextProvider';
import {Droppable} from './Droppable';
import {FileBrowserHeaderPopUpButton} from './FileBrowserHeaderPopUpButton';
import {useHandleDragEnd} from './hooks';
import InnerFileBrowser from './InnerFileBrowser';
import {DragDataType, DropDataType} from './types';

import moduleStyles from './styles/filebrowser.module.scss';

export const FileBrowser = React.memo(() => {
  const {source, setFileType} = useCodebridgeContext();
  const isReadOnly = useAppSelector(isReadOnlyWorkspace);
  const appName = useAppSelector(state => state.lab.levelProperties?.appName);

  const [dragData, setDragData] = useState<DragDataType | undefined>(undefined);
  const [dropData, setDropData] = useState<DropDataType | undefined>(undefined);

  const dndMonitor = useMemo(
    () => ({
      onDragStart: (e: DragStartEvent) =>
        setDragData(e.active.data.current as DragDataType),
      onDragOver: (e: DragOverEvent) =>
        setDropData(e.over?.data.current as DropDataType),
      onDragEnd: (e: DragEndEvent) => {
        setDragData(undefined);
        setDropData(undefined);
      },
    }),
    [setDragData, setDropData]
  );

  const handleDragEnd = useHandleDragEnd();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 2,
      },
    })
  );

  return (
    <PanelContainer
      id="file-browser"
      headerContent={codebridgeI18n.filesHeader()}
      headerClassName={moduleStyles.fileBrowserHeader}
      className={moduleStyles['file-browser']}
      rightHeaderContent={!isReadOnly && <FileBrowserHeaderPopUpButton />}
    >
      <div className={moduleStyles.fileBrowserContents}>
        <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
          <DndDataContextProvider
            value={{dragData, dropData}}
            dndMonitor={dndMonitor}
          >
            <Droppable
              data={{id: DEFAULT_FOLDER_ID}}
              className={classNames(
                moduleStyles.droppableArea,
                moduleStyles.expandedDroppableArea,
                {
                  [moduleStyles.acceptingDrop]:
                    DEFAULT_FOLDER_ID === dropData?.id,
                }
              )}
            >
              <ul id="uitest-files-list">
                <InnerFileBrowser
                  parentId={DEFAULT_FOLDER_ID}
                  folders={source.folders}
                  files={source.files}
                  setFileType={setFileType}
                  appName={appName}
                />
              </ul>
            </Droppable>
          </DndDataContextProvider>
        </DndContext>
      </div>
    </PanelContainer>
  );
});
