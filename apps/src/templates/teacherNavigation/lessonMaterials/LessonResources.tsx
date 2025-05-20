import {
  BodyTwoText,
  Heading6,
} from '@code-dot-org/component-library/typography';
import React from 'react';

import i18n from '@cdo/locale';

import {Resource} from './LessonMaterialTypes';
import ResourceRow from './ResourceRow';

import styles from './lesson-materials.module.scss';

// lesson plans, standards, and vocabulary are only needed for teacher resources
type LessonResourcesProps = {
  unitNumber: number | null;
  lessonNumber: number;
  lessonPlanUrl?: string;
  lessonPlanPdfUrl?: string;
  standardsUrl?: string;
  vocabularyUrl?: string;
  lessonName?: string;
  resources: Resource[];
  hasLessonPlan?: boolean;
};

const renderNoResourcesRow = (
  <div className={styles.rowContainer}>
    <BodyTwoText className={styles.resourceLabel}>
      <em>{i18n.noStudentResources()}</em>
    </BodyTwoText>
  </div>
);

const LessonResources: React.FC<LessonResourcesProps> = ({
  unitNumber,
  resources,
  lessonNumber,
  lessonPlanUrl,
  lessonPlanPdfUrl,
  lessonName,
  standardsUrl,
  vocabularyUrl,
  hasLessonPlan,
}) => {
  // Note that lessonPlanUrl is not needed for student resources
  // and should be null for student resoruces section
  const sectionHeaderText = lessonPlanUrl
    ? i18n.teacherResourcesforLessonMaterials()
    : i18n.studentResources();

  const renderStandardsRow = () => {
    if (!standardsUrl) return null;

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
    if (!vocabularyUrl) return null;

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

    if (!hasLessonPlan) {
      return (
        <div className={styles.rowContainer}>
          <BodyTwoText className={styles.resourceLabel}>
            <em>{i18n.noTeacherResources()}</em>
          </BodyTwoText>
        </div>
      );
    }

    return (
      <ResourceRow
        key={`lessonPlan-${lessonNumber}`}
        unitNumber={unitNumber}
        resource={{
          key: 'lessonPlanKey',
          name: lessonName || '',
          url: lessonPlanUrl,
          downloadUrl: lessonPlanPdfUrl,
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
      {!lessonPlanUrl && resources.length === 0 && renderNoResourcesRow}
      {renderLessonPlanRow()}
      {resources.map(resource => (
        <ResourceRow
          key={resource.key}
          unitNumber={unitNumber}
          resource={resource}
        />
      ))}
      {renderVocabularyRow()}
      {renderStandardsRow()}
    </div>
  );
};

export default LessonResources;
