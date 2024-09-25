import React from 'react';

import {Heading6} from '@cdo/apps/componentLibrary/typography';
import i18n from '@cdo/locale';

import ResourceRow from './ResourceRow';

import styles from './lesson-materials.module.scss';

type LessonResourcesProps = {
  unitNumber: number;
  lessonNumber: number;
  lessonPlanUrl: string | null;
  standardsUrl: string | null;
  vocabularyUrl: string | null;
  lessonName: string | null;
  resources: {
    key: string;
    name: string;
    url: string;
    downloadUrl?: string;
    audience: string;
    type: string;
  }[];
};

const LessonResources: React.FC<LessonResourcesProps> = ({
  unitNumber,
  resources,
  lessonNumber,
  lessonPlanUrl,
  lessonName,
  standardsUrl,
  vocabularyUrl,
}) => {
  // Note that lessonPlanUrl is not needed for student resources
  // and should be null for student resoruces section
  const sectionHeaderText = lessonPlanUrl
    ? i18n.teacherResourcesforLessonMaterials()
    : i18n.studentResources();

  const renderStandardsRow = () => {
    if (!standardsUrl || !lessonPlanUrl) return null;

    return (
      <ResourceRow
        key={`standards-${lessonNumber}`}
        unitNumber={unitNumber}
        resource={{
          key: 'standardsKey',
          name: i18n.standards(),
          url: standardsUrl,
          audience: 'Teacher',
          type: 'Standards',
        }}
      />
    );
  };

  const renderVocabularyRow = () => {
    if (!vocabularyUrl || !lessonPlanUrl) return null;

    return (
      <ResourceRow
        key={`vocabulary-${lessonNumber}`}
        unitNumber={unitNumber}
        resource={{
          key: 'vocabularyKey',
          name: i18n.vocabulary(),
          url: vocabularyUrl,
          audience: 'Teacher',
          type: 'Vocabulary',
        }}
      />
    );
  };

  const renderLessonPlanRow = () => {
    if (!lessonPlanUrl) return null;

    return (
      <ResourceRow
        key={`lessonPlan-${lessonNumber}`}
        unitNumber={unitNumber}
        lessonNumber={lessonNumber}
        resource={{
          key: 'lessonPlanKey',
          name: lessonName || '',
          url: lessonPlanUrl,
          audience: 'Teacher',
          type: 'Lesson Plan',
        }}
      />
    );
  };

  return (
    <div className={styles.resourcesTable}>
      <div className={styles.topRowForResourcesTable}>
        <Heading6 className={styles.headerText}>{sectionHeaderText}</Heading6>
      </div>
      {renderLessonPlanRow()}
      {resources.map(resource => (
        <ResourceRow
          key={resource.key}
          unitNumber={unitNumber}
          lessonNumber={lessonNumber}
          resource={resource}
        />
      ))}
      {renderVocabularyRow()}
      {renderStandardsRow()}
    </div>
  );
};

export default LessonResources;
