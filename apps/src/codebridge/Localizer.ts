import type {ProjectFile} from '@cdo/apps/lab2/types';

/**
 * This is the base class for a source code localizer.
 */
abstract class Localizer {
  readonly locale: string;

  constructor(locale: string) {
    this.locale = locale;
  }

  abstract localize(file: ProjectFile): ProjectFile;
}

export default Localizer;
