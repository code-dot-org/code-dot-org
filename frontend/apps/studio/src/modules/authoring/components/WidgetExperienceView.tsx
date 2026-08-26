import {Typography} from '@mui/material';

import type {WidgetExperience} from '@code-dot-org/authoring';
import {Loading} from '@code-dot-org/lab';
import {WidgetFrame} from '@code-dot-org/widget-runtime';

import {useWidget} from '../hooks';

import styles from './authoring.module.scss';

interface WidgetExperienceViewProps {
  experience: WidgetExperience;
  /** Learner interaction events from inside the sandbox (model context updates). */
  onEvent?: (data: unknown) => void;
  /** Tutor-configured input overriding the authored default. */
  inputOverride?: Record<string, unknown>;
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
}: WidgetExperienceViewProps) {
  const {data, isLoading, error} = useWidget(experience.widgetId);

  if (isLoading) {
    return <Loading isLoading />;
  }
  if (error || !data) {
    return (
      <Typography variant="body2">
        Widget {experience.widgetId} failed to load.
      </Typography>
    );
  }

  const toolInput = inputOverride ?? experience.defaultInput ?? {};

  return (
    <div className={styles.widgetStage}>
      <WidgetFrame
        // Remount on source change so the sandbox re-runs the new document.
        key={`${experience.widgetId}:${hashSource(data.html)}`}
        html={data.html}
        toolName={data.descriptor.title}
        toolInput={toolInput}
        toolResult={{structuredContent: {input: toolInput}}}
        onModelContextUpdate={update => onEvent?.(update)}
        minHeight={240}
        maxHeight={720}
      />
    </div>
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
