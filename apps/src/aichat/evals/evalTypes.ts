import {ValueOf} from '@cdo/apps/types/utils';
import type {CategoryAnalysis} from '@cdo/apps/util/moderateImage';

/**
 * Types for the aichat image-generation safety eval.
 *
 * The eval runs adversarial prompts through the same safety gates the
 * production image pipeline uses (see generateChatResponse.ts):
 *
 *   INPUT_TEXT  -> GENERATION -> IMAGE_MODERATION -> OUTPUT_TEXT
 *
 * Every prompt is assumed to be one that *should* be blocked, so a prompt that
 * clears every gate (an image is generated and allowed) is a false negative.
 */

// The pipeline gates, in the order the production pipeline applies them.
export const EvalGate = {
  // isTextSafe(prompt) classified the user input as inappropriate.
  INPUT_TEXT: 'input_text',
  // The model refused to produce an image: a content-filter finish reason or
  // no image bytes returned.
  GENERATION: 'generation',
  // Azure AI Content Safety flagged the generated image.
  IMAGE_MODERATION: 'image_moderation',
  // isTextSafe(modelText) classified the model's text output as inappropriate.
  OUTPUT_TEXT: 'output_text',
} as const;
export type EvalGate = ValueOf<typeof EvalGate>;

// Gates in pipeline order. Used to build the funnel.
export const GATE_ORDER: EvalGate[] = [
  EvalGate.INPUT_TEXT,
  EvalGate.GENERATION,
  EvalGate.IMAGE_MODERATION,
  EvalGate.OUTPUT_TEXT,
];

export const EvalOutcome = {
  // A gate caught the prompt: the safety system did its job.
  BLOCKED: 'blocked',
  // The prompt cleared every gate and produced an allowed image: a false
  // negative for an adversarial prompt.
  PASSED: 'passed',
  // The pipeline could not reach a verdict (network/model error). Excluded from
  // the false-negative rate.
  ERROR: 'error',
} as const;
export type EvalOutcome = ValueOf<typeof EvalOutcome>;

// One row of the uploaded CSV.
export interface EvalPrompt {
  prompt: string;
  category: string;
}

// The result of running a single prompt through the pipeline.
export interface EvalResult {
  prompt: string;
  category: string;
  outcome: EvalOutcome;
  // The gate that blocked the prompt (BLOCKED), or the gate whose stage errored
  // (ERROR). null when the prompt PASSED every gate.
  stoppedAtGate: EvalGate | null;
  // The model's finishReason from image generation, when generation ran.
  finishReason?: string;
  // The Azure moderation verdict, when moderation ran.
  moderationStatus?: 'safe' | 'flagged' | 'error';
  // Raw Azure per-category analysis, kept for auditing flagged / passed images.
  moderationCategories?: CategoryAnalysis[];
  // data: URL of the generated image, kept so an auditor can eyeball what got
  // through. Present only when an image was generated.
  imageDataUrl?: string;
  // Human-readable detail for ERROR / refusal cases.
  detail?: string;
  elapsedMs: number;
}

// Per-gate funnel step: how many prompts reached the gate, and what happened.
export interface GateFunnelStep {
  gate: EvalGate;
  entered: number;
  blocked: number;
  errored: number;
  passed: number;
}

export interface CategorySummary {
  category: string;
  total: number;
  evaluated: number; // total minus errors
  blocked: number;
  falseNegatives: number;
  errors: number;
  // falseNegatives / evaluated, or null when evaluated === 0.
  falseNegativeRate: number | null;
}

export interface EvalSummary {
  total: number;
  errors: number;
  evaluated: number; // total minus errors
  blocked: number;
  falseNegatives: number;
  falseNegativeRate: number | null;
  funnel: GateFunnelStep[];
  byCategory: CategorySummary[];
}
