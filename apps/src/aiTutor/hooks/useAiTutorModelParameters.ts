import {useEffect, useMemo, useState} from 'react';

import {ModelParameters} from '@cdo/apps/aichat/types';
import {queryParams} from '@cdo/apps/code-studio/utils';
import {shouldShowCopyCode} from '@cdo/apps/lab2/ai/ai-should-show-copy-code';
import {aiTutorModelId} from '@cdo/apps/lab2/ai/ai-tutor-model-id';
import HttpClient from '@cdo/apps/util/HttpClient';

export const fetchCustomPrompt = async (promptName: string) => {
  const url = `https://curriculum.code.org/media/prompt-library/${promptName}.md`;
  const response = await HttpClient.get(url);
  return await response.text();
};

// Provide a looser system prompt that allows for more copyable code for code generation
// if the copy code query param is set to true.
const defaultSystemPrompt = shouldShowCopyCode
  ? `You are an AI Computer Science Tutor that supports students through scaffolded learning, metacognitive reflection, and problem-solving strategies. Target the reading age of an American 7th grader. By default, when a student asks a question, you should respond with a clarifying question, a small hint, or a reflective nudge—to help them take the next step without solving the task for them. Do not give them the whole answer directly. If the student appears frustrated, you may include syntax, code, or pseudocode. When sharing code meant to be copied into the student's solution, ask them where they think the code should be copied to, so that the student will have to think about where the code fits in the solution. If the student explicitly asks for a HINT, provide a tip that nudges them forward to take the next step. If they ask for an EXAMPLE, give a short (1–3 line) conceptual code snippet from a different context that illustrates the relevant idea without solving the actual task. If they request DOCUMENTATION, share 1–3 concise and relevant references formatted with a clear keyword, short explanation and example code. Always work within the provided instructions, student code, and question, and tailor your support to encourage confidence, independence, and thoughtful programming.`
  : `You are an AI Computer Science Tutor that supports students through scaffolded learning, metacognitive reflection, and problem-solving strategies. Target the reading age of an American 7th grader. By default, when a student asks a question, you should respond with a clarifying question, a small hint, or a reflective nudge—to help them take the next step without solving the task for them. Do not give them the answer directly. If the student appears frustrated, you may include syntax or pseudocode. If the student explicitly asks for a HINT, provide a tip that nudges them forward to take the next step. If they ask for an EXAMPLE, give a short (1–3 line) conceptual code snippet from a different context that illustrates the relevant idea without solving the actual task. If they request DOCUMENTATION, share 1–3 concise and relevant references formatted with a clear keyword, short explanation and example code. Always work within the provided instructions, student code, and question, and tailor your support to encourage confidence, independence, and thoughtful programming.`;

// Optional name to retrieve custom system prompt from 'experimentation-settings' repo.
const customPromptName =
  typeof queryParams('aitutor-custom-prompt') === 'string'
    ? (queryParams('aitutor-custom-prompt') as string)
    : null;

export const baseModelParameters: ModelParameters = {
  systemPrompt: defaultSystemPrompt,
  selectedModelId: aiTutorModelId,
  temperature: 0.5,
  retrievalContexts: [],
} as const;

interface UseAiTutorModelParametersOptions {
  aiTutorSystemPromptName?: string;
}

export const useAiTutorModelParameters = (
  options?: UseAiTutorModelParametersOptions
) => {
  const [systemPrompt, setSystemPrompt] = useState<string | undefined>();

  useEffect(() => {
    let mounted = true;

    const promptName = customPromptName ?? options?.aiTutorSystemPromptName;

    const fetchPrompt = async () => {
      if (!promptName) {
        setSystemPrompt(defaultSystemPrompt);
        return;
      }

      try {
        const prompt = await fetchCustomPrompt(promptName);
        if (mounted) {
          setSystemPrompt(prompt || defaultSystemPrompt);
        }
      } catch (error) {
        console.error('Error fetching custom prompt', error);
        if (mounted) {
          setSystemPrompt(defaultSystemPrompt);
        }
      }
    };

    fetchPrompt();

    return () => {
      mounted = false;
    };
  }, [options?.aiTutorSystemPromptName]);

  useEffect(() => {
    // Log which system prompt we end up using.
    if (customPromptName) {
      console.log(`🤖: systemPrompt: ${customPromptName}`, systemPrompt);
    } else if (options?.aiTutorSystemPromptName) {
      console.log(
        `🤖: systemPrompt: ${options?.aiTutorSystemPromptName}`,
        systemPrompt
      );
    } else if (systemPrompt !== undefined) {
      console.log(`🤖: systemPrompt: default`);
    }
  }, [systemPrompt, options?.aiTutorSystemPromptName]);

  useEffect(() => {
    // We currently use query params to allow AI model selection but otherwise do not provide any user
    // interface to select or see the selected model. This console log was added to give users (testers)
    // feedback as to which model was actually selected (e.g. if the query param is entered incorrectly or
    // an unavailable model is selected, it will use the default model). It's in a useEffect (on first
    // render) rather than in `ai/AiTutorModelId.ts` as that module is apparently imported even if AI Tutor
    // isn't enabled, leading to a confusing console log message.
    console.log('🤖: aiTutorModelId:', aiTutorModelId);
  }, []);

  const modelParameters = useMemo(() => {
    if (!systemPrompt) {
      return undefined;
    }

    return {
      ...baseModelParameters,
      systemPrompt,
    } as ModelParameters;
  }, [systemPrompt]);

  return {
    modelParameters,
    systemPrompt,
    loading: !systemPrompt,
  } as const;
};
