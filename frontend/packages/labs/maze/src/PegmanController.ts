import {DEFAULT_PEGMAN_ID} from './constants';
import Pegman from './Pegman';

class PegmanController {
  private pegmen: {
    [key: string]: Pegman;
  };

  constructor() {
    this.pegmen = {};
  }

  getOrCreatePegman(id?: string): Pegman {
    // if id is null or undefined, set to default value.
    if (id === undefined) {
      id = DEFAULT_PEGMAN_ID;
    }

    let pegman = this.getPegman(id);
    if (!pegman) {
      pegman = new Pegman(id);
      this.addPegman(pegman);
    }

    return pegman;
  }

  getPegman(id?: string): Pegman | undefined {
    // if id is null or undefined, set to default value.
    if (id === undefined) {
      id = DEFAULT_PEGMAN_ID;
    }
    return this.pegmen[id];
  }

  addPegman(pegman: Pegman) {
    if (this.pegmen[pegman.getId()]) {
      throw new Error(`Pegman with id ${pegman.getId()} already exists.`);
    }
    this.pegmen[pegman.getId()] = pegman;
  }

  getAllPegmanIds(): string[] {
    return Object.keys(this.pegmen);
  }

  isDefaultPegman(pegmanId?: string): boolean {
    return pegmanId === undefined || pegmanId === DEFAULT_PEGMAN_ID;
  }
}

export default PegmanController;
