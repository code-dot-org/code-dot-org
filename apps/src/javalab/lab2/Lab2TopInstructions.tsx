// Lab2 wrapper around TopInstructions.
//
// The default `TopInstructions` reads its per-level content (longInstructions,
// hasContainedLevels, teacherMarkdown, levelVideos, mapReference,
// referenceLinks, serverLevelId) from `state.instructions` and
// `state.pageConstants`. Both of those slices throw on a second SET_CONSTANTS
// dispatch, which means under lab2's no-reload navigation the instructions
// text would otherwise be frozen to the first level.
//
// This wrapper sources those fields from `state.lab.levelProperties` (which
// lab2's setUpWithLevel thunk updates on every level transition) and passes
// them directly to `UnconnectedTopInstructions` as props. Layout state
// (rendered height, collapsed state) is still read from `state.instructions`
// — those fields are set by user interaction, not per-level data.

import React from 'react';

import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {
  setAllowInstructionsResize,
  setInstructionsMaxHeightNeeded,
  setInstructionsRenderedHeight,
  setInstructionsRenderedHeightAndCollapsed,
} from '@cdo/apps/redux/instructions';
import {UnconnectedTopInstructions} from '@cdo/apps/templates/instructions/TopInstructions';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

interface Lab2TopInstructionsProps {
  mainStyle?: object;
  containerStyle?: object;
  isOldPurpleColorHeader?: boolean;
  standalone?: boolean;
  displayDocumentationTab?: boolean;
  displayReviewTab?: boolean;
  initialSelectedTab?: string | null;
  explicitHeight?: number;
  resizable?: boolean;
  collapsible?: boolean;
  inLessonPlan?: boolean;
  openReferenceLinksInNewTab?: boolean;
}

const Lab2TopInstructions: React.FC<Lab2TopInstructionsProps> = props => {
  const dispatch = useAppDispatch();

  // Per-level data — sourced from lab2's levelProperties slice so it tracks
  // no-reload navigation.
  const levelProperties = useAppSelector(state => state.lab?.levelProperties);
  const longInstructions = levelProperties?.longInstructions;
  const teacherMarkdown = (
    levelProperties as {teacherMarkdown?: string} | undefined
  )?.teacherMarkdown;
  const mapReference = (levelProperties as {mapReference?: string} | undefined)
    ?.mapReference;
  const referenceLinks =
    (levelProperties as {referenceLinks?: string[]} | undefined)
      ?.referenceLinks ?? [];
  const levelVideos =
    (levelProperties as {helpVideos?: unknown[]} | undefined)?.helpVideos ?? [];
  const serverLevelId = levelProperties?.id;
  const hasContainedLevels = !!(
    (levelProperties as {containedLevelNames?: string[]} | undefined)
      ?.containedLevelNames?.length ?? 0
  );

  // Layout state — set by user interaction with the instructions panel,
  // persisted across level changes by design. The legacy `instructions`
  // slice isn't declared on RootState (registered dynamically by
  // JavaLab2View), so we read through a typed shim.
  interface InstructionsSlice {
    renderedHeight?: number;
    expandedHeight?: number;
    maxNeededHeight?: number;
    maxAvailableHeight?: number;
    isCollapsed?: boolean;
    overlayVisible?: boolean;
    taRubric?: unknown;
  }
  const instructionsState = useAppSelector(
    state =>
      (state as unknown as {instructions?: InstructionsSlice}).instructions
  );
  const renderedHeight = instructionsState?.renderedHeight ?? 0;
  const expandedHeight = instructionsState?.expandedHeight ?? 0;
  const maxNeededHeight = instructionsState?.maxNeededHeight ?? Infinity;
  const maxAvailableHeight = instructionsState?.maxAvailableHeight ?? Infinity;
  const isCollapsed = !!instructionsState?.isCollapsed;
  const overlayVisible = !!instructionsState?.overlayVisible;
  const taRubric = instructionsState?.taRubric;

  // Page-stable redux values (these don't change between levels).
  const documentationUrl = useAppSelector(
    state =>
      (state.pageConstants as unknown as {documentationUrl?: string})
        ?.documentationUrl
  );
  const serverScriptId = useAppSelector(
    state => state.pageConstants?.serverScriptId
  );
  const user = useAppSelector(state => state.pageConstants?.userId);
  const viewAs = useAppSelector(
    state =>
      (state as {viewAs?: keyof typeof ViewType}).viewAs as
        | keyof typeof ViewType
        | undefined
  );
  const isRtl = useAppSelector(state => !!(state as {isRtl?: boolean}).isRtl);
  const readOnlyWorkspace = useAppSelector(
    state => !!state.javalab?.isReadOnlyWorkspace
  );

  return (
    <UnconnectedTopInstructions
      {...props}
      // Per-level
      longInstructions={longInstructions}
      hasContainedLevels={hasContainedLevels}
      teacherMarkdown={teacherMarkdown}
      mapReference={mapReference}
      referenceLinks={referenceLinks}
      levelVideos={levelVideos}
      serverLevelId={serverLevelId}
      // Java Lab is always CSP/CSD-style (panel, not speech bubble).
      noInstructionsWhenCollapsed={true}
      shortInstructions={undefined}
      dynamicInstructions={undefined}
      dynamicInstructionsKey={undefined}
      // Layout
      height={renderedHeight}
      expandedHeight={expandedHeight}
      maxNeededHeight={maxNeededHeight}
      maxHeight={Math.min(maxAvailableHeight, maxNeededHeight)}
      isCollapsed={isCollapsed}
      overlayVisible={overlayVisible}
      taRubric={taRubric}
      // Stable
      isEmbedView={false}
      isMinecraft={false}
      isBlockly={false}
      noVisualization={false}
      hidden={false}
      hasBackgroundMusic={false}
      exampleSolutions={[]}
      isViewingAsInstructorInTraining={false}
      ttsLongInstructionsUrl={undefined}
      documentationUrl={documentationUrl}
      serverScriptId={serverScriptId}
      user={user}
      viewAs={viewAs}
      isRtl={isRtl}
      readOnlyWorkspace={readOnlyWorkspace}
      // Dispatch
      setInstructionsRenderedHeight={(height: number) =>
        dispatch(setInstructionsRenderedHeight(height))
      }
      setInstructionsRenderedHeightAndCollapsed={(
        height: number,
        nextIsCollapsed: boolean
      ) =>
        dispatch(
          setInstructionsRenderedHeightAndCollapsed(height, nextIsCollapsed)
        )
      }
      setInstructionsMaxHeightNeeded={(height: number) =>
        dispatch(setInstructionsMaxHeightNeeded(height))
      }
      setAllowInstructionsResize={(allowResize: boolean) =>
        dispatch(setAllowInstructionsResize(allowResize))
      }
    />
  );
};

export default Lab2TopInstructions;
