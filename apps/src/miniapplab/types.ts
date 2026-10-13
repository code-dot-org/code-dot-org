export type ElementType = 'label' | 'input' | 'button' | 'output';

/**
 * One element on the app screen.  `text` is the label's text, the input's
 * placeholder, the button's caption, or the output's starting text.
 */
export interface AppElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
}

export type AppDesign = AppElement[];

/** The text each element currently shows while the app runs, by element id. */
export type ElementValues = Record<string, string>;

export type LabTab = 'design' | 'code';

// Same screen size as App Lab.
export const screenWidth = 320;
export const screenHeight = 450;
