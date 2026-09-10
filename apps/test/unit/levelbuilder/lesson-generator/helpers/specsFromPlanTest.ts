import {OutlineLevel} from '@cdo/apps/levelbuilder/lesson-generator/ai/outline';
import {
  appendPlannedSpecs,
  specsFromPlannedLevels,
} from '@cdo/apps/levelbuilder/lesson-generator/helpers/specsFromPlan';
import {LevelSpec} from '@cdo/apps/levelbuilder/lesson-generator/types';

describe('specsFromPlannedLevels', () => {
  const planned = (overrides: Partial<OutlineLevel>): OutlineLevel => ({
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

describe('appendPlannedSpecs', () => {
  const row = (over: Partial<LevelSpec>): LevelSpec => ({
    key: over.key ?? 'k',
    id: '',
    labType: 'panels',
    description: '',
    generate: true,
    ...over,
  });

  it('replaces blank starter rows and keeps everything else', () => {
    const prev = [
      row({key: 'blank'}),
      row({key: 'typed', description: 'Typed.'}),
      row({key: 'coded', labType: 'pythonlab', suppliedCode: 'x = 1'}),
      row({key: 'existing', existing: {} as LevelSpec['existing']}),
      row({key: 'unsupported', unsupportedType: 'Odd'}),
    ];
    const planned = [row({key: 'new', id: 'n', description: 'New.'})];
    expect(appendPlannedSpecs(prev, planned).map(s => s.key)).toEqual([
      'typed',
      'coded',
      'existing',
      'unsupported',
      'new',
    ]);
  });
});
