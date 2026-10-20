// The level header's middle for a unit with simple progress: the project
// info, the unit name over its saved-at line, and the unit's logo with the
// part's label and bar, in one flex row. Nothing is measured: each part
// shrinks on its own and the row centers what is left. HeaderMiddle measures
// because its bubbles need a count that fits; nothing here does. It shows
// on mount: HeaderMiddle's wait for an app load has no signal under Lab2,
// the only place simple progress is used.

import {isEqual} from 'lodash';
import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';

import {HeaderReduxState} from '@cdo/apps/code-studio/headerRedux';
import {getCurrentLevels} from '@cdo/apps/code-studio/progressReduxSelectors';

import ProjectInfo from './ProjectInfo';
import remeasureOnFontsReady from './remeasureOnFontsReady';
import ScriptName from './ScriptName';
import SimpleProgress, {ProgressLevel, subPathFor} from './SimpleProgress';

import styles from './simple-header.module.scss';

interface HeaderState {
  isRtl: boolean;
  header?: HeaderReduxState;
}

/** A lab portals its own header controls into this, at the row's start. */
export const LAB_CONTROLS_ID = 'header_lab_controls';

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
  const override = useSelector(
    (state: HeaderState) => state.header?.simpleHeaderOverride
  );
  // A lab's name takes the unit name's place, beside the logo.
  const unitName = override ? undefined : scriptNameData;
  const subPath = override
    ? {label: override.name, ...override.progress}
    : subPathFor(levels);

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
      <div id={LAB_CONTROLS_ID} className={styles.labControls} />
      <div id="project_info_container" className={styles.projectInfo}>
        <ProjectInfo isRtl={isRtl} />
      </div>
      {unitName && (
        <div id="unit_name_container" className={styles.unitName}>
          <ScriptName {...unitName} isRtl={isRtl} />
        </div>
      )}
      <div id="simple_progress_container" className={styles.progress}>
        <SimpleProgress
          imageUrl={scriptData.simpleProgressImage}
          subPath={subPath}
        />
      </div>
    </div>
  );
};

export default SimpleHeader;
