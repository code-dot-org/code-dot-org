import React, {useCallback, useRef} from 'react';
import {useDispatch} from 'react-redux';

import HttpClient from '@cdo/apps/util/HttpClient';
import i18n from '@cdo/locale';

import {sectionHasNewData} from '../../teacherDashboard/teacherSectionsRedux';
import {Section} from '../../teacherDashboard/types/teacherSectionTypes';
import {EmptyState} from '../../teacherNavigation/EmptyState';

import noArchivedSections from './images/no_archived_sections.png';
import {SectionCard} from './SectionCard';

import styles from './teacherHomepage.module.scss';

interface EmptyHomepageProps {
  studioUrlPrefix: string;
  showHiddenOnly: boolean;
}

const DEMO_SECTIONS_API = '/api/v1/sections/demo';

const DEMO_SECTION: Section = {
  aiTutorEnabled: false,
  code: 'DEMO01',
  courseDisplayName: 'Computer Science Discoveries',
  courseId: 1,
  grades: ['6', '7', '8'],
  hidden: false,
  id: -1,
  lessonExtras: false,
  loginType: 'word',
  name: 'Demo Classroom',
  pairingAllowed: false,
  participantType: 'student',
  providerManaged: false,
  restrictSection: false,
  sharingDisabled: false,
  studentCount: 25,
  ttsAutoplayEnabled: false,
  unitName: null,
  unitPosition: null,
  avatar_color: 3,
  avatar_emoji: 5,
};

export const EmptyHomepage: React.FC<EmptyHomepageProps> = ({
  studioUrlPrefix,
  showHiddenOnly,
}) => {
  const dispatch = useDispatch();
  const section = DEMO_SECTION;
  const createdSectionIdRef = useRef<number | null>(null);

  const createDemoSection = useCallback(async (): Promise<number> => {
    if (createdSectionIdRef.current) {
      return createdSectionIdRef.current;
    }

    const response = await HttpClient.post(
      `${DEMO_SECTIONS_API}/aif`,
      undefined,
      true,
      {'Content-Type': 'application/json'}
    );

    const data = await response.json();
    createdSectionIdRef.current = data.id;

    dispatch(sectionHasNewData());

    return data.id;
  }, [dispatch]);

  if (showHiddenOnly) {
    return (
      <EmptyState
        headline={i18n.emptySectionHeadline()}
        descriptionText={i18n.emptyArchivedClassSections()}
        imageComponent={
          <img className={styles.emptyImage} src={noArchivedSections} alt="" />
        }
        button={null}
      />
    );
  }

  return (
    <ol className={styles.sectionList}>
      <SectionCard
        section={section}
        onBeforeNavigate={createDemoSection}
        studioUrlPrefix={studioUrlPrefix}
        onDeleteClickCallback={() => {}}
        id={0}
      />
    </ol>
  );
};
