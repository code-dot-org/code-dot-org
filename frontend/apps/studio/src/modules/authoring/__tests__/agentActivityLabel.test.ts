import {describe, expect, it} from 'vitest';

import {describeAgentTool} from '../agentActivityLabel';

describe('describeAgentTool', () => {
  it('maps a known tool with a hint to a present-progressive label', () => {
    expect(describeAgentTool('search_existing_levels: bee puzzle')).toBe(
      'Searching levels — bee puzzle',
    );
  });

  it('maps a known tool with no hint, adding an ellipsis', () => {
    expect(describeAgentTool('get_curriculum')).toBe('Reading curriculum…');
  });

  it('falls back to the raw tool name for an unlisted tool', () => {
    expect(describeAgentTool('some_future_tool: extra context')).toBe(
      'some_future_tool — extra context',
    );
  });
});
