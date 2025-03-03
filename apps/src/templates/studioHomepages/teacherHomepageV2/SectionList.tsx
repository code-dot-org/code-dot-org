import {Heading4} from '@code-dot-org/component-library/typography';
import React, {useState} from 'react';

import {removeSectionOrThrow} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {SectionMap} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import {useAppSelector, useAppDispatch} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import {SectionCard} from './SectionCard';
import {SectionDeleteModal} from './SectionDeleteModal';

import styles from './teacherHomepage.module.scss';

export const SectionList: React.FC = () => {
  const dispatch = useAppDispatch();
  const [deletingSection, setDeletingSection] = useState<boolean>(false);
  const [sectionToDelete, setSectionToDelete] = useState<number>(-1);
  const sections: SectionMap = useAppSelector(
    state => state.teacherSections.sections
  );

  const onDeleteClickCallback = (sectionId: number) => {
    setDeletingSection(true);
    setSectionToDelete(sectionId);
  };

  const onCloseDeleteDialog = () => {
    setDeletingSection(false);
    setSectionToDelete(-1);
  };

  const deleteSection = () => {
    $.ajax({
      url: `/dashboardapi/sections/${sectionToDelete}`,
      method: 'DELETE',
    })
      .done(() => {
        dispatch(removeSectionOrThrow(sectionToDelete));
        setDeletingSection(false);
        setSectionToDelete(-1);
      })
      .fail((jqXhr, status) => {
        // We may want to handle this more cleanly in the future, but for now this
        // matches the experience we got in angular
        alert(i18n.unexpectedError());
        console.error(status);
        setDeletingSection(false);
        setSectionToDelete(-1);
      });
  };

  const getSectionList = (sections: SectionMap) => {
    const sectionElementList: JSX.Element[] = [];
    for (const [k, v] of Object.entries(sections)) {
      sectionElementList.push(
        <SectionCard
          key={k}
          section={v}
          onDeleteClickCallback={onDeleteClickCallback}
        />
      );
    }
    return sectionElementList;
  };

  return (
    <div className={styles.sectionList}>
      <Heading4>{i18n.classSections()}</Heading4>
      {getSectionList(sections)}
      {deletingSection && (
        <SectionDeleteModal
          onCloseCallback={onCloseDeleteDialog}
          sectionDeleteCallback={deleteSection}
        />
      )}
    </div>
  );
};
