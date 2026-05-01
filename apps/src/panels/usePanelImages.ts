import {createGoogleGenerativeAI} from '@ai-sdk/google';
import {useEffect, useState} from 'react';

import AichatContextManager from '@cdo/apps/aichat/aichatContextManager';
import {AichatContext} from '@cdo/apps/aichat/types/context';
import {generateText} from '@cdo/apps/aiGateway';
import {
  AiChatClientTypes,
  AiChatModelIds,
} from '@cdo/generated-scripts/sharedConstants';

import {Panel} from './types';

// Image generation reuses the existing aichat flow: generateText with the
// multimodal Gemini "image" model returns a `files` array containing the
// rendered image as base64. The api key field is ignored — auth is handled
// by the dashboard-issued JWT inside generateText.
const googleProvider = createGoogleGenerativeAI({apiKey: ''});
const PANEL_IMAGE_MODEL = googleProvider(AiChatModelIds.GEMINI_2_5_FLASH_IMAGE);

// Browser-local cache so re-rendering a level doesn't regenerate every panel
// image. Keyed on the imagePrompt string; safe to keep across panel sets
// because the prompt itself uniquely identifies the desired image.
const imageCache = new Map<string, string>();

async function generateDataUriForPrompt(prompt: string): Promise<string> {
  const cached = imageCache.get(prompt);
  if (cached) {
    return cached;
  }
  const result = await generateText({
    model: PANEL_IMAGE_MODEL,
    prompt,
  });
  const file = result.files?.[0];
  if (!file) {
    throw new Error('AI gateway returned no image for panel prompt');
  }
  const dataUri = `data:${file.mediaType};base64,${file.base64}`;
  imageCache.set(prompt, dataUri);
  return dataUri;
}

/**
 * Resolves AI-generated panel images. For each panel that has an
 * imagePrompt and no imageUrl, calls the AI gateway and substitutes a
 * base64 data URI into imageUrl. Panels with a static imageUrl are
 * passed through untouched.
 *
 * Returns the augmented panels array along with a `loading` flag the
 * caller can use to render a placeholder while generation is in flight.
 */
export default function usePanelImages(
  panels: Panel[] | undefined,
  context: Pick<AichatContext, 'currentLevelId' | 'scriptId' | 'channelId'>
): {
  panels: Panel[] | undefined;
  loading: boolean;
} {
  const [resolved, setResolved] = useState<Panel[] | undefined>(panels);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!panels) {
      setResolved(undefined);
      return;
    }

    const needsImage = panels.some(p => !p.imageUrl && p.imagePrompt);
    if (!needsImage) {
      setResolved(panels);
      return;
    }

    // The gateway access-token flow reads AichatContextManager. Seed it
    // with context for this level — clientType is FLOW_LAB so the
    // backend trusts the call without requiring teacher aichat access.
    // (TODO: define a panels-specific client type if/when one is added
    // to AiChatClientTypes.)
    AichatContextManager.setContext({
      clientType: AiChatClientTypes.FLOW_LAB,
      currentLevelId: context.currentLevelId,
      scriptId: context.scriptId,
      channelId: context.channelId,
    });

    let cancelled = false;
    setLoading(true);
    setResolved(panels);

    Promise.all(
      panels.map(async panel => {
        if (panel.imageUrl || !panel.imagePrompt) return panel;
        try {
          const imageUrl = await generateDataUriForPrompt(panel.imagePrompt);
          return {...panel, imageUrl};
        } catch (error) {
          console.error('Panel image generation failed', error);
          return panel;
        }
      })
    ).then(next => {
      if (cancelled) return;
      setResolved(next);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [panels, context.currentLevelId, context.scriptId, context.channelId]);

  return {panels: resolved, loading};
}
