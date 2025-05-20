import CloseButton from '@code-dot-org/component-library/closeButton';
import {BodyThreeText} from '@code-dot-org/component-library/typography';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import {selectedSectionSelector} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import {selectReadyStudentCount} from './teacherRubricRedux';

import style from './rubrics.module.scss';
import dialogStyle from '@cdo/apps/sharedComponents/accessible-dialogue.module.scss';

export default function StudentScoresAlert({closeAlert, viewScores}) {
  const studentCount = useAppSelector(selectReadyStudentCount);
  const section = useAppSelector(selectedSectionSelector);
  const sectionName = section?.name;

  if (!studentCount || !sectionName) {
    return null;
  }

  return (
    <div
      className={classnames(style.dismissableAlert, 'uitest-dismissible-alert')}
    >
      <span className={style.dismissableAlertText}>
        <BodyThreeText>
          {i18n.rubricStudentScoresAlert({studentCount, sectionName})}
        </BodyThreeText>
      </span>
      <CloseButton
        className={dialogStyle.xCloseButton}
        onClick={closeAlert}
        aria-label={i18n.closeDialog()}
      />
      <button
        type="button"
        onClick={viewScores}
        className={style.viewScoresButton}
      >
        <span className={style.viewScoresText}>{i18n.rubricViewScores()}</span>
      </button>
    </div>
  );
}

StudentScoresAlert.propTypes = {
  closeAlert: PropTypes.func.isRequired,
  viewScores: PropTypes.func.isRequired,
};
