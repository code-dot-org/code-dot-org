import Cell from './Cell';
import Drawer from './Drawer';
import MazeMap from './MazeMap';
import Subtype from './Subtype';

class Gatherer<T extends Cell, U extends Drawer<T>> extends Subtype<T, U> {
  reset() {
    this.maze_?.map?.resetDirt();
  }

  collectedEverything(): boolean {
    const missedSomething = (
      this.maze_?.map as MazeMap<T> | undefined
    )?.currentStaticGrid.some((row: T[]) =>
      row.some((cell: T) => cell.isDirt() && (cell.getCurrentValue() || 0) > 0),
    );

    return !missedSomething;
  }

  /**
   * Did we reach our total nectar/honey goals?
   */
  succeeded(): boolean {
    return this.collectedEverything();
  }
}

export default Gatherer;
