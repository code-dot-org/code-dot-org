import React, {useState} from 'react';
import PropTypes from 'prop-types';
import style from './rubrics.module.scss';
import classnames from 'classnames';
import i18n from '@cdo/locale';
import {Heading6} from '@cdo/apps/componentLibrary/typography';
import {
  reportingDataShape,
  rubricShape,
  studentLevelInfoShape,
} from './rubricShapes';
import RubricContent from './RubricContent';

const TAB_NAMES = {
  RUBRIC: 'rubric',
  SETTINGS: 'settings',
};

export default function RubricContainer({
  rubric,
  studentLevelInfo,
  teacherHasEnabledAi,
  currentLevelName,
  reportingData,
}) {
  const [selectedTab, setSelectedTab] = useState(TAB_NAMES.RUBRIC);

  return (
    <div className={style.rubricContainer}>
      <div className={style.rubricHeader}>
        <div className={style.rubricHeaderLeftSide}>
          <HeaderTab
            text={i18n.rubric()}
            isSelected={selectedTab === TAB_NAMES.RUBRIC}
            onClick={() => setSelectedTab(TAB_NAMES.RUBRIC)}
          />
          <HeaderTab
            text={i18n.settings()}
            isSelected={selectedTab === TAB_NAMES.SETTINGS}
            onClick={() => setSelectedTab(TAB_NAMES.SETTINGS)}
          />
        </div>
      </div>
      <RubricContent
        rubric={rubric}
        studentLevelInfo={studentLevelInfo}
        teacherHasEnabledAi={teacherHasEnabledAi}
        currentLevelName={currentLevelName}
        reportingData={reportingData}
      />
    </div>
  );
}

RubricContainer.propTypes = {
  rubric: rubricShape,
  reportingData: reportingDataShape,
  studentLevelInfo: studentLevelInfoShape,
  teacherHasEnabledAi: PropTypes.bool,
  currentLevelName: PropTypes.string,
};

const HeaderTab = ({text, isSelected, onClick}) => {
  return (
    <div
      className={classnames(style.rubricHeaderTab, {
        [style.selectedTab]: isSelected,
        [style.unselectedTab]: !isSelected,
      })}
      onClick={onClick}
    >
      <Heading6>{text}</Heading6>
    </div>
  );
};

HeaderTab.propTypes = {
  text: PropTypes.string.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};
