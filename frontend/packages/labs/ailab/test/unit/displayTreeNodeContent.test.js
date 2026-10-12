import {TREE_NODE_MAX_WIDTH} from '../../src/helpers/displayTreeLayout';
import {nodeWidthMeasurer} from '../../src/helpers/displayTreeNodeContent';
import I18n from '../../src/i18n';

describe('nodeWidthMeasurer', () => {
  const answer = prediction => ({type: 'answer', prediction});

  beforeEach(() => I18n.initI18n());
  afterEach(() => I18n.reset());

  test('measures a longer label wider', () => {
    const nodeWidth = nodeWidthMeasurer('unknown');

    expect(nodeWidth(answer('Mammal'))).toBeGreaterThan(
      nodeWidth(answer('Fish')),
    );
  });

  test('caps a node at the max width', () => {
    const nodeWidth = nodeWidthMeasurer('unknown');

    expect(nodeWidth(answer('x'.repeat(100)))).toBe(TREE_NODE_MAX_WIDTH);
  });
});
