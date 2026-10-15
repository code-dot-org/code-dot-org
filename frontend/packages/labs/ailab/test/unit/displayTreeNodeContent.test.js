import {TREE_NODE_MAX_WIDTH} from '../../src/helpers/displayTreeLayout';
import {nodeWidthMeasurer} from '../../src/helpers/displayTreeNodeContent';
import {NO_ROWS} from '../../src/helpers/displayTreeTrace';
import I18n from '../../src/i18n';

describe('nodeWidthMeasurer', () => {
  const answer = prediction => ({type: 'answer', prediction});

  beforeEach(() => I18n.initI18n());
  afterEach(() => I18n.reset());

  test('measures a longer label wider', () => {
    const nodeWidth = nodeWidthMeasurer('unknown', () => NO_ROWS);

    expect(nodeWidth(answer('Mammal'), '0')).toBeGreaterThan(
      nodeWidth(answer('Fish'), '0')
    );
  });

  test('an answer that shows grades measures them, not its row count', () => {
    const counts = new Map([
      ['0.0', {correct: 1, incorrect: 0}],
      ['0.1', {correct: 1, incorrect: 1}],
    ]);
    const nodeWidth = nodeWidthMeasurer('unknown', id => counts.get(id));

    expect(nodeWidth(answer('Fish'), '0.1')).toBeGreaterThan(
      nodeWidth(answer('Fish'), '0.0')
    );
  });

  test('caps a node at the max width', () => {
    const nodeWidth = nodeWidthMeasurer('unknown', () => NO_ROWS);

    expect(nodeWidth(answer('x'.repeat(100)), '0')).toBe(TREE_NODE_MAX_WIDTH);
  });
});
