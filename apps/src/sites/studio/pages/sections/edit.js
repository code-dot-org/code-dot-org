import {Heading1} from '@code-dot-org/component-library/typography';
import React from 'react';
import ReactDOM from 'react-dom';

import SectionsSetUpContainer from '@cdo/apps/templates/sectionsRefresh/SectionsSetUpContainer';
import getScriptData from '@cdo/apps/util/getScriptData';
import i18n from '@cdo/locale';

import moduleStyles from './sections.module.scss';
$(document).ready(initPage);

function initPage() {
  const section = getScriptData('section');
  const canEnableAITutor = getScriptData('canEnableAITutor');

  const sectionWithUpdatedFields = {
    ...section,
    grades: section.grade,
    lessonExtras: section.stageExtras,
  };

  ReactDOM.render(
    <div className={moduleStyles.containerWithMarginTop}>
      <Heading1>{i18n.editSectionDetails()}</Heading1>
      <SectionsSetUpContainer
        sectionToBeEdited={sectionWithUpdatedFields}
        canEnableAITutor={canEnableAITutor}
        defaultRedirectUrl="/home"
      />
    </div>,
    document.getElementById('form')
  );
}
