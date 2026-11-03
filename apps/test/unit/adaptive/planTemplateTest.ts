import {
  fillPlanTemplate,
  planTemplateSegments,
  planTemplateSlots,
} from '@cdo/apps/adaptive/schema/planTemplate';

const template = 'A site about {topic} for {audience}. {topic} again.';

describe('planTemplateSegments', () => {
  it('splits text from slots, in order', () => {
    expect(planTemplateSegments(template)).toEqual([
      {text: 'A site about '},
      {slot: 'topic'},
      {text: ' for '},
      {slot: 'audience'},
      {text: '. '},
      {slot: 'topic'},
      {text: ' again.'},
    ]);
    expect(planTemplateSegments('{only}')).toEqual([{slot: 'only'}]);
    expect(planTemplateSegments('plain')).toEqual([{text: 'plain'}]);
  });
});

describe('planTemplateSlots', () => {
  it('lists each slot once', () => {
    expect(planTemplateSlots(template)).toEqual(['topic', 'audience']);
  });
});

describe('fillPlanTemplate', () => {
  it('puts each answer in its slot', () => {
    expect(
      fillPlanTemplate(template, {topic: 'dogs', audience: 'me', extra: 'x'})
    ).toBe('A site about dogs for me. dogs again.');
  });

  it('is undefined while a slot has no answer', () => {
    expect(fillPlanTemplate(template, {topic: 'dogs'})).toBeUndefined();
  });
});
