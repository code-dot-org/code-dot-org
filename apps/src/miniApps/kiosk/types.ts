import {KioskElementType} from './constants';

export interface KioskElement {
  type: KioskElementType;
  id: string;
  text: string;
  // Percentages of the screen's width and height, from its top left corner.
  x: number;
  y: number;
}

export interface KioskScene {
  elements: KioskElement[];
}
