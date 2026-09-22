/**
 * Text and button sprites: the parts of an app screen that are not pictures.
 *
 * Each is an ordinary p5.play sprite with no costume and its own draw
 * function, so the stock machinery (click events, getSpriteArray by name,
 * destroy, set property) works on it unchanged. The name is how a student
 * refers to one: a button's name is its label, a text's name is the one the
 * block gives it. Showing a name that is already on screen changes that
 * sprite instead of adding a second, so a block that reruns (after each new
 * prediction, say) does not stack copies.
 */

/** The subset of a p5 instance these sprites draw with. */
export interface UiP5 {
  CENTER: string;
  BOLD: string;
  NORMAL: string;
  push(): void;
  pop(): void;
  fill(...color: (number | string)[]): void;
  noFill(): void;
  stroke(color: string): void;
  strokeWeight(weight: number): void;
  noStroke(): void;
  rect(x: number, y: number, w: number, h: number, radius?: number): void;
  rectMode(mode: string): void;
  text(text: string, x: number, y: number): void;
  textAlign(horizontal: string, vertical: string): void;
  textSize(size: number): void;
  textStyle(style: string): void;
  textWidth(text: string): number;
  mouseIsOver(sprite: UiSprite): boolean;
}

export type UiKind = 'text' | 'button';

export interface UiSprite {
  id?: number;
  name?: string;
  removed?: boolean;
  width: number;
  height: number;
  scale: number;
  baseScale?: number;
  position: {x: number; y: number};
  draw: () => void;
  setCollider: (kind: string) => void;
  getAnimationLabel: () => string;
  __slab2Ui?: UiKind;
}

export interface UiLibrary {
  p5: UiP5;
  addSprite(opts: {name?: string; location?: unknown}): number | null | void;
  getSpriteArray(spriteArg: unknown): UiSprite[];
  addEvent(
    type: string,
    args: unknown,
    callback: (args: unknown) => void
  ): void;
}

export type TextSize = 'title' | 'heading' | 'body' | 'small';

interface TextStyle {
  size: number;
  bold: boolean;
  /** Body text sits on a card; large text is outlined instead. */
  card: boolean;
}

export const TEXT_STYLES: Record<TextSize, TextStyle> = {
  title: {size: 36, bold: true, card: false},
  heading: {size: 24, bold: true, card: false},
  body: {size: 18, bold: false, card: true},
  small: {size: 14, bold: false, card: true},
};

export const BUTTON_COLORS: Record<string, string> = {
  green: '#2e7d32',
  blue: '#1565c0',
  orange: '#e65100',
  purple: '#6a1b9a',
  gray: '#455a64',
};

// The canvas is 400 wide; this leaves a margin at either edge of a
// centered paragraph, card included.
const MAX_TEXT_WIDTH = 340;
const LINE_HEIGHT = 1.25;
const CARD_PADDING = 10;
const TEXT_COLOR = '#1b1b1b';
const BUTTON_FONT = 18;
const BUTTON_PAD_X = 18;
const BUTTON_PAD_Y = 10;
const BUTTON_MIN_WIDTH = 100;

/**
 * Greedy word wrap. A word wider than the line gets a line of its own
 * rather than being split, so a long name stays readable.
 */
export function wrapLines(
  text: string,
  maxWidth: number,
  measure: (s: string) => number
): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split('\n')) {
    let line = '';
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const next = line ? `${line} ${word}` : word;
      if (line && measure(next) > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    }
    lines.push(line);
  }
  return lines;
}

/** A block's text value as the student means it: numbers too, never "undefined". */
export function displayText(value: unknown): string {
  return value === undefined || value === null ? '' : String(value);
}

function asLocation(value: unknown): {x: number; y: number} | undefined {
  const location =
    typeof value === 'function' ? (value as () => unknown)() : value;
  const {x, y} = (location || {}) as {x?: unknown; y?: unknown};
  return typeof x === 'number' && typeof y === 'number' ? {x, y} : undefined;
}

export function isUiSprite(sprite: UiSprite): boolean {
  return !!sprite.__slab2Ui;
}

/**
 * The sprite of this kind and name, moved to the location; made if absent.
 * A sprite of the other kind with this name is left alone: the new one takes
 * the name, as CoreLibrary's unique-name rule does for any sprite.
 */
function placeUiSprite(
  library: UiLibrary,
  kind: UiKind,
  name: string,
  location: unknown
): UiSprite | undefined {
  const at = asLocation(location) || {x: 200, y: 200};
  const existing = library
    .getSpriteArray({name})
    .find(sprite => sprite.__slab2Ui === kind && !sprite.removed);
  if (existing) {
    existing.position.x = at.x;
    existing.position.y = at.y;
    return existing;
  }
  const id = library.addSprite({name, location: at});
  if (id === undefined || id === null) {
    return undefined;
  }
  const sprite = library.getSpriteArray({id})[0];
  if (!sprite) {
    return undefined;
  }
  sprite.__slab2Ui = kind;
  // The scene's default sprite size scales pictures; text keeps its points.
  sprite.baseScale = 1;
  sprite.scale = 1;
  return sprite;
}

// The collider follows the drawn box, so a click lands where the student
// sees the button.
function setBox(sprite: UiSprite, width: number, height: number) {
  sprite.width = width;
  sprite.height = height;
  sprite.setCollider('rectangle');
}

export function createUiCommands(library: UiLibrary) {
  const p5 = library.p5;

  const measure = (style: TextStyle) => (s: string) => {
    p5.textSize(style.size);
    p5.textStyle(style.bold ? p5.BOLD : p5.NORMAL);
    return p5.textWidth(s);
  };

  return {
    showText(value: unknown, location: unknown, size: string, name: string) {
      const style = TEXT_STYLES[size as TextSize] || TEXT_STYLES.body;
      const label = displayText(name) || 'text';
      const sprite = placeUiSprite(library, 'text', label, location);
      if (!sprite) {
        return;
      }
      // Measuring sets the text style; the push keeps it from leaking into
      // whatever draws next.
      p5.push();
      const lines = wrapLines(
        displayText(value),
        MAX_TEXT_WIDTH,
        measure(style)
      );
      const widest = Math.max(1, ...lines.map(measure(style)));
      p5.pop();
      const lineHeight = style.size * LINE_HEIGHT;
      const pad = style.card ? CARD_PADDING : 0;
      const width = widest + 2 * pad;
      const height = lines.length * lineHeight + 2 * pad;
      setBox(sprite, width, height);
      sprite.draw = () => {
        p5.push();
        if (style.card && lines.some(Boolean)) {
          p5.rectMode(p5.CENTER);
          p5.noStroke();
          p5.fill(255, 255, 255, 220);
          p5.rect(0, 0, width, height, 10);
        }
        p5.textAlign(p5.CENTER, p5.CENTER);
        p5.textSize(style.size);
        p5.textStyle(style.bold ? p5.BOLD : p5.NORMAL);
        p5.fill(TEXT_COLOR);
        if (style.card) {
          p5.noStroke();
        } else {
          p5.stroke('white');
          p5.strokeWeight(Math.round(style.size / 8));
        }
        const top = -((lines.length - 1) * lineHeight) / 2;
        lines.forEach((line, i) => p5.text(line, 0, top + i * lineHeight));
        p5.pop();
      };
    },

    makeButton(label: string, location: unknown, color: string) {
      const text = displayText(label) || 'Button';
      const sprite = placeUiSprite(library, 'button', text, location);
      if (!sprite) {
        return;
      }
      const fill = BUTTON_COLORS[color] || BUTTON_COLORS.green;
      p5.push();
      p5.textSize(BUTTON_FONT);
      p5.textStyle(p5.BOLD);
      const width = Math.max(
        BUTTON_MIN_WIDTH,
        p5.textWidth(text) + 2 * BUTTON_PAD_X
      );
      p5.pop();
      const height = BUTTON_FONT + 2 * BUTTON_PAD_Y;
      setBox(sprite, width, height);
      sprite.draw = () => {
        p5.push();
        p5.rectMode(p5.CENTER);
        p5.noStroke();
        p5.fill(0, 0, 0, 50);
        p5.rect(0, 3, width, height, height / 2);
        p5.fill(fill);
        p5.rect(0, 0, width, height, height / 2);
        if (p5.mouseIsOver(sprite)) {
          p5.fill(255, 255, 255, 40);
          p5.rect(0, 0, width, height, height / 2);
        }
        p5.textAlign(p5.CENTER, p5.CENTER);
        p5.textSize(BUTTON_FONT);
        p5.textStyle(p5.BOLD);
        p5.fill('white');
        p5.text(text, 0, 0);
        p5.pop();
      };
    },

    whenButtonClicked(label: string, callback: () => void) {
      library.addEvent(
        'whenclick',
        {sprite: {name: displayText(label) || 'Button'}},
        () => callback()
      );
    },
  };
}
