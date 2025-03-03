import React, {FC} from 'react';

import {WorkshopCourseConfig} from './types';

export const WorkshopFormTemplate: FC<WorkshopCourseConfig> = ({
  slug,
  label,
  session_fields,
  fields,
}) => {
  return <h1>{label}</h1>;
};
