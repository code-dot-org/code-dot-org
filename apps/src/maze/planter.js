import Subtype from './subtype';
import PlanterCell from './planterCell';
import PlanterDrawer from './planterDrawer';

export default class Planter extends Subtype {

  reset() {
    this.maze_.map.forEachCell(cell => {
      cell.resetCurrentFeature();
    });
  }

  /**
   * @override
   */
  getCellClass() {
    return PlanterCell;
  }

  /**
   * @override
   */
  createDrawer(svg) {
    this.drawer = new PlanterDrawer(this.maze_.map, this.skin_, svg, this);
  }

  atSprout() {
    return this.atType(PlanterCell.FeatureType.SPROUT);
  }

  atSoil() {
    return this.atType(PlanterCell.FeatureType.SOIL);
  }

  atType(type) {
    const col = this.maze_.pegmanX;
    const row = this.maze_.pegmanY;

    const cell = this.getCell(row, col);

    return cell.featureType() === type;
  }

  /**
   * Attempt to plant a sprout at the current location; terminate the execution
   * if this is not a valid place at which to plant.
   *
   * This method is preferred over animatePlant for "headless" operation (ie
   * when validating quantum levels)
   *
   * @fires plantInNonSoil
   * @return {boolean} whether or not this attempt was successful
   */
  tryPlant() {
    const col = this.maze_.pegmanX;
    const row = this.maze_.pegmanY;

    const cell = this.getCell(row, col);

    if (cell.featureType() !== PlanterCell.FeatureType.SOIL) {
      this.emit('plantInNonSoil');
      return false;
    }

    cell.setFeatureType(PlanterCell.FeatureType.SPROUT);
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
    const col = this.maze_.pegmanX;
    const row = this.maze_.pegmanY;

    const cell = this.getCell(row, col);

    if (cell.featureType() !== PlanterCell.FeatureType.SOIL) {
      throw new Error("Shouldn't be able to plant in anything but soil");
    }

    cell.setFeatureType(PlanterCell.FeatureType.SPROUT);
    this.drawer.updateItemImage(row, col, true);
  }
}
