import {Typography} from '@mui/material';
import React, {useEffect, useState} from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';

import {Resource} from './LessonMaterialTypes';
import ResourceRow from './ResourceRow';

import styles from './lesson-materials.module.scss';

type CustomResourcesProps = {
  unitId: number | null;
  lessonId: number;
  sectionId: number;
};

async function asyncFetchCustomResources(
  unitId: number,
  lessonId: number,
  sectionId: number
): Promise<Resource[]> {
  const params: Record<string, string> = {
    unit_id: unitId.toString(),
    lesson_id: lessonId.toString(),
    section_id: sectionId.toString(),
  };
  const urlParams = new URLSearchParams(params);
  const response = await HttpClient.fetchJson<Resource[]>(
    `/aidiff_artifacts?${urlParams}`
  );
  return response.value;
}

const renderNoResourcesRow = (
  <div className={styles.rowContainer}>
    <Typography className={styles.resourceLabel} variant="body2" gutterBottom>
      <em>
        {
          'You have not created any custom resources for this lesson. You can use the AI Teaching Assistant to help you!'
        }
      </em>
    </Typography>
  </div>
);

const CustomLessonResources: React.FC<CustomResourcesProps> = ({
  unitId,
  lessonId,
  sectionId,
}) => {
  const [resources, setResources] = useState<Resource[]>([]);

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
        <Typography className={styles.headerText} variant="h6" gutterBottom>
          {'Custom Resources'}
        </Typography>
      </div>
      {resources.length === 0 && renderNoResourcesRow}
      {resources.map(resource => (
        <ResourceRow key={resource.id} unitNumber={null} resource={resource} />
      ))}
    </div>
  );
};

export default CustomLessonResources;
