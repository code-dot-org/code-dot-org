import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React, {FC, useCallback, useMemo, useRef, useState} from 'react';

import {postAichatCompletionMessage} from '@cdo/apps/aichat/aichatApi';
import {
  AichatContext,
  CompletedChatMessage,
  PendingChatMessage,
} from '@cdo/apps/aichat/types';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {createUuid} from '@cdo/apps/utils';
import {
  AiChatClientTypes,
  AiInteractionStatus as Status,
} from '@cdo/generated-scripts/sharedConstants';

import {useAiTutorModelParameters} from '../../../hooks/useAiTutorModelParameters';

import MindMapNode, {MindMapNodeData} from './MindMapNode';

import styles from './curious-activity.module.scss';

interface CuriousActivityProps {
  lessonId: number;
}

const SYSTEM_PROMPT = `You generate nodes for an interactive concept mind map that sparks a student's curiosity.

Given a concept — and the path of parent concepts that led to it — return:
1. Exactly 3 SHORT, DISTINCT branches worth exploring further from that concept. Make them genuinely related but varied in kind: for example an everyday example, a connection to another field, an origin or history, or an intriguing question. Each branch is 2-5 words, with no trailing punctuation. Do not repeat any of the ancestor concepts.
2. One FACT: a genuinely interesting, accurate fact closely related to this concept and the path that led to it, the kind that would surprise or delight a middle or high school student. Keep it to one or two sentences. You MUST cite a specific, real, reputable source for it (name the publication, organization, study, museum, or website — not a vague phrase like "studies show"). Put the source in the "source" field.`;

// Structured output so the branches and the fact parse reliably.
const BRANCHES_SCHEMA = {
  type: 'object',
  properties: {
    branches: {
      type: 'array',
      items: {type: 'string'},
      minItems: 3,
      maxItems: 3,
    },
    fact: {
      type: 'object',
      properties: {
        text: {type: 'string'},
        source: {type: 'string'},
      },
      required: ['text', 'source'],
      additionalProperties: false,
    },
  },
  required: ['branches', 'fact'],
  additionalProperties: false,
} as const;

const makeNode = (label: string, isRoot = false): MindMapNodeData => ({
  id: createUuid(),
  label,
  kind: 'concept',
  children: [],
  generated: false,
  loading: false,
  error: false,
  collapsed: false,
  isRoot,
});

// A terminal fact node: it never expands and carries a cited source.
const makeFactNode = (text: string, source: string): MindMapNodeData => ({
  id: createUuid(),
  label: text,
  kind: 'fact',
  source,
  children: [],
  generated: true,
  loading: false,
  error: false,
  collapsed: false,
});

interface GeneratedBranches {
  branches: string[];
  fact?: {text: string; source: string};
}

// Returns a copy of the tree with `fn` applied to the node matching `id`.
const updateNode = (
  node: MindMapNodeData,
  id: string,
  fn: (n: MindMapNodeData) => MindMapNodeData
): MindMapNodeData => {
  if (node.id === id) {
    return fn(node);
  }
  if (node.children.length === 0) {
    return node;
  }
  return {...node, children: node.children.map(c => updateNode(c, id, fn))};
};

// The chain of labels from the root down to (and including) the node with `id`.
const findPath = (
  node: MindMapNodeData,
  id: string,
  trail: string[] = []
): string[] | null => {
  const next = [...trail, node.label];
  if (node.id === id) {
    return next;
  }
  for (const child of node.children) {
    const found = findPath(child, id, next);
    if (found) {
      return found;
    }
  }
  return null;
};

const CuriousActivity: FC<CuriousActivityProps> = ({lessonId}) => {
  const [seed, setSeed] = useState('');
  const [root, setRoot] = useState<MindMapNodeData | null>(null);
  const rootRef = useRef<MindMapNodeData | null>(null);
  rootRef.current = root;

  const {modelParameters, loading} = useAiTutorModelParameters({
    aiTutorSystemPrompt: SYSTEM_PROMPT,
    aiTutorJsonSchema: BRANCHES_SCHEMA,
  });

  const aichatContext: AichatContext = useMemo(
    () => ({
      clientType: AiChatClientTypes.LESSON_DEEP_DIVE,
      currentLevelId: null,
      scriptId: null,
      channelId: undefined,
      lessonId,
    }),
    [lessonId]
  );

  // Ask the model for 3 branches plus a cited fact off the last concept in `path`.
  const generateBranches = useCallback(
    async (path: string[]): Promise<GeneratedBranches> => {
      if (!modelParameters) {
        throw new Error('Model not ready');
      }
      const concept = path[path.length - 1];
      const ancestors = path.slice(0, -1);
      const msg: PendingChatMessage & {updateId: string} = {
        role: Role.USER,
        status: Status.UNKNOWN,
        chatMessageText:
          (ancestors.length ? `Concept path: ${path.join(' > ')}\n` : '') +
          `Generate 3 branches for the concept: "${concept}".`,
        timestamp: Date.now(),
        updateId: createUuid(),
      };
      const messages: CompletedChatMessage[] =
        await postAichatCompletionMessage(
          msg,
          [],
          {...modelParameters},
          aichatContext
        );
      const last = messages[messages.length - 1];
      if (!last || last.status !== Status.OK || !last.chatMessageText) {
        throw new Error('No response');
      }
      const parsed = JSON.parse(last.chatMessageText) as {
        branches?: string[];
        fact?: {text?: string; source?: string};
      };
      const branches = (parsed.branches ?? [])
        .map(b => b.trim())
        .filter(Boolean);
      if (branches.length === 0) {
        throw new Error('No branches');
      }
      const factText = parsed.fact?.text?.trim();
      const factSource = parsed.fact?.source?.trim();
      const fact =
        factText && factSource
          ? {text: factText, source: factSource}
          : undefined;
      return {branches: branches.slice(0, 3), fact};
    },
    [modelParameters, aichatContext]
  );

  // Expand a node: generate its branches the first time, otherwise toggle it.
  const handleToggle = useCallback(
    async (id: string) => {
      const current = rootRef.current;
      if (!current) {
        return;
      }
      const node = findNode(current, id);
      // Fact nodes are terminal; nothing to expand.
      if (!node || node.loading || node.kind === 'fact') {
        return;
      }

      if (node.generated) {
        setRoot(r =>
          r ? updateNode(r, id, n => ({...n, collapsed: !n.collapsed})) : r
        );
        return;
      }

      const path = findPath(current, id);
      if (!path) {
        return;
      }
      setRoot(r =>
        r ? updateNode(r, id, n => ({...n, loading: true, error: false})) : r
      );
      try {
        const {branches, fact} = await generateBranches(path);
        const children = branches.map(b => makeNode(b));
        // The 4th node is always a cited fact that ends this branch.
        if (fact) {
          children.push(makeFactNode(fact.text, fact.source));
        }
        setRoot(r =>
          r
            ? updateNode(r, id, n => ({
                ...n,
                loading: false,
                generated: true,
                collapsed: false,
                children,
              }))
            : r
        );
      } catch {
        setRoot(r =>
          r ? updateNode(r, id, n => ({...n, loading: false, error: true})) : r
        );
      }
    },
    [generateBranches]
  );

  const handleStart = useCallback(() => {
    const concept = seed.trim();
    if (!concept || loading) {
      return;
    }
    const rootNode = makeNode(concept, true);
    setRoot(rootNode);
    rootRef.current = rootNode;
    // Generate the first ring of branches right away.
    handleToggle(rootNode.id);
  }, [seed, loading, handleToggle]);

  const handleReset = useCallback(() => {
    setRoot(null);
    setSeed('');
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.brief}>
        <p className={styles.overline}>Curious</p>
        <h2 className={styles.briefHeading}>Build a mind map</h2>
        <p className={styles.briefBody}>
          Start with a concept or word that you're most interested in from the
          lesson. The AI suggests three related branches — click any branch to
          explore it further and grow your map. See how concepts connect in
          surprising ways, and discover interesting facts along the way. There’s
          no one right way to explore!
        </p>
      </div>

      {!root ? (
        <div className={styles.seedRow}>
          <input
            type="text"
            className={styles.seedInput}
            value={seed}
            placeholder="Enter a concept, like abstraction..."
            aria-label="Starting concept"
            maxLength={60}
            onChange={e => setSeed(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleStart();
              }
            }}
          />
          <button
            type="button"
            className={styles.seedButton}
            onClick={handleStart}
            disabled={!seed.trim() || loading}
          >
            <FontAwesomeV6Icon iconName="diagram-project" />
            Start map
          </button>
        </div>
      ) : (
        <>
          <div className={styles.mapToolbar}>
            <button
              type="button"
              className={styles.resetButton}
              onClick={handleReset}
            >
              <FontAwesomeV6Icon iconName="arrow-rotate-left" />
              New map
            </button>
          </div>
          <div className={styles.mapScroll}>
            <MindMapNode node={root} onToggle={handleToggle} />
          </div>
        </>
      )}
    </div>
  );
};

// Find a node by id (companion to findPath, which returns the label trail).
const findNode = (
  node: MindMapNodeData,
  id: string
): MindMapNodeData | null => {
  if (node.id === id) {
    return node;
  }
  for (const child of node.children) {
    const found = findNode(child, id);
    if (found) {
      return found;
    }
  }
  return null;
};

export default CuriousActivity;
