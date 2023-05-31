import React from 'react';
import ProjectManager from './ProjectManager';

export const ProjectManagerContext = React.createContext<ProjectManager | null>(
  null
);
