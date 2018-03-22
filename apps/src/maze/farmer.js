import Subtype from './subtype';

export default class Farmer extends Subtype {

  /**
   * @override
   */
  isFarmer() {
    return true;
  }
}
