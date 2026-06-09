import CloseButton from '@code-dot-org/component-library/closeButton';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {ProjectFile} from '@codebridge/types';
import {getFileIconNameAndStyle} from '@codebridge/utils';
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {Typography} from '@mui/material';
import classNames from 'classnames';
import {throttle} from 'lodash';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {getActiveFileForSource} from '@cdo/apps/lab2/projects/utils';
import {
  closeFileThunk,
  setActiveFileThunk,
} from '@cdo/apps/lab2/redux/lab2ProjectReduxThunks';
import {MultiFileSource} from '@cdo/apps/lab2/types';
import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
import {getFileExtension} from '@cdo/apps/lab2/utils/multiFileSourceUtils';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import moduleStyles from './styles/fileTabs.module.scss';

type FileTabProps = {
  file: ProjectFile;
  isDragging?: boolean;
  onKeyDown?: (event: React.KeyboardEvent) => void;
};

const FileTab = ({file, isDragging = false, onKeyDown}: FileTabProps) => {
  const activeFile = useAppSelector(state => {
    const source = state.lab2Project.projectSources?.source as MultiFileSource;
    return getActiveFileForSource(source);
  });
  const dispatch = useAppDispatch();
  const {iconName, iconStyle, isBrand} = getFileIconNameAndStyle(file);
  const iconClassName = isBrand ? 'fa-brands' : undefined;
  const isActive = file.active || file === activeFile;
  const isAiTutorVersionFile =
    file.isAiTutorVersionUpdated || file.isAiTutorVersionCreated || false;
  const isAiTutorVersion = useAppSelector(
    state => state.lab2Project.viewingAiTutorVersion
  );
  const className = classNames(moduleStyles.fileTab, {
    [moduleStyles.aiTutorVersionActive]: isActive && isAiTutorVersionFile,
    [moduleStyles.aiTutorVersionInactive]: !isActive && isAiTutorVersionFile,
    [moduleStyles.active]: isActive && !isAiTutorVersionFile,
  });

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({id: file.id});

  const tabRef = useRef<HTMLDivElement | null>(null);

  // Combine the scroll ref and dnd-kit's activator ref on the label element.
  const labelRef = useCallback(
    (node: HTMLDivElement | null) => {
      tabRef.current = node;
      setActivatorNodeRef(node);
    },
    [setActivatorNodeRef]
  );

  const dndStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1.0,
  };

  const scrollTabIntoView = () =>
    tabRef.current?.scrollIntoView({block: 'end', inline: 'start'});

  const throttledScrollTabIntoView = useMemo(
    () => throttle(scrollTabIntoView, 30),
    []
  );

  useEffect(() => {
    if (isActive) {
      scrollTabIntoView();
      window.addEventListener('resize', throttledScrollTabIntoView);
    } else {
      window.removeEventListener('resize', throttledScrollTabIntoView);
    }
    return () =>
      window.removeEventListener('resize', throttledScrollTabIntoView);
  }, [isActive, throttledScrollTabIntoView]);

  const handleOnClick = (id: string) => {
    dispatch(setActiveFileThunk(file.id));
    if (isAiTutorVersion) {
      sendLab2AnalyticsEvent(EVENTS.AI_TUTOR_VERSION_VIEW_FILE_CLICKED, {
        fileName: file.name,
        fileType: getFileExtension(file.name),
        aiTutorVersionFileUpdated: file.isAiTutorVersionUpdated
          ? 'true'
          : 'false',
        aiTutorVersionFileCreated: file.isAiTutorVersionCreated
          ? 'true'
          : 'false',
      });
    }
  };

  // Merge tab-activation keydown with dnd-kit's drag keydown.
  const handleLabelKeyDown = (event: React.KeyboardEvent) => {
    if (onKeyDown) onKeyDown(event);
    if (listeners?.onKeyDown) {
      (listeners.onKeyDown as (e: React.KeyboardEvent) => void)(event);
    }
  };

  return (
    <div className={className} key={file.id} ref={setNodeRef} style={dndStyle}>
      {/* Drag handle: role="button" lives here, NOT wrapping the close button */}
      <div
        ref={labelRef}
        className={moduleStyles.label}
        onClick={() => handleOnClick(file.id)}
        {...attributes}
        {...listeners}
        onKeyDown={handleLabelKeyDown}
      >
        <FontAwesomeV6Icon
          iconName={iconName}
          iconStyle={iconStyle}
          className={iconClassName}
        />
        <Typography variant="body4">{file.name}</Typography>
      </div>
      <CloseButton
        onClick={() => dispatch(closeFileThunk(file.id))}
        color={'light'}
        aria-label={codebridgeI18n.closeFile({filename: file.name})}
        className={moduleStyles.closeButton}
        size="s"
      />
    </div>
  );
};

// Visual-only clone used in DragOverlay (no DnD hooks, no close button).
export const FileTabContent = ({file}: {file: ProjectFile}) => {
  const activeFile = useAppSelector(state => {
    const source = state.lab2Project.projectSources?.source as MultiFileSource;
    return getActiveFileForSource(source);
  });
  const {iconName, iconStyle, isBrand} = getFileIconNameAndStyle(file);
  const iconClassName = isBrand ? 'fa-brands' : undefined;
  const isActive = file.active || file === activeFile;
  const isAiTutorVersionFile =
    file.isAiTutorVersionUpdated || file.isAiTutorVersionCreated || false;
  const className = classNames(moduleStyles.fileTab, {
    [moduleStyles.aiTutorVersionActive]: isActive && isAiTutorVersionFile,
    [moduleStyles.aiTutorVersionInactive]: !isActive && isAiTutorVersionFile,
    [moduleStyles.active]: isActive && !isAiTutorVersionFile,
  });

  return (
    <div className={className}>
      <div className={moduleStyles.label}>
        <FontAwesomeV6Icon
          iconName={iconName}
          iconStyle={iconStyle}
          className={iconClassName}
        />
        <Typography variant="body4">{file.name}</Typography>
      </div>
      <CloseButton
        onClick={() => {}} // Maintain visual display but disable close button during drag
        color={'light'}
        aria-label={codebridgeI18n.closeFile({filename: file.name})}
        className={moduleStyles.closeButton}
        size="s"
      />
    </div>
  );
};

export default FileTab;
