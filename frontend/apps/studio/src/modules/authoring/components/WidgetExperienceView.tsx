import {Typography} from '@mui/material';
import {useMemo} from 'react';

import type {WidgetExperience} from '@code-dot-org/authoring';
import {Loading} from '@code-dot-org/lab/host';
import {WidgetFrame} from '@code-dot-org/widget-runtime';

import {useWidget} from '../hooks';

import SelectableCard from './SelectableCard';

import styles from './authoring.module.scss';

interface WidgetExperienceViewProps {
  experience: WidgetExperience;
  /** Learner interaction events from inside the sandbox (model context updates). */
  onEvent?: (data: unknown) => void;
  /** Tutor-configured input overriding the authored default. */
  inputOverride?: Record<string, unknown>;
  /** Click-to-edit affordance — see ExperienceStage's PanelSection. */
  authorMode?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}

/**
 * Mounts an agent-authored widget behind the sandbox boundary. The source is
 * fetched from the authoring service and re-fetched when the agent edits it
 * (SSE-invalidated), so source changes update the learner experience quickly.
 */
export default function WidgetExperienceView({
  experience,
  onEvent,
  inputOverride,
  authorMode = false,
  selected = false,
  onSelect,
}: WidgetExperienceViewProps) {
  const {data, isLoading, error} = useWidget(experience.widgetId);

  // toolInput/toolResult must keep a stable identity across unrelated parent
  // re-renders (e.g. SSE state invalidation during generation): WidgetFrame
  // re-delivers ui/notifications/tool-input on every identity change, which
  // resets the student's in-progress widget. Key the memo on a serialization
  // of the effective input so identity only changes when the value does.
  const effectiveInput = inputOverride ?? experience.defaultInput ?? {};
  const inputKey = JSON.stringify(effectiveInput);
  const toolInput = useMemo(() => effectiveInput, [inputKey]);
  const toolResult = useMemo(
    () => ({structuredContent: {input: effectiveInput}}),
    [inputKey],
  );

  if (isLoading) {
    return <Loading />;
  }
  if (error || !data) {
    return (
      <Typography variant="body2">
        Widget {experience.widgetId} failed to load.
      </Typography>
    );
  }
  if (!data.descriptor) {
    // Server can return html before the descriptor is ready; treat it as
    // still loading rather than crashing on data.descriptor.title.
    return <Loading />;
  }

  return (
    <SelectableCard
      authorMode={authorMode}
      selected={selected}
      onSelect={() => onSelect?.()}
      selectLabel="Select widget"
      className={styles.widgetStage}
    >
      <WidgetFrame
        // Remount on source change so the sandbox re-runs the new document.
        key={`${experience.widgetId}:${hashSource(data.html)}`}
        html={data.html}
        toolName={data.descriptor.title}
        toolInput={toolInput}
        toolResult={toolResult}
        onModelContextUpdate={update => onEvent?.(update)}
        minHeight={240}
        maxHeight={1400}
      />
    </SelectableCard>
  );
}

// Cheap change detector for the remount key; collisions only cost a missed
// remount on an edit, and the SSE-invalidated fetch already changed identity.
function hashSource(source: string): number {
  let hash = 0;
  for (let i = 0; i < source.length; i++) {
    hash = (hash * 31 + source.charCodeAt(i)) | 0;
  }
  return hash;
}
