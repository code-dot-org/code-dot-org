import {
  layoutDisplayTree,
  TREE_COLUMN_GAP,
  TREE_NODE_WIDTH,
} from '../../src/helpers/displayTreeLayout';

describe('layoutDisplayTree', () => {
  const answer = prediction => ({type: 'answer', prediction});
  const question = (left, right) => ({
    type: 'question',
    column: 'c',
    branches: [
      {kind: 'values', values: ['a'], child: left},
      {kind: 'values', values: ['b'], child: right},
    ],
  });

  test('answers take one column each and parents center on children', () => {
    const layout = layoutDisplayTree(
      question(question(answer(1), answer(2)), answer(3)),
    );
    const [root, inner, first, second, third] = layout.nodes;
    const column = TREE_NODE_WIDTH + TREE_COLUMN_GAP;

    expect([first.x, second.x, third.x]).toEqual([0, column, 2 * column]);
    expect(inner.x).toBe(column / 2);
    expect(root.x).toBe((inner.x + third.x) / 2);
    expect(layout.width).toBe(3 * column - TREE_COLUMN_GAP);
  });

  test('nodes on one row do not overlap', () => {
    const layout = layoutDisplayTree(
      question(
        question(question(answer(1), answer(2)), answer(3)),
        question(answer(4), question(answer(5), answer(6))),
      ),
    );
    const rows = {};
    layout.nodes.forEach(placed => {
      (rows[placed.y] ||= []).push(placed.x);
    });

    Object.values(rows).forEach(xs => {
      const sorted = [...xs].sort((a, b) => a - b);
      sorted.slice(1).forEach((x, index) => {
        expect(x - sorted[index]).toBeGreaterThanOrEqual(TREE_NODE_WIDTH);
      });
    });
  });
});
