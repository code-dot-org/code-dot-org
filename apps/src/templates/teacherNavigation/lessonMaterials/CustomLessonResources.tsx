import {
  BodyTwoText,
  Heading6,
} from '@code-dot-org/component-library/typography';
import React, {useEffect, useState} from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';

import ResourceRow from './ResourceRow';

import styles from './lesson-materials.module.scss';

type CustomResourcesProps = {
  unitId: number | null;
  lessonId: number;
  sectionId: number;
};
export type CustomArtifact = {
  id: number;
  key: string;
  title: string;
  type: string;
  content: string;
};

async function asyncFetchCustomResources(
  unitId: number,
  lessonId: number,
  sectionId: number
): Promise<CustomArtifact[]> {
  const pararms: Record<string, number> = {
    unitId: unitId,
    lessonId: lessonId,
    sectionId: sectionId,
  };
  const response = await HttpClient.fetchJson<CustomArtifact[]>(
    `/aidiff_artifacts`,
    pararms
  );
  console.log('Custom Resources response:', response);
  return response.value;
}

const renderNoResourcesRow = (
  <div className={styles.rowContainer}>
    <BodyTwoText className={styles.resourceLabel}>
      <em>
        {
          'You have not created any custom resources for this lesson. You can use AI TA to help you!'
        }
      </em>
    </BodyTwoText>
  </div>
);

const CustomLessonResources: React.FC<CustomResourcesProps> = ({
  unitId,
  lessonId,
  sectionId,
}) => {
  const [resources, setResources] = useState<CustomArtifact[]>([]);

  useEffect(() => {
    let cancelled = false;

    const fetchResources = async () => {
      try {
        const result = await asyncFetchCustomResources(
          unitId ?? 0,
          lessonId,
          sectionId
        );
        if (!cancelled) {
          setResources(result);
        }
      } catch (error) {
        console.error('Failed to fetch custom resources', error);
        if (!cancelled) {
          setResources([]);
        }
      }
    };

    // Only attempt fetch when we have a unitId
    if (unitId) {
      fetchResources();
    } else {
      setResources([]);
    }

    return () => {
      cancelled = true;
    };
  }, [unitId, lessonId, sectionId]);

  return (
    <div className={styles.resourcesTable}>
      <div className={styles.topRowForResourcesTable}>
        <Heading6 className={styles.headerText}>{'Custom Resources'}</Heading6>
      </div>
      {resources.length === 0 && renderNoResourcesRow}
      {resources.map(resource => (
        <ResourceRow key={resource.id} unitNumber={null} resource={resource} />
      ))}
    </div>
  );
};

export default CustomLessonResources;
