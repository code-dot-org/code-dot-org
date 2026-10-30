import {
  fileMetadataForEditor,
  updateAllSourceFileOrders,
} from '@cdo/apps/javalab/JavalabFileHelper';

describe('fileMetadataForEditor', () => {
  it('returns empty result for empty sources', () => {
    const result = fileMetadataForEditor({}, false);
    expect(result.fileMetadata).toEqual({});
    expect(result.orderedTabKeys).toEqual([]);
    expect(result.activeTabKey).toBeNull();
    expect(result.lastTabKeyIndex).toBe(-1);
  });

  it('maps a single visible file to file-0', () => {
    const sources = {
      'MyClass.java': {text: '', tabOrder: 0, isVisible: true},
    };
    const result = fileMetadataForEditor(sources, false);
    expect(result.fileMetadata).toEqual({'file-0': 'MyClass.java'});
    expect(result.orderedTabKeys).toEqual(['file-0']);
    expect(result.activeTabKey).toBe('file-0');
    expect(result.lastTabKeyIndex).toBe(0);
  });

  it('orders tab keys according to tabOrder, not insertion order', () => {
    const sources = {
      'ClassOne.java': {text: '', tabOrder: 2, isVisible: true},
      'ClassTwo.java': {text: '', tabOrder: 0, isVisible: true},
      'ClassThree.java': {text: '', tabOrder: 1, isVisible: true},
    };
    const result = fileMetadataForEditor(sources, false);

    // fileMetadata is assigned in insertion order: file-0→ClassOne, file-1→ClassTwo, file-2→ClassThree
    expect(result.fileMetadata).toEqual({
      'file-0': 'ClassOne.java',
      'file-1': 'ClassTwo.java',
      'file-2': 'ClassThree.java',
    });
    // orderedTabKeys reflects tabOrder values (0→ClassTwo=file-1, 1→ClassThree=file-2, 2→ClassOne=file-0)
    expect(result.orderedTabKeys).toEqual(['file-1', 'file-2', 'file-0']);
    expect(result.activeTabKey).toBe('file-1');
    expect(result.lastTabKeyIndex).toBe(2);
  });

  it('excludes invisible files when isEditingStartSources is false', () => {
    const sources = {
      'Visible.java': {text: '', tabOrder: 0, isVisible: true},
      'Hidden.java': {text: '', tabOrder: 1, isVisible: false},
    };
    const result = fileMetadataForEditor(sources, false);
    expect(Object.values(result.fileMetadata)).toEqual(['Visible.java']);
    expect(result.orderedTabKeys).toEqual(['file-0']);
  });

  it('includes invisible files when isEditingStartSources is true', () => {
    const sources = {
      'Visible.java': {text: '', tabOrder: 0, isVisible: true},
      'Hidden.java': {text: '', tabOrder: 1, isVisible: false},
    };
    const result = fileMetadataForEditor(sources, true);
    expect(Object.values(result.fileMetadata)).toContain('Visible.java');
    expect(Object.values(result.fileMetadata)).toContain('Hidden.java');
    expect(result.orderedTabKeys).toHaveLength(2);
  });

  it('falls back to insertion order when tabOrder is undefined on any file', () => {
    const sources = {
      'Class1.java': {text: '', tabOrder: 0, isVisible: true},
      'Class2.java': {text: '', isVisible: true}, // no tabOrder
    };
    const result = fileMetadataForEditor(sources, false);
    // isValid becomes false, so orderedTabKeys should equal unorderedTabKeys
    expect(result.orderedTabKeys).toEqual(['file-0', 'file-1']);
  });

  it('falls back to insertion order when two files share the same tabOrder', () => {
    const sources = {
      'Class1.java': {text: '', tabOrder: 0, isVisible: true},
      'Class2.java': {text: '', tabOrder: 0, isVisible: true}, // duplicate tabOrder
    };
    const result = fileMetadataForEditor(sources, false);
    expect(result.orderedTabKeys).toEqual(['file-0', 'file-1']);
  });

  it('filters out gaps caused by invisible files with tabOrders', () => {
    // Validation file has tabOrder 0 but is invisible; visible file has tabOrder 1.
    // After filtering, orderedTabKeys should contain only the visible file's key.
    const sources = {
      'Validation.java': {text: '', tabOrder: 0, isVisible: false},
      'Starter.java': {text: '', tabOrder: 1, isVisible: true},
    };
    const result = fileMetadataForEditor(sources, false);
    // Only 'Starter.java' is visible → assigned file-0 with tabOrder slot 1 → after filter, one key
    expect(result.orderedTabKeys).toHaveLength(1);
    expect(result.fileMetadata['file-0']).toBe('Starter.java');
  });
});

describe('updateAllSourceFileOrders', () => {
  it('sets tabOrder of each file to its position in orderedTabKeys', () => {
    const sources = {
      'ClassOne.java': {text: '', tabOrder: 2},
      'ClassTwo.java': {text: '', tabOrder: 0},
      'ClassThree.java': {text: '', tabOrder: 1},
    };
    const fileMetadata = {
      'file-0': 'ClassOne.java',
      'file-1': 'ClassTwo.java',
      'file-2': 'ClassThree.java',
    };
    const orderedTabKeys = ['file-1', 'file-2', 'file-0'];

    const updated = updateAllSourceFileOrders(
      sources,
      fileMetadata,
      orderedTabKeys
    );

    expect(updated['ClassTwo.java'].tabOrder).toBe(0);
    expect(updated['ClassThree.java'].tabOrder).toBe(1);
    expect(updated['ClassOne.java'].tabOrder).toBe(2);
  });

  it('sets tabOrder to 0 for a single file', () => {
    const sources = {'MyClass.java': {text: '', tabOrder: 5}};
    const fileMetadata = {'file-0': 'MyClass.java'};
    const orderedTabKeys = ['file-0'];

    const updated = updateAllSourceFileOrders(
      sources,
      fileMetadata,
      orderedTabKeys
    );
    expect(updated['MyClass.java'].tabOrder).toBe(0);
  });

  it('returns the same sources object (mutates in place)', () => {
    const sources = {
      'A.java': {text: '', tabOrder: 1},
      'B.java': {text: '', tabOrder: 0},
    };
    const fileMetadata = {'file-0': 'A.java', 'file-1': 'B.java'};
    const orderedTabKeys = ['file-0', 'file-1'];

    const updated = updateAllSourceFileOrders(
      sources,
      fileMetadata,
      orderedTabKeys
    );
    expect(updated).toBe(sources);
  });

  it('reassigns tabOrders after a reorder', () => {
    const sources = {
      'Class1.java': {text: '', tabOrder: 0},
      'Class2.java': {text: '', tabOrder: 1},
      'Class3.java': {text: '', tabOrder: 2},
    };
    const fileMetadata = {
      'file-0': 'Class1.java',
      'file-1': 'Class2.java',
      'file-2': 'Class3.java',
    };
    // Simulate moving Class3 to the front
    const orderedTabKeys = ['file-2', 'file-0', 'file-1'];

    updateAllSourceFileOrders(sources, fileMetadata, orderedTabKeys);

    expect(sources['Class3.java'].tabOrder).toBe(0);
    expect(sources['Class1.java'].tabOrder).toBe(1);
    expect(sources['Class2.java'].tabOrder).toBe(2);
  });
});
