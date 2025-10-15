import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import {setCurrentLevelId} from '@cdo/apps/code-studio/progressRedux';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import notifyLevelChange from '../utils/notifyLevelChange';

import ProjectContainer from './ProjectContainer';
import {getStandaloneProjectId} from './utils';

const MultiProjectContext = createContext<{
  backToParent: () => void;
} | null>(null);

export function useMultiProject() {
  return useContext(MultiProjectContext);
}

/**
 * Wrapper around {@link ProjectContainer} that allows the Lab2 system to switch between
 * projects in a multi-project context. This is currently only supported for standalone
 * BubbleChoice projects. If the current level/project is not one of these, the context
 * is not rendered and we pass through to {@link ProjectContainer} directly.
 */
const MultiProjectContainer: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [currentProjectId, setCurrentProjectId] = useState(
    getStandaloneProjectId()
  );
  const [parentLevelId, setParentLevelId] = useState<number>();
  const [levelProjectMap, setLevelProjectMap] = useState<{
    [levelId: number]: string;
  }>();

  const levelProperties = useAppSelector(state => state.lab.levelProperties);
  const channel = useAppSelector(state => state.lab.channel);
  const currentLevelId = useAppSelector(state => state.progress.currentLevelId);

  useEffect(() => {
    if (
      levelProperties?.appName === 'bubble_choice' &&
      levelProperties?.isProjectLevel &&
      !!channel?.subprojects
    ) {
      const map = {
        [levelProperties.id]: channel.id,
      };
      channel.subprojects.forEach(subproject => {
        map[subproject.level_id] = subproject.project_id;
      });
      setLevelProjectMap(map);
      setParentLevelId(levelProperties.id);
    }
  }, [levelProperties, channel]);

  // When the level ID changes, update the current project ID if we have a mapping for it.
  useEffect(() => {
    if (levelProjectMap && currentLevelId) {
      setCurrentProjectId(levelProjectMap[parseInt(currentLevelId)]);
    }
  }, [currentLevelId, setCurrentProjectId, levelProjectMap]);

  const dispatch = useAppDispatch();

  const backToParent = useCallback(() => {
    if (parentLevelId) {
      // Duplicated from navigateToLevelId(). Can we consolidate?
      notifyLevelChange(currentLevelId, String(parentLevelId));
      dispatch(setCurrentLevelId(String(parentLevelId)));
    }
  }, [parentLevelId, dispatch, currentLevelId]);

  if (!parentLevelId || !levelProjectMap) {
    return (
      <ProjectContainer channelId={currentProjectId}>
        {children}
      </ProjectContainer>
    );
  }

  return (
    <MultiProjectContext.Provider value={{backToParent}}>
      <ProjectContainer channelId={currentProjectId}>
        {children}
      </ProjectContainer>
    </MultiProjectContext.Provider>
  );
};

export default MultiProjectContainer;
