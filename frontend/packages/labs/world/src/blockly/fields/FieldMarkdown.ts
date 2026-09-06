// Prose on a block, drawn as markdown.
//
// A rule's `note` says one line and says it as typed. This says a paragraph, a
// list, a heading — the documentation that lives in the codebase beside a rule
// and never made it into the workspace the learner reads. It changes nothing
// about what runs.
//
// HTML INSIDE SVG, which is the whole of the difficulty. A block is SVG and
// markdown is HTML, so the drawing goes in a `foreignObject` — the one place a
// browser will lay out HTML inside an SVG tree. Everything else here follows
// from that: the height of wrapped prose is not knowable until the browser has
// laid it out, and Blockly lays a block out from a size the field reports. So
// the field renders, MEASURES what the browser made of it, and only then tells
// Blockly how big it is (`forceRerender`).
//
// Built in two halves, exactly as `FieldBlockPreview` is and for the same
// reason: `initView` runs inside Blockly's focus handling, and mounting a React
// root there takes the toolbox down with it when a tab regains focus. The
// drawing comes on the next turn of the loop.

import * as Blockly from 'blockly/core';
import {createElement} from 'react';
import {flushSync} from 'react-dom';
import type {Root} from 'react-dom/client';
import {createRoot} from 'react-dom/client';

import {BlocklyMarkdown} from '@code-dot-org/blockly';

import styles from './fieldMarkdown.module.css';

/** How wide prose is allowed to get before it wraps, in workspace units. */
const WIDTH = 320;
/** Breathing room around the prose, so it is not against the block's edge. */
const PAD = 8;
/** What an empty note stands at until something is written in it. */
const EMPTY = 24;

type Opener = (field: FieldMarkdown) => void;

let opener: Opener | null = null;

/**
 * Who edits a note, or nobody.
 *
 * The same arrangement `bodyButton` and `lessonButton` use: a Blockly field has
 * no route to React state, so the editor installs itself while it is mounted.
 */
export function setMarkdownOpener(next: Opener | null): void {
  opener = next;
}

export class FieldMarkdown extends Blockly.Field<string> {
  override SERIALIZABLE = true;
  // The press opens a modal of our own, so Blockly's own editor is not wanted.
  override EDITABLE = false;

  private host: SVGForeignObjectElement | null = null;
  private body: HTMLDivElement | null = null;
  private root: Root | null = null;
  private overlay: SVGRectElement | null = null;
  /** The deferred first draw, so disposing before it lands cancels it. */
  private pending: ReturnType<typeof setTimeout> | null = null;
  /** What the browser made of the prose, in pixels. */
  private measured = EMPTY;

  constructor(value = '') {
    super(value);
  }

  /** What a saved note holds: the markdown, verbatim. */
  protected override doClassValidation_(value?: unknown): string {
    return typeof value === 'string' ? value : '';
  }

  override setValue(value: unknown): void {
    super.setValue(value);
    this.draw();
  }

  /**
   * The overlay first, the prose after.
   *
   * `super.initView()` is deliberately NOT called: it makes a border rect and a
   * text element this field has no use for, and the base rendering would then
   * measure them instead of the prose.
   */
  override initView(): void {
    if (!this.getSourceBlock()?.workspace || !this.fieldGroup_) {
      return;
    }
    this.host = Blockly.utils.dom.createSvgElement<SVGForeignObjectElement>(
      'foreignObject' as never,
      {x: PAD, y: PAD, width: WIDTH, height: EMPTY},
      this.fieldGroup_,
    );
    this.body = document.createElementNS(
      'http://www.w3.org/1999/xhtml',
      'div',
    ) as HTMLDivElement;
    this.body.setAttribute('class', styles.body);
    this.host.appendChild(this.body);

    // A transparent rectangle over the whole field takes the presses: the prose
    // is HTML and its own clicks would land on paragraphs and links rather than
    // on the block.
    this.overlay = Blockly.utils.dom.createSvgElement<SVGRectElement>(
      Blockly.utils.Svg.RECT,
      {fill: 'transparent', x: 0, y: 0, width: 0, height: 0},
      this.fieldGroup_,
    );
    Blockly.browserEvents.conditionalBind(
      this.overlay,
      'pointerdown',
      this,
      this.onPress,
    );
    this.pending = setTimeout(() => {
      this.pending = null;
      this.draw();
    }, 0);
  }

  /** Render the markdown, measure what the browser made of it, and re-lay out. */
  private draw(): void {
    if (!this.body || !this.host) {
      return;
    }
    this.root ??= createRoot(this.body);
    // SYNCHRONOUSLY, because the next line measures it. A concurrent render
    // would be measured before it existed, and the block would be laid out
    // around a note of no height.
    flushSync(() => {
      this.root?.render(
        createElement(BlocklyMarkdown, {content: this.getValue() ?? ''}),
      );
    });
    this.measured = Math.max(this.body.scrollHeight, EMPTY);
    this.host.setAttribute('height', String(this.measured));
    this.updateSize_();
    this.forceRerender();
  }

  /**
   * How big the block must be to hold the prose.
   *
   * OVERRIDDEN, and it has to be: the base measures the field's TEXT and
   * writes the answer over `size_`, so a size set anywhere else is gone by the
   * time Blockly lays the block out — which is how a page of documentation
   * came out thirty-four pixels tall.
   */
  protected override updateSize_(): void {
    this.size_ = new Blockly.utils.Size(
      WIDTH + PAD * 2,
      this.measured + PAD * 2,
    );
    this.overlay?.setAttribute('width', String(this.size_.width));
    this.overlay?.setAttribute('height', String(this.size_.height));
    this.isDirty_ = false;
  }

  /** A press anywhere on the prose opens the editor. */
  private onPress(event: PointerEvent): void {
    event.stopPropagation();
    // After the press, not during it: opening a modal while Blockly is still
    // inside its own gesture handling is what `bodyButton` defers for too.
    setTimeout(() => opener?.(this), 0);
  }

  /** What a screen reader is told, and what a collapsed block shows. */
  override getText(): string {
    const first = (this.getValue() ?? '').trim().split('\n')[0] ?? '';
    return first.replace(/^#+\s*/, '') || 'a note';
  }

  override dispose(): void {
    if (this.pending) {
      clearTimeout(this.pending);
      this.pending = null;
    }
    // Unmounted on a later turn: React refuses to unmount a root while it is
    // rendering, and a field can be disposed from inside one.
    const root = this.root;
    this.root = null;
    if (root) {
      setTimeout(() => root.unmount(), 0);
    }
    super.dispose();
  }
}
