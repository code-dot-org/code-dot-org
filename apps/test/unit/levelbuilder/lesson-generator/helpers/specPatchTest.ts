import {mergeSpecPatch} from '@cdo/apps/levelbuilder/lesson-generator/helpers/specPatch';
import {LevelSpec} from '@cdo/apps/levelbuilder/lesson-generator/types';

describe('mergeSpecPatch', () => {
  const spec: LevelSpec = {
    key: 'k',
    id: 'build',
    labType: 'weblab2',
    description: 'Build a page.',
    generate: true,
    suppliedCode: '<h1>hi</h1>',
    templateGroup: 'main',
  };

  it('merges a patch that keeps the lab type', () => {
    const next = mergeSpecPatch(spec, {description: 'Edited.'});
    expect(next.description).toBe('Edited.');
    expect(next.suppliedCode).toBe('<h1>hi</h1>');
    expect(next.templateGroup).toBe('main');
  });

  it('drops lab-specific fields the new lab type cannot use', () => {
    const next = mergeSpecPatch(spec, {labType: 'bubbleChoice'});
    expect(next.labType).toBe('bubbleChoice');
    expect(next.suppliedCode).toBeUndefined();
    expect(next.templateGroup).toBeUndefined();
  });

  it('keeps supplied code across the codebridge labs', () => {
    const next = mergeSpecPatch(spec, {labType: 'pythonlab'});
    expect(next.suppliedCode).toBe('<h1>hi</h1>');
    expect(next.templateGroup).toBeUndefined();
  });
});
