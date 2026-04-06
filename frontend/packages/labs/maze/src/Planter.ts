import type {CellConstructor} from './Cell';
import MazeMap from './MazeMap';
import PlanterCell, {FeatureType} from './PlanterCell';
import PlanterDrawer from './PlanterDrawer';
import Subtype from './Subtype';

class Planter extends Subtype<PlanterCell, PlanterDrawer> {
  reset() {
    this.maze_?.map?.forEachCell(cell => {
      (cell as PlanterCell).resetCurrentFeature();
    });
  }

  /** @override */
  getCellClass(): CellConstructor {
    return PlanterCell;
  }

  /** @override */
  createDrawer(svg: SVGSVGElement) {
    if (this.maze_.map) {
      this.drawer = new PlanterDrawer(
        this.maze_.map as MazeMap<PlanterCell>,
        this.skin_,
        svg,
        this,
      );
    }
  }

  atSprout(): boolean {
    return this.atType(FeatureType.SPROUT);
  }

  atSoil(): boolean {
    return this.atType(FeatureType.SOIL);
  }

  atType(type: number): boolean {
    const col = this.maze_.getPegmanX() || 0;
    const row = this.maze_.getPegmanY() || 0;

    const cell = this.getCell(row, col) as PlanterCell;
    return cell?.featureType() === type;
  }

  /**
   * Attempt to plant a sprout at the current location; terminate the execution
   * if this is not a valid place at which to plant.
   *
   * This method is preferred over animatePlant for "headless" operation (ie
   * when validating quantum levels)
   *
   * @fires plantInNonSoil
   * @return Whether or not this attempt was successful
   */
  tryPlant(): boolean {
    const col = this.maze_.getPegmanX() || 0;
    const row = this.maze_.getPegmanY() || 0;

    const cell = this.getCell(row, col) as PlanterCell;

    if (cell.featureType() !== FeatureType.SOIL) {
      this.emit('plantInNonSoil');
      return false;
    }

    cell.setFeatureType(FeatureType.SPROUT);
    return true;
  }

  /**
   * Display the planting of a sprout at the current location; raise a runtime
   * error if the current location is not a valid spot at which to plant.
   *
   * This method is preferred over tryPlant for live operation (ie when actually
   * displaying something to the user)
   *
   * @throws Will throw an error if the current cell has no nectar.
   */
  animatePlant() {
    const col = this.maze_.getPegmanX() || 0;
    const row = this.maze_.getPegmanY() || 0;

    const cell = this.getCell(row, col) as PlanterCell;

    if (cell.featureType() !== FeatureType.SOIL) {
      throw new Error("Shouldn't be able to plant in anything but soil");
    }

    cell.setFeatureType(FeatureType.SPROUT);
    this.drawer.updateItemImage(row, col, true);
  }
}

export default Planter;
