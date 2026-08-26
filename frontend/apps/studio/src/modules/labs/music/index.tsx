import {useLevelProperties} from '@code-dot-org/lab/contexts';
import MusicLabApp from '@code-dot-org/music-lab';

import LabProviders from '@/modules/labs/LabProviders';

/**
 * Studio entry point for Coding with Music. Bridges staging's slim host
 * contract to the fat @code-dot-org/lab-classic one @code-dot-org/music-lab
 * is built against: the slim <Lab> (staging/oceans's contract) resolves the
 * level and provides it through LevelPropertiesContext as a single object,
 * not a {levelId, levelPropertiesMap} pair — so this container reads it back
 * out via useLevelProperties and reassembles the shape music-lab's App
 * expects (its own id field is exactly the level's numeric id). LabProviders
 * supplies the redux store, react-query client, and API client the classic
 * lab's BlocklyLab needs, scoped to this mount only.
 */
export default function MusicContainer() {
  const properties = useLevelProperties();
  if (!properties) {
    return null;
  }
  const levelId = String(properties.id);
  return (
    <LabProviders>
      <MusicLabApp
        isLoading={false}
        levelId={levelId}
        levelPropertiesMap={{[levelId]: properties}}
      />
    </LabProviders>
  );
}
