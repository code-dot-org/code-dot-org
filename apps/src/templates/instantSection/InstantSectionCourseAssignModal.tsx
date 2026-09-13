import Modal from '@code-dot-org/component-library/modal';
import React, {useEffect, useState} from 'react';

import {AiChatToolsDependencyValue} from '@cdo/apps/aichat/types';
import Spinner from '@cdo/apps/sharedComponents/Spinner';
import {CurriculumCatalogCard} from '@cdo/apps/templates/curriculumCatalog/CurriculumCatalogCard';
import {assignToSection} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {Section} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import styles from './instant-section.module.scss';

interface InstantSectionCourseOffering {
  key: string;
  display_name: string;
  display_name_with_latest_year: string;
  grade_levels: string;
  duration: string;
  image: string | null;
  course_version_path: string;
  course_version_id: number;
  course_id: number;
  course_offering_id: number;
  is_translated: boolean;
  ai_chat_tools_dependency: AiChatToolsDependencyValue;
}

interface InstantSectionCourseAssignModalProps {
  section: Section;
  onClose: () => void;
}

interface InstantSectionCatalogCardProps {
  courseKey: string;
  courseDisplayName: string;
  courseDisplayNameWithLatestYear: string;
  duration: string;
  gradesArray: string[];
  imageSrc?: string;
  isTranslated: boolean;
  isEnglish: boolean;
  pathToCourse: string;
  courseVersionId: number;
  courseId: number;
  courseOfferingId: number;
  aiChatToolsDependency: AiChatToolsDependencyValue;
  isSignedOut: boolean;
  isTeacher: boolean;
  handleSetExpandedCardKey: () => void;
  hideCurriculumMetadata: boolean;
  hideActions: boolean;
  isSelected: boolean;
  onSelect: () => void;
}

const InstantSectionCatalogCard =
  CurriculumCatalogCard as unknown as React.ComponentType<InstantSectionCatalogCardProps>;

const COURSE_OFFERINGS_URL =
  '/course_offerings/instant_section_course_offerings';

export default function InstantSectionCourseAssignModal({
  section,
  onClose,
}: InstantSectionCourseAssignModalProps) {
  const dispatch = useAppDispatch();
  const [courseOfferings, setCourseOfferings] = useState<
    InstantSectionCourseOffering[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourseKey, setSelectedCourseKey] = useState<string>();
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    HttpClient.fetchJson<InstantSectionCourseOffering[]>(COURSE_OFFERINGS_URL)
      .then(response => setCourseOfferings(response.value))
      .catch(() => setError(i18n.instantSectionCoursesLoadError()))
      .finally(() => setIsLoading(false));
  }, []);

  const assignCourse = async () => {
    const offering = courseOfferings.find(
      courseOffering => courseOffering.key === selectedCourseKey
    );
    if (!offering) {
      return;
    }

    setIsAssigning(true);
    setError('');
    try {
      await Promise.resolve(
        dispatch(
          assignToSection(
            section.id,
            offering.course_id,
            offering.course_offering_id,
            offering.course_version_id,
            null,
            'teacherHomepage'
          )
        ) as unknown
      );
      onClose();
    } catch {
      setError(i18n.instantSectionCourseAssignError());
      setIsAssigning(false);
    }
  };

  let content: React.ReactNode;
  if (isLoading) {
    content = (
      <div
        className={styles.courseLoading}
        role="status"
        aria-label={i18n.loading()}
      >
        <Spinner size="large" />
      </div>
    );
  } else if (courseOfferings.length === 0 && !error) {
    content = <p>{i18n.instantSectionCoursesEmpty()}</p>;
  } else {
    content = (
      <div className={styles.courseGrid}>
        {courseOfferings.map(offering => (
          <InstantSectionCatalogCard
            key={offering.key}
            courseKey={offering.key}
            courseDisplayName={offering.display_name}
            courseDisplayNameWithLatestYear={
              offering.display_name_with_latest_year
            }
            duration={offering.duration}
            gradesArray={offering.grade_levels.split(',')}
            imageSrc={offering.image || undefined}
            isTranslated={offering.is_translated}
            isEnglish={true}
            pathToCourse={offering.course_version_path}
            courseVersionId={offering.course_version_id}
            courseId={offering.course_id}
            courseOfferingId={offering.course_offering_id}
            aiChatToolsDependency={offering.ai_chat_tools_dependency}
            isSignedOut={false}
            isTeacher={true}
            handleSetExpandedCardKey={() => {}}
            hideCurriculumMetadata={true}
            hideActions={true}
            isSelected={selectedCourseKey === offering.key}
            onSelect={() => setSelectedCourseKey(offering.key)}
          />
        ))}
      </div>
    );
  }

  return (
    <Modal
      className={styles.courseModal}
      title={i18n.instantSectionRecommendedCourses()}
      closeLabel={i18n.closeDialog()}
      onClose={onClose}
      primaryButtonProps={{
        children: i18n.assign(),
        onClick: assignCourse,
        disabled: !selectedCourseKey || isAssigning,
      }}
      customContent={
        <>
          {error && <p role="alert">{error}</p>}
          {content}
        </>
      }
    />
  );
}
