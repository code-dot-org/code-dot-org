import {useEffect, useRef} from 'react';

import {type AilabProject, useProject} from '@cdo/apps/ailab/engine';

interface ProjectSyncProps {
  /** The project as last saved, to open the lab with. */
  savedProject: AilabProject;
  save: (project: AilabProject) => void;
}

/*
  Keeps the saved sources and the lab's project the same thing: the saved
  project is opened into the lab, and every change to it is saved.

  Renders nothing. It lives inside the lab's providers because that is where
  the project is, while the sources belong to the view above them.
*/
const ProjectSync: React.FC<ProjectSyncProps> = ({savedProject, save}) => {
  const {project, openProject, opened, empty} = useProject();
  const requested = useRef(false);

  /*
    Once per mount: openProject's identity follows the dataset, and asking
    again would put the saved project back over whatever has been done since.
    A level change or a Start Over remounts this.
  */
  useEffect(() => {
    if (requested.current) {
      return;
    }
    requested.current = true;
    openProject(savedProject);
  }, [openProject, savedProject]);

  /*
    A level change empties the project before this component is taken down,
    and the sources it would be saved to still belong to the level being left.
    An emptied project is never worth saving anyway.
  */
  useEffect(() => {
    if (opened && !empty) {
      save(project);
    }
  }, [opened, empty, project, save]);

  return null;
};

export default ProjectSync;
