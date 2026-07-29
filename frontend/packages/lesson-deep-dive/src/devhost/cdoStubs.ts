// Runtime stubs for @cdo/* modules. The production host (Studio) provides
// these; the standalone dev host resolves them here via cdoResolverPlugin so
// the feature renders without apps/ or Rails.
//
// Keep stubs minimal: return safe defaults, log to console, no-op mutations.
// Network-shaped stubs go through fetch so MSW handlers stay the single
// source of mock behavior.

import {createSlice} from '@reduxjs/toolkit';
import {useSelector, type TypedUseSelectorHook} from 'react-redux';

import type {
  AichatContext,
  CompletedChatMessage,
  ModelParameters,
  PendingChatMessage,
} from './hostTypes';

// The slice of the Studio host's RootState this feature reads.
interface DevRootState {
  currentUser: {
    userId: number;
    displayName?: string;
    userType?: string;
    signInState?: string;
  };
}

// --------------------------------------------------------------------------
// @cdo/apps/util/HttpClient
// --------------------------------------------------------------------------

export class NetworkError extends Error {
  response?: Response;
}

export type ResponseValidator<T> = (bodyJson: unknown) => T;

export const HttpClient = {
  async fetchJson<T>(
    url: string,
    _params?: object,
    validator?: ResponseValidator<T>,
  ): Promise<{response: Response; value: T}> {
    const response = await fetch(url, {headers: {Accept: 'application/json'}});
    if (!response.ok) {
      const err = new NetworkError(`HTTP ${response.status}: ${url}`);
      err.response = response;
      throw err;
    }
    const json = await response.json();
    const value = validator ? validator(json) : (json as T);
    return {response, value};
  },
  async get(url: string): Promise<Response> {
    return fetch(url);
  },
  async post(
    url: string,
    body?: BodyInit,
    _useAuthenticityToken?: boolean,
    headers?: Record<string, string>,
  ): Promise<Response> {
    return fetch(url, {method: 'POST', body, headers});
  },
  async put(
    url: string,
    body: BodyInit,
    _useAuthenticityToken?: boolean,
    headers?: Record<string, string>,
  ): Promise<Response> {
    return fetch(url, {method: 'PUT', body, headers});
  },
};

// --------------------------------------------------------------------------
// @cdo/apps/util/AuthenticityTokenStore
// --------------------------------------------------------------------------

export function getAuthenticityToken(): Promise<string> {
  return Promise.resolve('devhost-csrf-token');
}

// --------------------------------------------------------------------------
// @cdo/apps/util/experiments — LESSON_TUTOR is always on in the dev host.
// --------------------------------------------------------------------------

export const experiments = {
  LESSON_TUTOR: 'lesson-tutor',
  isEnabled(_key: string): boolean {
    return true;
  },
  isEnabledAllowingQueryString(_key: string): boolean {
    return true;
  },
};

// --------------------------------------------------------------------------
// @cdo/apps/util/reduxHooks — plain react-redux hooks against the dev store.
// --------------------------------------------------------------------------

export {useDispatch as useAppDispatch} from 'react-redux';
export const useAppSelector: TypedUseSelectorHook<DevRootState> = useSelector;

// --------------------------------------------------------------------------
// @cdo/apps/utils
// --------------------------------------------------------------------------

export function createUuid(): string {
  return crypto.randomUUID();
}

// --------------------------------------------------------------------------
// @cdo/apps/metrics/*
// --------------------------------------------------------------------------

const analyticsReporterImpl = {
  sendEvent(name: string, payload?: Record<string, unknown>): void {
    console.log('[analytics]', name, payload);
  },
};
export {analyticsReporterImpl as analyticsReporter};

export const EVENTS = {
  AI_TUTOR_LESSON_DEEP_DIVE_MODALITY_CLICKED:
    'AI Tutor Lesson Deep Dive Modality Clicked',
  AI_TUTOR_LESSON_DEEP_DIVE_MODALITY_NAVIGATION:
    'AI Tutor Lesson Deep Dive Modality Navigation',
};

// --------------------------------------------------------------------------
// @cdo/apps/aiTutor/hooks/useAiTutorModelParameters — resolves immediately
// with the caller-supplied system prompt; no Langfuse/curriculum fetch.
// --------------------------------------------------------------------------

interface UseAiTutorModelParametersOptions {
  aiTutorSystemPrompt?: string;
  aiTutorJsonSchema?: object;
}

export function useAiTutorModelParameters(
  options?: UseAiTutorModelParametersOptions,
) {
  const systemPrompt = options?.aiTutorSystemPrompt ?? 'devhost system prompt';
  const modelParameters: ModelParameters = {
    selectedModelId: 'devhost-model',
    temperature: 0.5,
    systemPrompt,
    retrievalContexts: [],
    ...(options?.aiTutorJsonSchema
      ? {responseJsonSchema: options.aiTutorJsonSchema}
      : {}),
  };
  return {modelParameters, systemPrompt, loading: false} as const;
}

// --------------------------------------------------------------------------
// @cdo/apps/aichat/aichatApi — canned completion instead of the async
// start_chat_completion + poll protocol.
// --------------------------------------------------------------------------

let nextRequestId = 1;

export async function postAichatCompletionMessage(
  message: PendingChatMessage,
  _history: unknown[],
  _modelParameters: ModelParameters,
  _context: AichatContext,
): Promise<CompletedChatMessage[]> {
  await new Promise(resolve => setTimeout(resolve, 700));
  const gotItRight = message.chatMessageText.includes('RIGHT');
  const chatMessageText = gotItRight
    ? '**Nice work!** You got it right. You clearly understand this concept — the key idea is exactly what you picked. Keep it up!'
    : "**Good try!** Not quite, though. Take another look at the lesson vocabulary — the correct answer hinges on a detail that's easy to miss. You'll get the next one!";
  return [
    {
      role: 'assistant',
      status: 'ok',
      chatMessageText,
      timestamp: Date.now(),
      requestId: nextRequestId++,
    },
  ];
}

// --------------------------------------------------------------------------
// Dev-host Redux store: the currentUser slice the Studio page chrome would
// normally register and populate (header.js dispatches setInitialData from
// /api/v1/users/current).
// --------------------------------------------------------------------------

export const currentUserSlice = createSlice({
  name: 'currentUser',
  initialState: {
    userId: 12345,
    displayName: 'Ada',
    userType: 'student',
    signInState: 'SignedIn',
  },
  reducers: {},
});
