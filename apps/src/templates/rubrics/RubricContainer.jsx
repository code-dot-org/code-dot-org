import React, {useState} from 'react';
import PropTypes from 'prop-types';
import style from './rubrics.module.scss';
import classnames from 'classnames';
import i18n from '@cdo/locale';
import {Heading6} from '@cdo/apps/componentLibrary/typography';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {
  reportingDataShape,
  rubricShape,
  studentLevelInfoShape,
} from './rubricShapes';
import RubricContent from './RubricContent';
import RubricSettings from './RubricSettings';

const TAB_NAMES = {
  RUBRIC: 'rubric',
  SETTINGS: 'settings',
};

export default function RubricContainer({
  rubric,
  studentLevelInfo,
  initialTeacherHasEnabledAi,
  currentLevelName,
  reportingData,
  open,
  closeRubric,
}) {
  const onLevelForEvaluation = currentLevelName === rubric.level.name;
  const canProvideFeedback = !!studentLevelInfo && onLevelForEvaluation;

  const [selectedTab, setSelectedTab] = useState(TAB_NAMES.RUBRIC);
  const [teacherHasEnabledAi, setTeacherHasEnabledAi] = useState(
    initialTeacherHasEnabledAi
  );

  return (
    <div
      className={classnames(style.rubricContainer, {
        [style.hiddenRubricContainer]: !open,
      })}
    >
      <div className={style.rubricHeader}>
        <div className={style.rubricHeaderLeftSide}>
          <HeaderTab
            text={i18n.rubric()}
            isSelected={selectedTab === TAB_NAMES.RUBRIC}
            onClick={() => setSelectedTab(TAB_NAMES.RUBRIC)}
          />
          {canProvideFeedback && teacherHasEnabledAi && (
            <HeaderTab
              text={i18n.settings()}
              isSelected={selectedTab === TAB_NAMES.SETTINGS}
              onClick={() => setSelectedTab(TAB_NAMES.SETTINGS)}
            />
          )}
        </div>
        <div className={style.rubricHeaderRightSide}>
          <button
            type="button"
            onClick={closeRubric}
            className={classnames(style.buttonStyle, style.closeButton)}
          >
            <FontAwesome icon="xmark" />
          </button>
        </div>
      </div>

      <RubricContent
        rubric={rubric}
        studentLevelInfo={studentLevelInfo}
        teacherHasEnabledAi={teacherHasEnabledAi}
        canProvideFeedback={canProvideFeedback}
        onLevelForEvaluation={onLevelForEvaluation}
        reportingData={reportingData}
        visible={selectedTab === TAB_NAMES.RUBRIC}
      />
      <RubricSettings
        canProvideFeedback={canProvideFeedback}
        teacherHasEnabledAi={teacherHasEnabledAi}
        updateTeacherAiSetting={setTeacherHasEnabledAi}
        rubricId={rubric.id}
        studentUserId={studentLevelInfo && studentLevelInfo['user_id']}
        visible={selectedTab === TAB_NAMES.SETTINGS}
      />
    </div>
  );
}

RubricContainer.propTypes = {
  rubric: rubricShape,
  reportingData: reportingDataShape,
  studentLevelInfo: studentLevelInfoShape,
  initialTeacherHasEnabledAi: PropTypes.bool,
  currentLevelName: PropTypes.string,
  closeRubric: PropTypes.func,
  open: PropTypes.bool,
};

const HeaderTab = ({text, isSelected, onClick}) => {
  return (
    <button
      className={classnames(style.rubricHeaderTab, style.buttonStyle, {
        [style.selectedTab]: isSelected,
        [style.unselectedTab]: !isSelected,
      })}
      onClick={onClick}
      type="button"
    >
      <Heading6>{text}</Heading6>
    </button>
  );
};

HeaderTab.propTypes = {
  text: PropTypes.string.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};
