import {
  getNodesBounds,
  layoutDisplayTree,
  TREE_COLUMN_GAP,
  TREE_NODE_HEIGHT,
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

  test('a row gap spaces the rows by that much', () => {
    const rowGap = 10;
    const layout = layoutDisplayTree(
      question(question(answer(1), answer(2)), answer(3)),
      rowGap,
    );
    const [root, inner, first] = layout.nodes;

    expect([root.y, inner.y, first.y]).toEqual([
      0,
      TREE_NODE_HEIGHT + rowGap,
      2 * (TREE_NODE_HEIGHT + rowGap),
    ]);
    expect(layout.height).toBe(3 * TREE_NODE_HEIGHT + 2 * rowGap);
  });

  test('the bounds of every node are the size of the layout', () => {
    const layout = layoutDisplayTree(
      question(question(answer(1), answer(2)), answer(3)),
    );

    expect(getNodesBounds(layout.nodes)).toEqual({
      x: 0,
      y: 0,
      width: layout.width,
      height: layout.height,
    });
  });

  test('the bounds of some nodes cover just those nodes', () => {
    const layout = layoutDisplayTree(
      question(answer(1), question(answer(2), answer(3))),
    );
    const [, , inner, , last] = layout.nodes;

    expect(getNodesBounds([inner, last])).toEqual({
      x: inner.x,
      y: inner.y,
      width: last.x + TREE_NODE_WIDTH - inner.x,
      height: last.y + TREE_NODE_HEIGHT - inner.y,
    });
  });
});
