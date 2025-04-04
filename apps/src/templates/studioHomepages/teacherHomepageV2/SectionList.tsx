import React, {useState} from 'react';

import {removeSectionOrThrow} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {SectionMap} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppSelector, useAppDispatch} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import {SectionCard} from './SectionCard';
import {SectionDeleteModal} from './SectionDeleteModal';

import styles from './teacherHomepage.module.scss';

interface SectionListProps {
  showHiddenOnly: boolean;
}

const NO_SECTION_ID = -1;

export const SectionList: React.FC<SectionListProps> = ({showHiddenOnly}) => {
  const dispatch = useAppDispatch();
  const [sectionToDelete, setSectionToDelete] = useState<number>(NO_SECTION_ID);
  const sections: SectionMap = useAppSelector(
    state => state.teacherSections.sections
  );

  const onDeleteClickCallback = (sectionId: number) => {
    setSectionToDelete(sectionId);
  };

  const onCloseDeleteDialog = () => {
    setSectionToDelete(NO_SECTION_ID);
  };

  const deleteSection = () => {
    HttpClient.delete(`/dashboardapi/sections/${sectionToDelete}`, true)
      .then(() => {
        dispatch(removeSectionOrThrow(sectionToDelete));
        setSectionToDelete(NO_SECTION_ID);
      })
      .catch((error: Error) => {
        alert(i18n.unexpectedError());
        console.error(error);
        setSectionToDelete(NO_SECTION_ID);
      });
  };

  const filteredSectionList = React.useMemo(() => {
    const sectionElementList: JSX.Element[] = [];
    for (const [k, section] of Object.entries(sections).filter(
      section => section[1].participantType === 'student'
    )) {
      if (showHiddenOnly === section.hidden) {
        sectionElementList.push(
          <SectionCard
            key={k}
            section={section}
            onDeleteClickCallback={onDeleteClickCallback}
          />
        );
      }
    }
    return sectionElementList;
  }, [sections, showHiddenOnly]);

  return (
    <div className={styles.sectionList}>
      {filteredSectionList}
      {sectionToDelete > NO_SECTION_ID && (
        <SectionDeleteModal
          onCloseCallback={onCloseDeleteDialog}
          sectionDeleteCallback={deleteSection}
        />
      )}
    </div>
  );
};
