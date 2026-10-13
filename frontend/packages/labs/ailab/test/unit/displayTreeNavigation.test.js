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

  test('down and up follow the reading order, a whole branch before the next', () => {
    expect(move('root', 'ArrowDown')).toBe('left');
    expect(move('left.1', 'ArrowDown')).toBe('right');
    expect(move('right', 'ArrowUp')).toBe('left.1');
  });

  test('right moves to the first child', () => {
    expect(move('right', 'ArrowRight')).toBe('right.0');
  });

  test('left moves to the parent', () => {
    expect(move('deep', 'ArrowLeft')).toBe('right');
  });

  test('an arrow toward an edge stays put', () => {
    expect(move('root', 'ArrowUp')).toBe('root');
    expect(move('root', 'ArrowLeft')).toBe('root');
    expect(move('deep.1', 'ArrowDown')).toBe('deep.1');
    expect(move('left.0', 'ArrowRight')).toBe('left.0');
  });

  test('home moves to the root and end to the last node', () => {
    expect(move('deep.1', 'Home')).toBe('root');
    expect(move('left.0', 'End')).toBe('deep.1');
  });

  test('other keys move nowhere', () => {
    expect(move('root', 'Enter')).toBeUndefined();
  });
});
