import Drawer from './drawer';

export default class PlanterDrawer extends Drawer {
  constructor(map, skin, svg, subtype) {
    super(map, '', svg);
    this.skin_ = skin;
    this.subtype_ = subtype;
  }

  /**
   * @override
   */
  getAsset(prefix, row, col) {
    const crop = this.subtype_.getCell(row, col).featureName();
    return this.skin_[crop];
  }
}
