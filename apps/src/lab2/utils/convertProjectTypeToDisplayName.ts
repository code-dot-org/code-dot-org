import {PROJECT_TYPE_MAP} from '@cdo/apps/templates/projects/projectTypeMap';

import {ProjectType} from '../types';

export function convertProjectTypeToDisplayName(
  projectType: ProjectType
): string {
  const name = PROJECT_TYPE_MAP[projectType as keyof typeof PROJECT_TYPE_MAP];
  return name || '';
}
