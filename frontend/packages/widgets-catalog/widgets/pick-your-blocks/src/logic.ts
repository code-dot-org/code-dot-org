import type { ScenarioItem, ToolOption } from './data';

// pure correctness check, kept separate from rendering so it's easy to test directly.
export function isToolCorrect(item: ScenarioItem, choice: ToolOption['id']): boolean {
  return choice === item.answer;
}
