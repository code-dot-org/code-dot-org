import {AVAILABLE_LABS} from '@/modules/labs/config/labs';

export type Lab = (typeof AVAILABLE_LABS)[number];

/**
 * Type guard to check if a value is a valid Lab type.
 * @param value - The value to be checked if it is a Lab.
 * @returns True if the value is a valid Lab type, false otherwise.
 */
export function isLab(value: unknown): value is Lab {
  return AVAILABLE_LABS.includes(value as Lab);
}
