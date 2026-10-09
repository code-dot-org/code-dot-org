import {TREE_NODE_MAX_WIDTH} from '../../src/helpers/displayTreeLayout';
import {measureDisplayTreeNodes} from '../../src/helpers/displayTreeNodeContent';
import I18n from '../../src/i18n';

describe('measureDisplayTreeNodes', () => {
  const answer = prediction => ({type: 'answer', prediction});
  const question = (column, left, right) => ({
    type: 'question',
    column,
    branches: [
      {kind: 'values', values: ['a'], child: left},
      {kind: 'values', values: ['b'], child: right},
    ],
  });

  beforeEach(() => I18n.initI18n());
  afterEach(() => I18n.reset());

  test('measures every node, a longer label wider', () => {
    const widths = measureDisplayTreeNodes(
      question('Legs', answer('Fish'), answer('Mammal')),
      'unknown',
    );

    expect([...widths.keys()]).toEqual(['0', '0.0', '0.1']);
    expect(widths.get('0.1')).toBeGreaterThan(widths.get('0.0'));
  });

  test('caps a node at the max width', () => {
    const widths = measureDisplayTreeNodes(answer('x'.repeat(100)), 'unknown');

    expect(widths.get('0')).toBe(TREE_NODE_MAX_WIDTH);
  });
});
