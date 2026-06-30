import maze from '@code-dot-org/maze';

import MazeKeyboardNavigation from '@cdo/apps/maze/keyboardNavigation';

const {SquareType} = maze.tiles;
const {WALL, OPEN, START, FINISH} = SquareType;

// 3x3 grid indexed [row][col]. Pegman starts on the START cell at (0,0),
// the goal sits at (2,2), and walls block the two diagonals so movement
// has something to bump into.
const GRID = [
  [START, OPEN, WALL],
  [OPEN, WALL, OPEN],
  [WALL, OPEN, FINISH],
];

function fakeController() {
  return {
    SQUARE_SIZE: 50,
    subtype: {finish: {x: 2, y: 2}},
    map: {
      ROWS: GRID.length,
      COLS: GRID[0].length,
      getTile: (row, col) => GRID[row]?.[col],
    },
    getPegmanX: () => 0,
    getPegmanY: () => 0,
  };
}

describe('MazeKeyboardNavigation', () => {
  let wrapper, svg, nav;

  // Cells are tagged role="img"; the decorative focus ring is not, so
  // this selects only the navigable cells.
  const cellAt = (col, row) =>
    svg.querySelector(`rect[role="img"][x="${col * 50}"][y="${row * 50}"]`);
  const cells = () => svg.querySelectorAll('rect[role="img"]');
  const liveRegion = () => wrapper.querySelector('[aria-live]');
  const press = (target, key) =>
    target.dispatchEvent(
      new KeyboardEvent('keydown', {key, bubbles: true, cancelable: true})
    );

  beforeEach(() => {
    jest.useFakeTimers();
    wrapper = document.createElement('div');
    wrapper.tabIndex = 0;
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    wrapper.appendChild(svg);
    document.body.appendChild(wrapper);
    window.Maze = {controller: fakeController()};
    nav = new MazeKeyboardNavigation(wrapper, svg);
  });

  afterEach(() => {
    nav.destroy();
    wrapper.remove();
    delete window.Maze;
    jest.useRealTimers();
  });

  it('does nothing until Enter activates it', () => {
    expect(cells()).toHaveLength(0);
    press(wrapper, 'ArrowDown');
    expect(cells()).toHaveLength(0);
  });

  it('lays a focusable, labeled cell over every non-wall square', () => {
    press(wrapper, 'Enter');
    // Six navigable squares; the three walls get no cell.
    expect(cells()).toHaveLength(6);
    expect(cellAt(2, 0)).toBeNull();
    expect(cellAt(0, 0).getAttribute('aria-label')).toMatch(/^start\./);
    expect(cellAt(2, 2).getAttribute('aria-label')).toMatch(/^goal\./);
    cells().forEach(rect =>
      expect(rect.getAttribute('aria-label')).toBeTruthy()
    );
  });

  it('enters on Pegman and keeps a single roving tab stop', () => {
    press(wrapper, 'Enter');
    expect(cellAt(0, 0).getAttribute('tabindex')).toBe('0');
    expect(cellAt(0, 0).getAttribute('aria-label')).toContain(
      'Character is here.'
    );

    // ArrowDown: (col 0, row 0) -> (col 0, row 1), both open.
    press(wrapper, 'ArrowDown');
    expect(cellAt(0, 0).getAttribute('tabindex')).toBe('-1');
    expect(cellAt(0, 1).getAttribute('tabindex')).toBe('0');
  });

  it('reports a wall through the live region without moving focus', () => {
    press(wrapper, 'Enter');
    press(wrapper, 'ArrowDown'); // sit on the open cell at (col 0, row 1)
    // ArrowRight from there targets (col 1, row 1), a wall.
    press(wrapper, 'ArrowRight');
    jest.runOnlyPendingTimers();
    expect(liveRegion().textContent).toBe('Wall.');
    // Focus stayed put: the wall is never a tab stop.
    expect(cellAt(0, 1).getAttribute('tabindex')).toBe('0');
    expect(cellAt(1, 1)).toBeNull();
  });

  it('reports the maze edge through the live region', () => {
    press(wrapper, 'Enter');
    press(wrapper, 'ArrowUp'); // already on the top row
    jest.runOnlyPendingTimers();
    expect(liveRegion().textContent).toBe('Edge of maze.');
    expect(cellAt(0, 0).getAttribute('tabindex')).toBe('0');
  });

  it('does not echo path or goal moves to the live region', () => {
    press(wrapper, 'Enter');
    liveRegion().textContent = '';
    press(wrapper, 'ArrowDown'); // onto an open path cell
    jest.runOnlyPendingTimers();
    expect(liveRegion().textContent).toBe('');
  });

  it('tears the overlay down on Escape', () => {
    press(wrapper, 'Enter');
    expect(cells().length).toBeGreaterThan(0);
    press(wrapper, 'Escape');
    expect(cells()).toHaveLength(0);
    jest.runOnlyPendingTimers();
    expect(liveRegion().textContent).toBe('Exited maze navigation.');
  });
});
