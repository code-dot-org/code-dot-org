// The level header's middle for a unit with simple progress: the project
// info, the unit name over its saved-at line, and the unit's logo with the
// part's label and bar, in one flex row. Nothing is measured: each part
// shrinks on its own and the row centres what is left. HeaderMiddle measures
// because its bubbles need a count that fits; nothing here does. It shows
// on mount: HeaderMiddle's wait for an app load has no signal under Lab2,
// the only place simple progress is used.

import {isEqual} from 'lodash';
import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';

import {getCurrentLevels} from '@cdo/apps/code-studio/progressReduxSelectors';

import ProjectInfo from './ProjectInfo';
import remeasureOnFontsReady from './remeasureOnFontsReady';
import ScriptName from './ScriptName';
import SimpleProgress, {ProgressLevel} from './SimpleProgress';

import styles from './simple-header.module.scss';

interface HeaderState {
  isRtl: boolean;
}

interface SimpleHeaderProps {
  scriptData: {simpleProgressImage?: string};
  /** The unit name and its link, as header.build receives them. */
  scriptNameData?: {name: string; href: string; smallText?: boolean};
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

  return (
    <div id="header_middle_content" className={styles.row}>
      <div id="project_info_container" className={styles.projectInfo}>
        <ProjectInfo isRtl={isRtl} />
      </div>
      {scriptNameData && (
        <div id="unit_name_container" className={styles.unitName}>
          <ScriptName {...scriptNameData} isRtl={isRtl} />
        </div>
      )}
      <div id="simple_progress_container" className={styles.progress}>
        <SimpleProgress
          imageUrl={scriptData.simpleProgressImage}
          levels={levels}
        />
      </div>
    </div>
  );
};

export default SimpleHeader;
