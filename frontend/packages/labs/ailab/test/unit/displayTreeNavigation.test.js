import {layoutDisplayTree} from '../../src/helpers/displayTreeLayout';
import {getNodeForKey} from '../../src/helpers/displayTreeNavigation';

describe('getNodeForKey', () => {
  const answer = prediction => ({type: 'answer', prediction});
  const question = (column, left, right) => ({
    type: 'question',
    column,
    branches: [
      {kind: 'values', values: ['a'], child: left},
      {kind: 'values', values: ['b'], child: right},
    ],
  });

  const {nodes} = layoutDisplayTree(
    question(
      'root',
      question('left', answer('left.0'), answer('left.1')),
      question(
        'right',
        answer('right.0'),
        question('deep', answer('deep.0'), answer('deep.1')),
      ),
    ),
  );
  const named = name =>
    nodes.find(({node}) => (node.column ?? node.prediction) === name);
  const move = (from, key) => {
    const to = getNodeForKey(nodes, named(from), key);
    return to && (to.node.column ?? to.node.prediction);
  };

  test('up moves to the parent', () => {
    expect(move('deep', 'ArrowUp')).toBe('right');
  });

  test('down moves to the first child', () => {
    expect(move('right', 'ArrowDown')).toBe('right.0');
  });

  test('left and right move along the row, across subtrees', () => {
    expect(move('left.1', 'ArrowRight')).toBe('right.0');
    expect(move('right.0', 'ArrowLeft')).toBe('left.1');
  });

  test('an arrow toward an edge stays put', () => {
    expect(move('root', 'ArrowUp')).toBe('root');
    expect(move('left.0', 'ArrowDown')).toBe('left.0');
    expect(move('left.0', 'ArrowLeft')).toBe('left.0');
    expect(move('deep', 'ArrowRight')).toBe('deep');
  });

  test('home moves to the root and end to the last node in the row', () => {
    expect(move('deep.1', 'Home')).toBe('root');
    expect(move('left.0', 'End')).toBe('deep');
  });

  test('other keys move nowhere', () => {
    expect(move('root', 'Enter')).toBeUndefined();
  });
});
