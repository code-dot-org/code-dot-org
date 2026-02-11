import Cell from './Cell';
import DirtDrawer from './DirtDrawer';
import Subtype from './Subtype';

class Farmer<T extends Cell> extends Subtype<T, DirtDrawer> {
  /** @override */
  isFarmer(): boolean {
    return true;
  }
}

export default Farmer;
