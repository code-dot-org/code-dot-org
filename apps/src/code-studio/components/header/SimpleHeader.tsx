// The level header's middle for a unit with simple progress: the project
// info, the unit name over its saved-at line, and the unit's logo with the
// part's label and bar, in one flex row.
// Nothing is measured: each part shrinks on its own and the row centres what
// is left. HeaderMiddle measures because its bubbles need a count that fits;
// nothing here does.

import {isEqual} from 'lodash';
import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';

import {getCurrentLevels} from '@cdo/apps/code-studio/progressReduxSelectors';

import ProjectInfo from './ProjectInfo';
import remeasureOnFontsReady from './remeasureOnFontsReady';
import ScriptName from './ScriptName';
import SimpleProgress, {ProgressLevel} from './SimpleProgress';

// How long the header waits for an app load to begin before showing without
// one.
const APP_LOAD_WAIT_MS = 750;

interface HeaderState {
  header: {appLoadStarted?: boolean; appLoaded?: boolean};
  isRtl: boolean;
}

interface SimpleHeaderProps {
  scriptData: {simpleProgressImage?: string};
  /** The unit name and its link, as header.build receives them. */
  scriptNameData?: {name: string; href: string; smallText?: boolean};
}

/**
 * Whether the header may show yet, by HeaderMiddle's rule: hold off for a
 * moment so an app load can begin; once one has begun, wait for it to end;
 * if none begins in time, show anyway.
 */
export function useAppLoadGate(): boolean {
  const appLoadStarted = useSelector(
    (state: HeaderState) => !!state.header.appLoadStarted
  );
  const appLoaded = useSelector(
    (state: HeaderState) => !!state.header.appLoaded
  );
  const [waited, setWaited] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setWaited(true), APP_LOAD_WAIT_MS);
    return () => clearTimeout(timer);
  }, []);
  return (waited && !appLoadStarted) || (appLoadStarted && appLoaded);
}

const SimpleHeader: React.FunctionComponent<SimpleHeaderProps> = ({
  scriptData,
  scriptNameData,
}) => {
  const isRtl = useSelector((state: HeaderState) => state.isRtl);
  // The selector builds a new array per call; compare by content or every
  // store change re-renders the row.
  const levels = useSelector(getCurrentLevels, isEqual) as
    | ProgressLevel[]
    | undefined;
  const show = useAppLoadGate();

  // Eyes UI tests key on these to tell a page with this header from one with
  // a server-rendered header, and to wait for the font swap.
  useEffect(() => {
    document.documentElement.dataset.headerPresent = 'true';
    return remeasureOnFontsReady(() => {
      window.requestAnimationFrame(() => {
        document.documentElement.dataset.headerFontsRelaidOut = 'true';
      });
    });
  }, []);

  if (!show) {
    return null;
  }
  return (
    <div id="header_middle_content" style={styles.row}>
      <div id="project_info_container" style={styles.projectInfo}>
        <ProjectInfo isRtl={isRtl} />
      </div>
      {scriptNameData && (
        <div id="unit_name_container" style={styles.unitName}>
          <ScriptName {...scriptNameData} isRtl={isRtl} />
        </div>
      )}
      <div id="simple_progress_container" style={styles.progress}>
        <SimpleProgress
          imageUrl={scriptData.simpleProgressImage}
          levels={levels}
        />
      </div>
    </div>
  );
};

export default SimpleHeader;

const styles: Record<string, React.CSSProperties> = {
  row: {
    width: '100%',
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'header-fadein 0.4s',
  },
  // The project buttons cannot shrink, and their container clips, so the
  // project info keeps its width and the names give way instead.
  projectInfo: {
    flex: 'none',
  },
  // Each name may shrink below its content; what it holds ellipsizes.
  unitName: {
    flex: '0 1 auto',
    minWidth: 0,
    margin: '0 5px',
  },
  progress: {
    flex: '0 1 auto',
    minWidth: 0,
    margin: '0 5px',
  },
};
