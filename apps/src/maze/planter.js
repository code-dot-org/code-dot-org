import Subtype from './subtype';
import PlanterCell from './planterCell';
import PlanterDrawer from './planterDrawer';

const TerminationValue = {
  PLANT_IN_NON_SOIL: 0,
  DID_NOT_PLANT_EVERYWHERE: 1,
};

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

  atSprout(id) {
    return this.atType(PlanterCell.FeatureType.SPROUT, id);
  }

  atSoil(id) {
    return this.atType(PlanterCell.FeatureType.SOIL, id);
  }

  atType(type, id) {
    const col = this.maze_.pegmanX;
    const row = this.maze_.pegmanY;

    const cell = this.getCell(row, col);

    this.maze_.executionInfo.queueAction('at_' + cell.featureName(), id);
    return cell.featureType() === type;
  }

  plant(id) {
    const col = this.maze_.pegmanX;
    const row = this.maze_.pegmanY;

    const cell = this.getCell(row, col);

    if (cell.featureType() !== PlanterCell.FeatureType.SOIL) {
      this.maze_.executionInfo.terminateWithValue(TerminationValue.PLANT_IN_NON_SOIL);
      return;
    }

    this.maze_.executionInfo.queueAction('plant', id);
    cell.setFeatureType(PlanterCell.FeatureType.SPROUT);
  }

  animatePlant(id) {
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

Planter.TerminationValue = TerminationValue;
