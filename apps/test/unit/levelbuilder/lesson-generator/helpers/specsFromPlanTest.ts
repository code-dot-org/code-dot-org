import {
  PlannedLevel,
  specsFromPlannedLevels,
} from '@cdo/apps/levelbuilder/lesson-generator/helpers/specsFromPlan';

describe('specsFromPlannedLevels', () => {
  const planned = (overrides: Partial<PlannedLevel>): PlannedLevel => ({
    id: 'intro',
    labType: 'panels',
    description: 'A short intro.',
    ...overrides,
  });

  it('maps planned levels to fresh generate-on cards with unique keys', () => {
    const specs = specsFromPlannedLevels([
      planned({id: 'one'}),
      planned({id: 'two', labType: 'freeResponse'}),
    ]);
    expect(specs.map(s => s.id)).toEqual(['one', 'two']);
    expect(specs.map(s => s.labType)).toEqual(['panels', 'freeResponse']);
    expect(specs.every(s => s.generate)).toBe(true);
    expect(specs[0].key).not.toBe(specs[1].key);
  });

  it('defaults the aichat preset when the AI omits one', () => {
    const [withPreset, withoutPreset] = specsFromPlannedLevels([
      planned({labType: 'aichat', aichatPreset: 'tutor'}),
      planned({labType: 'aichat'}),
    ]);
    expect(withPreset.aichatPreset).toBe('tutor');
    expect(withoutPreset.aichatPreset).toBeTruthy();
  });

  it('keeps templateGroup only on weblab2 cards', () => {
    const [web, other] = specsFromPlannedLevels([
      planned({labType: 'weblab2', templateGroup: 'shop'}),
      planned({labType: 'panels', templateGroup: 'shop'}),
    ]);
    expect(web.templateGroup).toBe('shop');
    expect(other.templateGroup).toBeUndefined();
  });

  it('keeps suppliedCode only on codebridge cards', () => {
    const [py, web, other] = specsFromPlannedLevels([
      planned({labType: 'pythonlab', suppliedCode: 'print(1)'}),
      planned({labType: 'weblab2', suppliedCode: '<p>hi</p>'}),
      planned({labType: 'panels', suppliedCode: 'x'}),
    ]);
    expect(py.suppliedCode).toBe('print(1)');
    expect(web.suppliedCode).toBe('<p>hi</p>');
    expect(other.suppliedCode).toBeUndefined();
  });

  it('maps bubbleChoice sublevels with their own keys and presets', () => {
    const [spec] = specsFromPlannedLevels([
      planned({
        labType: 'bubbleChoice',
        sublevels: [
          {id: 'a', labType: 'weblab2', description: 'Build a page.'},
          {id: 'b', labType: 'aichat', description: 'Chat about it.'},
        ],
      }),
    ]);
    const subs = spec.sublevels!;
    expect(subs.map(s => s.id)).toEqual(['a', 'b']);
    expect(subs.every(s => s.generate)).toBe(true);
    expect(subs[0].key).not.toBe(subs[1].key);
    expect(subs[0].aichatPreset).toBeUndefined();
    expect(subs[1].aichatPreset).toBeTruthy();
  });
});
