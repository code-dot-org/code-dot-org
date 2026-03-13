import {BubbleChoiceCustomModes} from '@cdo/generated-scripts/sharedConstants';

import {LevelProperties} from '../lab2/types';
import {ValueOf} from '../types/utils';

export interface BubbleChoiceLevelProperties extends LevelProperties {
  customMode?: ValueOf<typeof BubbleChoiceCustomModes>;
}
