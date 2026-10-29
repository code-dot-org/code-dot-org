// A rename reaches a hat whose subject is a property
// (specs/PROPERTY_SUBJECTS_PLAN.md, step 4).

import {describe, expect, it} from 'vitest';

import {rewriteWorkspace} from '../rewriteWorkspaces';

const hat = (subject: string) =>
  JSON.stringify({
    blocks: {
      blocks: [
        {type: 'world_on_Health_IsDamagedEvent', fields: {SUBJECT: subject}},
      ],
    },
  });

describe('a hat about a property, renamed', () => {
  it('follows the property’s getter, which names it', () => {
    const renamed = rewriteWorkspace(
      hat('world_get_ScreensMain_CurrentPlayerProperty'),
      {
        type: type => type.replace('CurrentPlayerProperty', 'HeroProperty'),
        fields() {},
      },
    )!;
    expect(JSON.parse(renamed).blocks.blocks[0].fields.SUBJECT).toBe(
      'world_get_ScreensMain_HeroProperty',
    );
  });

  it('leaves a kind to the rename that moves paths', () => {
    const seen: string[] = [];
    rewriteWorkspace(hat('actors/player'), {
      type: type => {
        seen.push(type);
        return type;
      },
      fields() {},
    });
    expect(seen).toEqual(['world_on_Health_IsDamagedEvent']);
  });
});
