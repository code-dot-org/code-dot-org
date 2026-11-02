import {
  getNodesBounds,
  layoutDisplayTree,
  TREE_COLUMN_GAP,
  TREE_NODE_HEIGHT,
  TREE_NODE_MAX_WIDTH,
} from '@cdo/apps/ailab/engine/helpers/displayTreeLayout';

describe('layoutDisplayTree', () => {
  const answer = (prediction, width) => ({type: 'answer', prediction, width});
  const question = (left, right, width) => ({
    type: 'question',
    column: 'c',
    width,
    branches: [
      {kind: 'values', values: ['a'], child: left},
      {kind: 'values', values: ['b'], child: right},
    ],
  });

  test('answers take one column each and parents center on children', () => {
    const layout = layoutDisplayTree(
      question(question(answer(1), answer(2)), answer(3))
    );
    const [root, inner, first, second, third] = layout.nodes;
    const column = TREE_NODE_MAX_WIDTH + TREE_COLUMN_GAP;

    expect([first.x, second.x, third.x]).toEqual([0, column, 2 * column]);
    expect(inner.x).toBe(column / 2);
    expect(root.x).toBe((inner.x + third.x) / 2);
    expect(layout.width).toBe(3 * column - TREE_COLUMN_GAP);
  });

  test('answers are numbered from left to right', () => {
    const layout = layoutDisplayTree(
      question(question(answer(1), answer(2)), answer(3))
    );

    expect(layout.nodes.map(placed => placed.answerIndex)).toEqual([
      undefined,
      undefined,
      0,
      1,
      2,
    ]);
  });

  test('nodes on one row do not overlap', () => {
    const layout = layoutDisplayTree(
      question(
        question(question(answer(1), answer(2)), answer(3)),
        question(answer(4), question(answer(5), answer(6)))
      )
    );
    const rows = {};
    layout.nodes.forEach(placed => {
      (rows[placed.y] ||= []).push(placed.x);
    });

    Object.values(rows).forEach(xs => {
      const sorted = [...xs].sort((a, b) => a - b);
      sorted.slice(1).forEach((x, index) => {
        expect(x - sorted[index]).toBeGreaterThanOrEqual(TREE_NODE_MAX_WIDTH);
      });
    });
  });

  test('a row gap spaces the rows by that much', () => {
    const rowGap = 10;
    const layout = layoutDisplayTree(
      question(question(answer(1), answer(2)), answer(3)),
      () => TREE_NODE_MAX_WIDTH,
      rowGap
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
      question(question(answer(1), answer(2)), answer(3))
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
      question(answer(1), question(answer(2), answer(3)))
    );
    const [, , inner, , last] = layout.nodes;

    expect(getNodesBounds([inner, last])).toEqual({
      x: inner.x,
      y: inner.y,
      width: last.x + TREE_NODE_MAX_WIDTH - inner.x,
      height: last.y + TREE_NODE_HEIGHT - inner.y,
    });
  });

  describe('with nodes of their own widths', () => {
    const tree = question(
      question(answer(1, 60), answer(2, 80), 260),
      question(
        answer(3, 120),
        question(answer(4, 70), answer(5, 150), 90),
        100
      ),
      200
    );
    const layout = layoutDisplayTree(tree, node => node.width);
    const placedById = Object.fromEntries(
      layout.nodes.map(placed => [placed.id, placed])
    );
    const center = placed => placed.x + placed.width / 2;

    test('each node takes its width', () => {
      layout.nodes.forEach(placed =>
        expect(placed.width).toBe(placed.node.width)
      );
    });

    test('nodes on one row keep at least a column gap apart', () => {
      const rows = {};
      layout.nodes.forEach(placed => (rows[placed.y] ||= []).push(placed));

      Object.values(rows).forEach(row => {
        const sorted = [...row].sort((a, b) => a.x - b.x);
        sorted.slice(1).forEach((placed, index) => {
          const before = sorted[index];
          expect(placed.x - (before.x + before.width)).toBeGreaterThanOrEqual(
            TREE_COLUMN_GAP
          );
        });
      });
    });

    test('a parent centers between its first and last child', () => {
      layout.nodes
        .filter(placed => placed.children.length > 0)
        .forEach(placed => {
          const first = placed.children[0];
          const last = placed.children[placed.children.length - 1];
          expect(center(placed)).toBeCloseTo(
            (center(first) + center(last)) / 2
          );
        });
    });

    test('a parent wider than its children stays inside the layout', () => {
      expect(placedById['0.0'].x).toBe(0);
    });

    test('the layout is as wide as its nodes reach', () => {
      expect(getNodesBounds(layout.nodes)).toEqual({
        x: 0,
        y: 0,
        width: layout.width,
        height: layout.height,
      });
    });
  });
});
