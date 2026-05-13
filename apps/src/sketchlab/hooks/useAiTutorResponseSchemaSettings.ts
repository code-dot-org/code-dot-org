import {useMemo} from 'react';

import {JsonObjectSchema, ResponseSchemaSettings} from '@cdo/apps/aichat/types';
import {ProjectSources} from '@cdo/apps/lab2/types';
import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';

const DEFAULT_NODE_WIDTH = 160;
const DEFAULT_NODE_HEIGHT = 120;

const normalizeForReactFlowIfNeeded = (candidate: unknown) => {
  if (!candidate || typeof candidate !== 'object') {
    return candidate;
  }

  const source = candidate as {
    nodes?: Array<Record<string, unknown>>;
    edges?: Array<Record<string, unknown>>;
    viewport?: Record<string, unknown>;
  };

  if (!Array.isArray(source.nodes) || !Array.isArray(source.edges)) {
    return candidate;
  }

  // Already in expected ReactFlow-ish shape.
  const looksLikeReactFlow =
    source.nodes.length === 0 || source.nodes.every(node => !!node.position);
  if (looksLikeReactFlow) {
    return candidate;
  }

  const nodes = source.nodes.map((node, index) => {
    const label =
      (typeof node.label === 'string' && node.label) ||
      (typeof node.text === 'string' && node.text) ||
      '';
    const sourceType = (node.type as string | undefined) || 'outcome';
    const shapeType = sourceType === 'decision' ? 'diamond' : 'rectangle';
    const styles =
      node.styles && typeof node.styles === 'object'
        ? (node.styles as Record<string, unknown>)
        : {};

    return {
      id: String(node.id || `node-${index}`),
      type: 'shape',
      position: {
        x: typeof node.x === 'number' ? node.x : 0,
        y: typeof node.y === 'number' ? node.y : 0,
      },
      style: {
        width:
          typeof node.width === 'number' ? node.width : DEFAULT_NODE_WIDTH,
        height:
          typeof node.height === 'number' ? node.height : DEFAULT_NODE_HEIGHT,
      },
      data: {
        shapeType,
        label,
        backgroundColor:
          typeof styles.backgroundColor === 'string'
            ? styles.backgroundColor
            : undefined,
      },
    };
  });

  const edges = source.edges.map((edge, index) => ({
    id: String(edge.id || `edge-${index}`),
    source: String(edge.source || ''),
    target: String(edge.target || ''),
    label: typeof edge.label === 'string' ? edge.label : undefined,
  }));

  return {
    nodes,
    edges,
    viewport: source.viewport,
  };
};

const aiTutorResponseJsonSchema: JsonObjectSchema = {
  type: 'object',
  properties: {
    answer: {
      type: 'object',
      properties: {
        answerType: {
          type: 'string',
          enum: ['buildJSON', 'hint', 'ask', 'debug', 'example', 'refusal'],
        },
        startSourceJson: {
          type: 'string',
          description:
            'A JSON string for the Sketch Lab source object to apply in start mode. This should represent `ProjectSources.source`.',
        },
        explanation: {
          type: 'string',
          description: 'A concise explanation to show to the user.',
        },
        nextSteps: {
          type: 'string',
          description: 'Optional next steps in markdown bullet format.',
        },
      },
      required: ['answerType', 'startSourceJson', 'explanation', 'nextSteps'],
      additionalProperties: false,
    },
  },
  required: ['answer'],
  additionalProperties: false,
};

export const useAiTutorResponseSchemaSettings = <T extends ProjectSources>({
  currentSources,
  updateSources,
  enableStartSourceGeneration,
  onApplyStartSource,
}: {
  currentSources: T;
  updateSources: (
    newSourcesOrUpdater: T | ((prev: T) => T),
    forceSave?: boolean
  ) => void;
  enableStartSourceGeneration: boolean;
  onApplyStartSource?: () => void;
}): ResponseSchemaSettings | undefined => {
  return useMemo(() => {
    if (!enableStartSourceGeneration) {
      return undefined;
    }

    return {
      jsonSchema: aiTutorResponseJsonSchema,
      responseCallback: (response: string) => {
        let parsedResponse;
        try {
          parsedResponse = JSON.parse(response);
        } catch {
          return response;
        }

        const answer = parsedResponse?.answer;
        if (!answer) {
          return response;
        }

        const explanation = answer.explanation || '';
        const nextSteps = answer.nextSteps ? `\n\n${answer.nextSteps}` : '';

        if (answer.answerType === 'buildJSON' && answer.startSourceJson) {
          let parsedStartSource;
          try {
            parsedStartSource = JSON.parse(answer.startSourceJson);
          } catch {
            return `${explanation}\n\nCould not apply generated start source because the model returned invalid JSON.${nextSteps}`;
          }

          if (!parsedStartSource || typeof parsedStartSource !== 'object') {
            return `${explanation}\n\nCould not apply generated start source because it was not an object.${nextSteps}`;
          }

          // Accept either:
          // 1) direct source shape (preferred): ProjectSources.source
          // 2) wrapped project sources shape: {source: ProjectSources.source}
          const startSource =
            'source' in parsedStartSource &&
            parsedStartSource.source &&
            typeof parsedStartSource.source === 'object'
              ? parsedStartSource.source
              : parsedStartSource;

          const normalizedStartSource = normalizeForReactFlowIfNeeded(startSource);

          updateSources(
            {
              ...currentSources,
              source: normalizedStartSource,
            } as T,
            true
          );
          onApplyStartSource?.();
          console.log('🤖: Applied Sketch Lab starter source', {
            startSource: normalizedStartSource,
          });
          sendLab2AnalyticsEvent(EVENTS.AI_TUTOR_GENERATED_CODE, {
            answerType: answer.answerType,
          });
          return `${explanation}\n\nApplied generated start source to the workspace.${nextSteps}`;
        }

        return `${explanation}${nextSteps}`;
      },
    };
  }, [
    currentSources,
    enableStartSourceGeneration,
    onApplyStartSource,
    updateSources,
  ]);
};
