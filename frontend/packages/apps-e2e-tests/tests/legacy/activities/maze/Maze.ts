import {labLevelUrl} from '../../../shared/urls';
import {LegacyBlocklyLab} from '../../shared/LegacyBlocklyLab';

/** Page Object for the Maze lab — lesson 2 of allthethingscourse. */
export class Maze extends LegacyBlocklyLab {
  protected buildLevelUrl(level: number): string {
    return labLevelUrl(2, level);
  }
}
