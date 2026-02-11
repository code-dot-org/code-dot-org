import Drawer from './Drawer';
import MazeMap from './MazeMap';
import type Planter from './Planter';
import PlanterCell from './PlanterCell';
import type {Skin} from './skin';

class PlanterDrawer extends Drawer<PlanterCell> {
  private skin_: Skin;
  private subtype_: Planter;

  constructor(
    map: MazeMap<PlanterCell>,
    skin: Skin,
    svg: SVGSVGElement,
    subtype: Planter,
  ) {
    super(map, '', svg);

    this.skin_ = skin;
    this.subtype_ = subtype;
  }

  /** @override */
  getAsset(_prefix: string, row: number, col: number): string | undefined {
    const crop = (this.subtype_.getCell(row, col) as PlanterCell).featureName();
    return (
      this.skin_ as unknown as {
        [key: string]: string;
      }
    )[crop];
  }
}

export default PlanterDrawer;
