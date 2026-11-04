import {z} from 'zod';

/**
 * The student's plan for their project, as a checkpoint collects it: a
 * sentence with a `{slot}` for each answer, filled from the plan questions
 * that name those slots, and shown back before the project is built.
 */
export const planSchema = z.strictObject({
  /** The sentence, with `{slot}` where a plan question's answer goes. */
  template: z.string().min(1),
});

/** A piece of a plan template: literal text, or a slot an answer fills. */
export type PlanSegment = {text: string} | {slot: string};

const SLOT = /\{([^{}]+)\}/g;

/** The template split into its text and its slots, in order. */
export function planTemplateSegments(template: string): PlanSegment[] {
  const segments: PlanSegment[] = [];
  let last = 0;
  for (const match of template.matchAll(SLOT)) {
    const at = match.index ?? 0;
    if (at > last) segments.push({text: template.slice(last, at)});
    segments.push({slot: match[1]});
    last = at + match[0].length;
  }
  if (last < template.length) segments.push({text: template.slice(last)});
  return segments;
}

/** The slot names a template uses, each once, in order. */
export function planTemplateSlots(template: string): string[] {
  const slots: string[] = [];
  for (const segment of planTemplateSegments(template)) {
    if ('slot' in segment && !slots.includes(segment.slot)) {
      slots.push(segment.slot);
    }
  }
  return slots;
}

/**
 * The template with each slot's answer in place, or undefined while any
 * slot has no answer.
 */
export function fillPlanTemplate(
  template: string,
  answersBySlot: {[slot: string]: string}
): string | undefined {
  let filled = '';
  for (const segment of planTemplateSegments(template)) {
    if ('text' in segment) {
      filled += segment.text;
      continue;
    }
    const answer = answersBySlot[segment.slot];
    if (answer === undefined) return undefined;
    filled += answer;
  }
  return filled;
}
