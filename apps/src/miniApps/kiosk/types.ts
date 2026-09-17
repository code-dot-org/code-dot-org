import {KioskElementType} from './constants';

export interface KioskElement {
  type: KioskElementType;
  id: string;
  text: string;
  // Percentages of the screen's width and height, from its top left corner.
  x: number;
  y: number;
  // Sliders only: the ends of the range, and where the handle sits now.
  min?: number;
  max?: number;
  value?: number;
}

// What a viewer did to an element. A slider move carries where it was left; a
// press has nothing to carry.
export interface KioskEvent {
  id: string;
  value?: number;
}

export interface KioskScene {
  elements: KioskElement[];
}
