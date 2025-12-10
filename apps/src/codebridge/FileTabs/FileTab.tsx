import CloseButton from '@code-dot-org/component-library/closeButton';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {BodyFourText} from '@code-dot-org/component-library/typography';
import {ProjectFile} from '@codebridge/types';
import {getFileIconNameAndStyle} from '@codebridge/utils';
import classNames from 'classnames';
import {throttle} from 'lodash';
import React, {useEffect, useMemo, useRef} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {getActiveFileForSource} from '@cdo/apps/lab2/projects/utils';
import {
  closeFileThunk,
  setActiveFileThunk,
} from '@cdo/apps/lab2/redux/lab2ProjectReduxThunks';
import {MultiFileSource} from '@cdo/apps/lab2/types';
import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import moduleStyles from './styles/fileTabs.module.scss';

type FileTabProps = {
  file: ProjectFile;
};

const FileTab = ({file}: FileTabProps) => {
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
  const tabRef = useRef<HTMLDivElement>(null);

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
      sendLab2AnalyticsEvent(
        EVENTS.AI_TUTOR_VERSION_FILE_TAB_CLICKED_IN_TABS_BAR,
        {
          fileName: file.name,
          fileType: file.language,
          aiTutorVersionFileUpdated: file.isAiTutorVersionUpdated
            ? 'true'
            : 'false',
          aiTutorVersionFileCreated: file.isAiTutorVersionCreated
            ? 'true'
            : 'false',
        }
      );
    }
  };
  return (
    <div className={className} key={file.id}>
      <div
        className={moduleStyles.label}
        onClick={() => handleOnClick(file.id)}
        ref={tabRef}
      >
        <FontAwesomeV6Icon
          iconName={iconName}
          iconStyle={iconStyle}
          className={iconClassName}
        />
        <BodyFourText noMargin>{file.name}</BodyFourText>
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

export default FileTab;
