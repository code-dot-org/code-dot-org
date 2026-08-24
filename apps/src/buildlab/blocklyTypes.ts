export interface BuildlabBlockState {
  fields?: Record<string, string | number>;
  id: string;
  next?: {block: BuildlabBlockState};
  type: string;
  x?: number;
  y?: number;
}

export interface BuildlabWorkspaceState {
  blocks: {
    blocks: BuildlabBlockState[];
    languageVersion: number;
  };
}

/**
 * Older Build Lab saves can contain Blockly XML field markup as a field value.
 * Keep the migration here so Design, Blockly, and the runtime use one value.
 */
export function normalizeBuildlabFieldValue(
  value: string | number
): string | number {
  if (typeof value !== 'string') {
    return value;
  }

  let normalized = value.trim();
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const fieldMatch = normalized.match(/^<field\b[^>]*>([\s\S]*)<\/field>$/);
    if (!fieldMatch) {
      break;
    }

    const decoded = fieldMatch[1]
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&');
    if (decoded === normalized) {
      break;
    }
    normalized = decoded.trim();
  }

  return normalized;
}

export function normalizeBuildlabWorkspaceState(
  workspaceState: BuildlabWorkspaceState
): BuildlabWorkspaceState {
  const normalizeBlock = (block: BuildlabBlockState): BuildlabBlockState => {
    const normalizedNext = block.next?.block
      ? {block: normalizeBlock(block.next.block)}
      : undefined;

    return {
      ...block,
      fields: block.fields
        ? Object.fromEntries(
            Object.entries(block.fields).map(([name, value]) => [
              name,
              normalizeBuildlabFieldValue(value),
            ])
          )
        : undefined,
      next: normalizedNext,
    };
  };

  return {
    ...workspaceState,
    blocks: {
      ...workspaceState.blocks,
      // Blockly may leave null entries after a block is deleted. They are not
      // meaningful source blocks and must not reach the field normalizer.
      blocks: workspaceState.blocks.blocks
        .filter((block): block is BuildlabBlockState => Boolean(block))
        .map(normalizeBlock),
    },
  };
}
