import md5 from 'md5';
import RGBColor from 'rgbcolor';

import annotationList from '@cdo/apps/acemode/annotationList';
import {singleton as studioApp} from '@cdo/apps/StudioApp';
import {border_gray} from '@cdo/apps/util/color';
import {interpolateColors} from '@cdo/apps/utils';

/**
 * Represents an implementation of an editing environment and wraps functionality
 * to annotate (highlight, add feedback, etc) the components in the editing
 * workspace.
 */
export class Annotator {
  /**
   * Constructs the annotator implementation. Generally, this will only be
   * constructed once, as needed, by the EditorAnnotator class.
   */
  constructor() {
    if (new.target === Annotator) {
      throw new TypeError('Cannot construct Annotator instances directly.');
    }

    this.patch();
  }

  __embedStyle(className, stylesheet) {
    this.embeddedStyles_ ||= {};
    if (!this.embeddedStyles_[className]) {
      this.embeddedStyles_[className] = true;
      const range = document.createRange();
      const fragment = range.createContextualFragment(stylesheet);
      document.querySelector('head').append(fragment);
    }
  }

  /**
   * A simple name to identify the type of editor that this implementation
   * targets.
   *
   * @returns {string} The simple name of the underlying editor environment.
   */
  static libraryName() {
    return 'unknown';
  }

  /**
   * A function that detects that the current editor context is to be controlled
   * by this annotator. When this returns `true`, it should use this
   * implementation in order to provide annotation functions.
   *
   * @returns {bool} When true, this has detected a compatible editor in use.
   */
  static detect() {
    return false;
  }

  /**
   * Performs any patching of the underlying editor library, if needed.
   */
  patch() {}

  /**
   * Whether or not the current editing context has a line-based editor.
   *
   * It may have blocks in the case of Droplet, but it is primarily line-based
   * in that blocks occupy lines and can be referenced by line number.
   *
   * @returns {bool} Returns true when the editor is line based.
   */
  isLineBased() {
    return false;
  }

  /**
   * Whether or not the current editing context has block-based editing.
   *
   * It may or not be still line-based.
   */
  hasBlocks() {
    return false;
  }

  /**
   * Whether or not the current editing context has a block-based editor and no
   * concept of lines. This would be a Blockly-based level.
   *
   * @returns {bool} Returns true when the editor is block based.
   */
  isBlockBased() {
    return false;
  }

  /**
   * Returns the number of lines of code in line-based editor context.
   *
   * @returns {number} The number of lines or -1 when it is not line-based.
   */
  getLineCount() {
    return -1;
  }

  /**
   * Returns the string representation of any generated code.
   *
   * @returns {string} The code contained in the current editor context.
   */
  getCode() {
    return '';
  }

  /**
   * Gets a reference to the DropletBlock for the given line.
   *
   * If there is no block for that line it returns `null`.
   *
   * @param {number} lineNumber - The one-based line number.
   * @returns {DropletBlock|null} A reference to the block or `null` if it doesn't exist.
   */
  getBlockForLine(lineNumber) {
    return null;
  }

  /**
   * Gets a reference to every block for a given line.
   *
   * @param {number} lineNumber - The one-based line number.
   * @returns {Array} A list of references to blocks, empty if none exist.
   */
  getBlocksForLine(lineNumber) {
    return [];
  }

  /**
   * Dims all the blocks in the block view.
   *
   * @param {DropletBlock} block The block to dim.
   */
  dimBlock(block) {}

  /**
   * Reverse any dimmed blocks to their original state.
   *
   * @param {DropletBlock} block The block to undim.
   */
  undimBlock(block) {}

  /**
   * Highlights the given line in the active editor.
   *
   * It will return some metadata that can be used in the call to
   * `unhighlightLine` to reverse this effect.
   *
   * @param {number} lineNumber The line number to highlight in the active editor.
   * @param {string} color The color to use when highlighting this line.
   * @returns {Object} The metadata retaining the Ace Editor marker instance.
   */
  highlightLine(lineNumber, color) {
    return {};
  }

  /**
   * Unhighlights a previously highlighted line.
   *
   * The incoming `info` metadata is just the information returned by the prior
   * call to `highlightLine`.
   *
   * @param {Object} info The metadata about the highlighted line.
   */
  unhighlightLine(info) {}

  /**
   * Add a line of feedback to the editor.
   *
   * @param {number} lineNumber The line number (1-based index)
   * @param {string} message The text to display next to the line.
   * @param {string} logLevel The type of annotation ('ERROR', 'INFO', etc)
   * @param {string} color The color to use, if possible, to accent the annotation (or none).
   * @param {string} icon The icon image to use which will override a default, if any.
   * @param {Object} tipStyle A set of CSS properties that might be applied to any related tooltip.
   */
  annotateLine(
    lineNumber,
    message,
    logLevel = 'INFO',
    color = null,
    icon = null,
    tipStyle = {},
    hoverCallback = null
  ) {}

  /**
   * Removes annotations of a particular type.
   *
   * @param {string} logLevel The type of annotation to clear ('ERROR', 'INFO', etc)
   */
  clearAnnotations(logLevel = 'INFO') {}

  /**
   * Makes the given line visible on the screen, if in a line-based editor.
   *
   * @param {number} lineNumber The line to scroll to where 1 is the first line.
   */
  scrollToLine(lineNumber) {}
}

/**
 * This is an annotation implementation for Droplet environments.
 *
 * Droplet has blocks that directly represent lines of code. As such, it offers
 * capabilities that are mostly line-based. It can retrieve references, however,
 * to blocks based on the line number.
 */
export class DropletAnnotator extends Annotator {
  static libraryName() {
    return 'droplet';
  }

  static detect() {
    return !!EditorAnnotator.studioApp().editor;
  }

  /**
   * Updates the editor context with the remembered highlights and annotations.
   */
  refresh() {
    EditorAnnotator.dimBlocks();

    EditorAnnotator.highlightedLines.forEach(item => {
      const block = this.getBlockForLine(item.lineNumber);
      if (block) {
        this.undimBlock(block);
      }
    });
  }

  patch() {
    const droplet = this.droplet();

    // Need a reference to a BlockViewNode so that we can patch its draw
    // function to add the opacity after it creates the <path> for each block.
    const block = this.getBlockForLine(1);

    // This will be our patched draw function
    const drawSelf = function () {
      // Call the original function... droplet will have a valid <path> after
      // this is through.
      this.drawSelf_(arguments);

      // If that <path> element exists (that is representing the block),
      // set the opacity of its parent <g> that groups all the block elements
      // to the set value. See: `EditorAnnotator.dimBlock`, etc.
      if (this.path.element && this.path.element.parentNode) {
        this.path.element.style.opacity = this.__opacity || 1.0;

        // Also do this to the additional button paths
        if (this.addButtonPath && this.addButtonPath.element) {
          this.addButtonPath.element.style.opacity = this.__opacity || 1.0;
        }

        // And "active paths" which are '<-' buttons and such
        if (this.activeElements) {
          this.activeElements.forEach(item => {
            if (item.element) {
              item.element.style.opacity = this.__opacity || 1.0;
            }
          });
        }
      }
    };

    if (block) {
      // Get the view. If the block mode is not available, this will return a
      // null value. We would have to patch it when the blocks appear.
      const view = droplet.session.view.getViewNodeFor(block);

      // Patch View.drawSelf(...) to apply an opacity to the block when it
      // appears on the screen.
      if (view && !view.constructor.prototype.drawSelf_) {
        view.constructor.prototype.drawSelf_ = view.__proto__.drawSelf;
        view.constructor.prototype.drawSelf = drawSelf;
      }
    }

    const statechange = e => {
      // Ensure the block draw is still patched
      const block = this.getBlockForLine(1);
      if (block) {
        const view = droplet.session.view.getViewNodeFor(block);
        if (view && !view.constructor.prototype.drawSelf_) {
          view.constructor.prototype.drawSelf_ = view.__proto__.drawSelf;
          view.constructor.prototype.drawSelf = drawSelf;
        }
      }

      this.refresh();
    };

    // Capture toggle event start / end
    droplet.on('statechange', statechange);
    droplet.on('toggledone', statechange);
  }

  /**
   * Whether or not the current editing context has a line-based editor.
   *
   * It may have blocks in the case of Droplet, but it is primarily line-based
   * in that blocks occupy lines and can be referenced by line number.
   *
   * @returns {bool} Returns true when the editor is line based.
   */
  isLineBased() {
    // Detect Droplet editor instance, but in the future we need to detect
    // a JavaLab environment that is using CodeMirror.
    return true;
  }

  /**
   * Whether or not the current editing context has block-based editing.
   *
   * It may or not be still line-based.
   */
  hasBlocks() {
    return true;
  }

  /**
   * Whether or not the current editing context has a block-based editor and no
   * concept of lines. This would be a Blockly-based level.
   *
   * @returns {bool} Returns true when the editor is block based.
   */
  isBlockBased() {
    // The only block-based context we have is Blockly, which StudioApp already
    // detects.
    return false;
  }

  /**
   * Returns a reference to the Droplet editing context.
   */
  droplet() {
    return EditorAnnotator.studioApp().editor;
  }

  /**
   * Returns the number of lines of code in line-based editor context.
   *
   * @returns {number} The number of lines or -1 when it is not line-based.
   */
  getLineCount() {
    const aceSession = this.droplet().aceEditor.getSession();
    return aceSession.getDocument().getLength();
  }

  /**
   * Returns the string representation of any generated code.
   *
   * @returns {string} The code contained in the current editor context.
   */
  getCode() {
    return this.droplet().getValue();
  }

  /**
   * Gets a reference to the DropletBlock for the given line.
   *
   * If there is no block for that line it returns `null`.
   *
   * @param {number} lineNumber - The one-based line number.
   * @returns {DropletBlock|null} A reference to the block or `null` if it doesn't exist.
   */
  getBlockForLine(lineNumber) {
    const session = this.droplet().session;
    return session.tree.getBlockOnLine(lineNumber - 1);
  }

  /**
   * Gets a reference to every block for a given line.
   *
   * @param {number} lineNumber - The one-based line number.
   * @returns {Array} A list of references to blocks, empty if none exist.
   */
  getBlocksForLine(lineNumber) {
    let ret = [];

    // Get the first block
    const base = this.getBlockForLine(lineNumber);
    if (base) {
      // Get all blocks for this line by scanning for a newline block
      let cur = base.start;
      while (cur) {
        if (cur.type === 'newline') {
          break;
        } else if (cur.type === 'blockStart') {
          ret.push(cur.container);
        }
        cur = cur.next;
      }
    }

    return ret;
  }

  /**
   * Dims all the blocks in the block view.
   *
   * @param {DropletBlock} block The block to dim.
   */
  dimBlock(block) {
    const droplet = this.droplet();
    const dimViewForBlock = block => {
      const view = droplet.session.view.getViewNodeFor(block);
      if (!view) {
        return;
      }

      // If we already dimmed this block, ignore
      if (view.__oldFill) {
        return;
      }

      // Get a grayer color for the block
      view.__oldFill = view.path.style.fillColor;
      const rgb = interpolateColors(view.__oldFill, '#ccc', 0.8);

      // But it needs to be in hex form
      const color = new RGBColor(rgb);
      view.path.style.fillColor = color.toHex();
      view.__opacity = 0.7;

      // Redraw the block
      view.drawSelf();
    };

    // Dim the base block for this line
    dimViewForBlock(block);
  }

  /**
   * Reverse any dimmed blocks to their original state.
   *
   * @param {DropletBlock} block The block to undim.
   */
  undimBlock(block) {
    const droplet = this.droplet();
    const view = droplet.session.view.getViewNodeFor(block);
    if (!view) {
      return;
    }

    // If we didn't dim this block, ignore
    if (!view.__oldFill) {
      return;
    }

    // Set the fillColor to its original value
    view.path.style.fillColor = view.__oldFill;
    view.__opacity = 1.0;
    view.__oldFill = undefined;

    // Redraw the block
    view.drawSelf();
  }

  /**
   * Highlights the given line in the active editor.
   *
   * It will return some metadata that can be used in the call to
   * `unhighlightLine` to reverse this effect.
   *
   * @param {number} lineNumber The line number to highlight in the active editor.
   * @param {string} color The CSS color to use when highlighting this line.
   * @returns {Object} The metadata retaining the Ace Editor marker instance.
   */
  highlightLine(lineNumber, color) {
    const droplet = this.droplet();
    const session = droplet.aceEditor.getSession();

    // Create the highlighted line's style to apply the color
    const colorHash = md5(color);
    const highlightClass = `editor-annotator-highlight-line-${colorHash}`;
    // Not too ideal. This styling ensures it exists for the particular class
    // since adding a class is all we can do. We want this function to be abstract
    // from the point of view of the caller to what editor technology is being used.
    // Therefore, we just ask for a color and then have to inject the styling once
    // per color to the page's <head>.
    const stylesheet = `
      <style>
        .ace_editor .ace_marker-layer .ace_step.${highlightClass} {
          background: ${color};
        }
      </style>
    `;
    this.__embedStyle(highlightClass, stylesheet);

    const marker = session.addMarker(
      new (window.ace.require('ace/range').Range)(
        lineNumber - 1,
        0,
        lineNumber - 1,
        session.getLine(lineNumber - 1).length
      ),
      `ace_step ${highlightClass}`,
      'text'
    );

    // Retain info on what we just did
    return {
      lineNumber: lineNumber,
      marker: marker,
    };
  }

  /**
   * Unhighlights a previously highlighted line.
   *
   * The incoming `info` metadata is just the information returned by the prior
   * call to `highlightLine`.
   *
   * @param {Object} info The metadata about the highlighted line.
   */
  unhighlightLine(info) {
    // Get the session and undo the things we did
    const aceSession = this.droplet().aceEditor.getSession();
    aceSession.removeMarker(info.marker);
  }

  /**
   * Retrieves an annotationList and ensures it is attached to the known
   * editor session.
   */
  annotationList_() {
    const droplet = this.droplet();
    const aceSession = this.droplet().aceEditor.getSession();
    annotationList.attachToSession(aceSession, droplet);
    return annotationList;
  }

  /**
   * Add a line of feedback to the editor.
   *
   * @param {number} lineNumber The line number (1-based index)
   * @param {string} message The text to display next to the line.
   * @param {string} logLevel The type of annotation ('ERROR', 'INFO', etc)
   * @param {string} color The color to use, if possible, to accent the annotation (or none).
   * @param {string} icon The icon image to use which will override a default, if any.
   * @param {Object} tipStyle A set of CSS properties that might be applied to any related tooltip.
   */
  annotateLine(
    lineNumber,
    message,
    logLevel = 'INFO',
    color = null,
    icon = null,
    tipStyle = {},
    hoverCallback = null
  ) {
    const hash = md5((color || '') + (icon || ''));
    if (color || icon) {
      // Create the annotated gutter icon's style to apply the color
      const highlightClass = `editor-annotator-gutter-cell-${hash}`;
      if (icon) {
        icon = `url(${icon})`;
      }
      const background = icon && color ? `${icon}, ${color}` : icon || color;
      // Not too ideal. This is noted in 'highlightLine' as well, but the gist is that
      // the icon is not easy to override, so we can just cover it up with our
      // provided one. The tooltip is also difficult to style since we would want to
      // style different annotations in unique ways, but also because tooltips are
      // created and destroyed more or less on demand. They are then styled by Ace
      // Editor via direct styles so the specificity is high. So we add generic
      // properties here and then also override others when we see the page add the
      // tooltip to the screen.
      // The point of the Annotator is to abstract this behavior from the
      // variety of editing environments that we have. So this requieres a bit
      // of dirty hacks like these.
      const stylesheet = `
        <style>
          .ace_editor .ace_gutter-layer .ace_gutter-cell.ace_info {
            position: relative;
          }

          .ace_editor .ace_gutter-layer .ace_gutter-cell.ace_info::before {
            content: '';
            width: 15px;
            height: 15px;
            position: absolute;
            left: 3px;
            top: 1px;
            background: ${background};
            background-position: center;
            background-size: 9px;
            background-repeat: no-repeat;
            border-radius: 50%;
            border: 1px solid ${border_gray};
            box-sizing: border-box;
          }

          .ace_editor .ace_tooltip.editor-annotator-tooltip-${hash} {
            max-width: 65%;
            white-space: normal;
          }
        </style>
      `;
      this.__embedStyle(highlightClass, stylesheet);
    }
    this.knownAnnotations_ ||= [];
    this.knownAnnotations_.push({
      level: logLevel,
      line: lineNumber,
      message: message,
      hash: hash,
      tipStyle: tipStyle,
      hoverCallback: hoverCallback,
    });
    this.annotationList_().addRuntimeAnnotation(logLevel, lineNumber, message);

    // The problem is that there is no easy way to style the tooltips individually.
    // So, we have to set up an observer to do it. This will ping a callback
    // function whenever a new element is added to the editor and we can check
    // against it. (For a thorough reasoning why, see the comment above near the
    // stylesheet logic.)

    // Patch in this observer to spot the creation of the tooltip so we can
    // append the class to it. We do that by matching its inner text with the
    // requested annotation message and then add the styling class.
    const aceElement = this.droplet().aceEditor.container;
    if (!this.tooltipObserver_ && aceElement) {
      // We set up an observer to tell us when an element is added
      const config = {childList: true};

      // Callback function to execute when mutations are observed
      const callback = (mutationList, observer) => {
        for (const mutation of mutationList) {
          // We only care when a new child is added
          if (mutation.type !== 'childList') {
            continue;
          }

          for (const el of mutation.addedNodes) {
            if (el.classList && el.classList.contains('ace_tooltip')) {
              // See if it is one of our known annotations
              for (const annotation of this.knownAnnotations_) {
                if (el.textContent.trim() === annotation.message.trim()) {
                  const annotationClass = `editor-annotator-tooltip-${annotation.hash}`;
                  el.classList.add(annotationClass);
                  if (annotation.hoverCallback) {
                    annotation.hoverCallback(annotation);
                  }
                  Object.keys(annotation.tipStyle || {}).forEach(k => {
                    el.style[k] = annotation.tipStyle[k];
                  });
                }
              }
            }
          }
        }
      };

      // Create an observer instance linked to the callback function
      const observer = new MutationObserver(callback);

      // Start observing the editor for any new children
      observer.observe(aceElement, config);
      this.tooltipObserver_ = observer;
    }
  }

  /**
   * Removes annotations of a particular type.
   *
   * @param {string} logLevel The type of annotation to clear ('ERROR', 'INFO', etc)
   */
  clearAnnotations(logLevel = 'INFO') {
    this.knownAnnotations_ = [];
    this.annotationList_().filterOutRuntimeAnnotations(logLevel);
  }

  /**
   * Makes the given line visible on the screen, if in a line-based editor.
   *
   * @param {number} lineNumber The line to scroll to where 1 is the first line.
   */
  scrollToLine(lineNumber) {
    const aceEditor = this.droplet().aceEditor;
    aceEditor.scrollToLine(lineNumber, true, true);
  }
}

/**
 * Extends the StudioApp to provide means of annotating and highlighting editor
 * lines.
 */
export default class EditorAnnotator {
  // Internally holds a reference to the StudioApp
  static studioApp_ = undefined;

  // Internally remember the current annotator implementation
  static annotator_ = undefined;

  // Internally caches the editor code and the code split into lines.
  static code_ = undefined;
  static lines_ = undefined;

  // Internally caches code stripped of comments, similarly.
  static strippedCode_ = undefined;
  static strippedLines_ = undefined;

  // Internally tracking annotator implementations
  static annotatorsByType_ = {};

  /**
   * Tracks any highlighted lines.
   *
   * Each item in this list is a description of the highlight and contains a
   * field for the `lineNumber` and a field for the `marker` which is of a
   * type required for whatever the underlying editor context would be. (e.g.
   * a 'ace/layer/marker' for AceEditor.
   */
  static highlightedLines = [];

  /**
   * Returns an instance of the singleton `StudioApp` for the current level.
   */
  static studioApp() {
    // Retain StudioApp instance.
    if (EditorAnnotator.studioApp_) {
      return EditorAnnotator.studioApp_;
    }
    EditorAnnotator.studioApp_ = studioApp();

    return EditorAnnotator.studioApp_;
  }

  /**
   * Registers an editor type.
   *
   * @param {typeof Annotator} annotatorClass The implementing class of an annotator.
   */
  static register(annotatorClass) {
    EditorAnnotator.annotatorsByType_[annotatorClass.libraryName()] =
      annotatorClass;
  }

  /**
   * Returns the class implementing the annotation logic for the active
   * editor type.
   */
  static annotator() {
    if (!EditorAnnotator.annotator_) {
      // Go through registered annotators to find one that is currently active.
      for (const name of Object.keys(EditorAnnotator.annotatorsByType_)) {
        const annotatorClass = EditorAnnotator.annotatorsByType_[name];
        if (annotatorClass.detect()) {
          EditorAnnotator.annotator_ = new annotatorClass();
        }
      }
    }

    return EditorAnnotator.annotator_;
  }

  /**
   * Whether or not the current editing context has a line-based editor.
   *
   * It may have blocks in the case of Droplet, but it is primarily line-based
   * in that blocks occupy lines and can be referenced by line number.
   *
   * @returns {bool} Returns true when the editor is line based.
   */
  static isLineBased() {
    return EditorAnnotator.annotator()?.isLineBased() || false;
  }

  /**
   * Whether or not the current editing context has block-based editing.
   *
   * It may or not be still line-based.
   */
  static hasBlocks() {
    return EditorAnnotator.annotator()?.hasBlocks() || false;
  }

  /**
   * Whether or not the current editing context has a block-based editor and no
   * concept of lines. This would be a Blockly-based level.
   *
   * @returns {bool} Returns true when the editor is block based.
   */
  static isBlockBased() {
    return EditorAnnotator.annotator()?.isBlockBased() || false;
  }

  static anonymizeCode_(code) {
    // Replace comments with whitespace. Our AI does not see the comments.
    // So, we must replace them with whitespace so we can find the right
    // code to reference.

    // This regex pattern captures three groups:
    // 1) Single or double quoted strings
    // 2) Multi-line comments
    // 3) Single-line comments
    const pattern = /(".*?[^\\]"|\'.*?[^\\]\'|\/\*.*?\*\/|\/\/[^\n]*)/gs;
    for (const submatch of code.matchAll(pattern)) {
      const context = submatch[0].trim();
      if (!context.startsWith('"') && !context.startsWith("'")) {
        code = code.replace(context, context.replace(/[^\n]/g, ' '));
      }
    }

    return code;
  }

  /**
   * Returns the editor code.
   *
   * Optionally, this can patch out C-Style comments with whitespace by setting
   * the 'stripComments' option.
   *
   * @returns {string} The code contained in the current editor context.
   */
  static getCode(options = {}) {
    // Return any cached result
    if (options.stripComments) {
      if (EditorAnnotator.strippedCode_) {
        return EditorAnnotator.strippedCode_;
      }
    } else if (EditorAnnotator.code_) {
      return EditorAnnotator.code_;
    }

    let code = EditorAnnotator.annotator().getCode();
    EditorAnnotator.code_ = code;

    if (options.stripComments) {
      code = EditorAnnotator.anonymizeCode_(code);
      EditorAnnotator.strippedCode_ = code;
    }

    return code;
  }

  /**
   * Returns an array of strings consisting of the lines of code.
   */
  static getLines(options = {}) {
    // Return any cached result
    if (options.stripComments) {
      if (EditorAnnotator.strippedLines_) {
        return EditorAnnotator.strippedLines_;
      }

      EditorAnnotator.strippedLines_ =
        EditorAnnotator.getCode(options).split('\n');
    } else if (EditorAnnotator.lines_) {
      return EditorAnnotator.lines_;
    }

    EditorAnnotator.lines_ = EditorAnnotator.getCode(options).split('\n');
    return EditorAnnotator.lines_;
  }

  /**
   * Finds the given code snippet and returns the lines it appears on.
   *
   * When the snippet is not found, or something is invalid about the snippet,
   * the result will be an empty Object.
   *
   * A snippet that is just whitespace will also return an empty Object.
   *
   * A found result will return a value that has a `firstLine` and `lastLine`
   * field containing numbers indicating those lines within the editor context
   * where the snippet appears. The lines are one-based where 1 would indicate
   * the first line of code.
   *
   * @param {string} snippet - The code to look for.
   * @param {Object} options - The possible options.
   *
   * @returns {Object} A description of the position of the snippet.
   */
  static findCodeRegion(snippet, options = {}) {
    let ret = {};

    // Do not allow matching against whitespace
    if (snippet.trim() === '') {
      return ret;
    }

    // Get the code
    let code = EditorAnnotator.getCode(options);
    let lines = EditorAnnotator.getLines(options);

    // Attempt to just find the code in the full code listing
    let index = code.indexOf(snippet);
    let lastIndex = index + snippet.length;
    if (index < 0) {
      // Failing to find it, we need to find it line by line instead
      let context = snippet;
      let position = 0;
      for (let line of lines) {
        // Remember the original length of the line
        let lineLength = line.length;
        line = line.trim();
        if (line !== '') {
          if (context.startsWith(line)) {
            if (index < 0) {
              // Remember the first position in the original code that
              // the AI references.
              index = position;
            }
            // Remember the last position in the original code.
            lastIndex = position + lineLength;
            context = context.substring(line.length + 1).trim();
            if (context === '') {
              // All of the code was found
              break;
            }
          } else {
            // We didn't match it. Reset our search.
            context = snippet;
            index = -1;
          }
        }

        // Move the current search position
        position += lineLength + 1;
      }
    }

    // As long as we found a region, we will determine what the line
    // number was for the first and last line of the region.
    if (index < 0) {
      return ret;
    }

    let lineNumber = (code.substring(0, index).match(/\n/g) || []).length + 1;
    let lastLineNumber =
      (code.substring(0, lastIndex).match(/\n/g) || []).length + 1;

    ret.firstLine = lineNumber;
    ret.lastLine = lastLineNumber;
    return ret;
  }

  /**
   * Returns the number of lines of code in line-based editor context.
   *
   * @returns {number} The number of lines or -1 when it is not line-based.
   */
  static getLineCount() {
    if (!EditorAnnotator.isLineBased()) {
      return -1;
    }

    // For Droplet, read the info from the AceEditor itself
    return EditorAnnotator.annotator()?.getLineCount() || -1;
  }

  /**
   * Dims all the blocks in the block view.
   */
  static dimBlocks() {
    if (EditorAnnotator.hasBlocks() && EditorAnnotator.isLineBased()) {
      const lineCount = EditorAnnotator.getLineCount();
      for (let i = 1; i <= lineCount; i++) {
        const blocks = EditorAnnotator.getBlocksForLine(i);
        for (const block of blocks) {
          EditorAnnotator.dimBlock(block);
        }
      }
    }
  }

  /**
   * Dims the given block.
   *
   * The block should be of the type expected by the underlying block library,
   * such as Droplet.
   *
   * You can get a block from `getBlockForLine`.
   */
  static dimBlock(block) {
    if (!block) {
      return;
    }

    return EditorAnnotator.annotator()?.dimBlock(block);
  }

  /**
   * Reverse any dimmed blocks to their original state.
   */
  static undimBlocks() {
    if (EditorAnnotator.hasBlocks() && EditorAnnotator.isLineBased()) {
      const lineCount = EditorAnnotator.getLineCount();
      for (let i = 1; i <= lineCount; i++) {
        const block = EditorAnnotator.getBlockForLine(i);
        EditorAnnotator.undimBlock(block);
      }
    }
  }

  /**
   * Reverse a dimmed block to its original state.
   *
   * The block should be of the type expected by the underlying block library,
   * such as Droplet.
   *
   * You can get a block from `getBlockForLine`.
   */
  static undimBlock(block) {
    if (!block) {
      return;
    }

    return EditorAnnotator.annotator()?.undimBlock(block);
  }

  /**
   * Gets a reference to the Block for the given line in a line-based editor
   * that also has blocks.
   *
   * If there is no block for that line or the editor does not have blocks,
   * it returns `null`.
   *
   * @param {number} lineNumber - The one-based line number.
   * @returns {Object|null} A reference to the block or `null` if it doesn't exist.
   */
  static getBlockForLine(lineNumber) {
    if (EditorAnnotator.hasBlocks() && EditorAnnotator.isLineBased()) {
      return EditorAnnotator.annotator()?.getBlockForLine(lineNumber);
    }

    return null;
  }

  /**
   * Gets a reference to every block for a given line in a line-based editor
   * that also has blocks.
   *
   * @param {number} lineNumber - The one-based line number.
   * @returns {Array} A list of references to blocks, empty if none exist.
   */
  static getBlocksForLine(lineNumber) {
    let ret = [];

    if (EditorAnnotator.hasBlocks() && EditorAnnotator.isLineBased()) {
      ret = EditorAnnotator.annotator()?.getBlocksForLine(lineNumber) || [];
    }

    return ret;
  }

  /**
   * Highlights the given line in the active editor.
   *
   * @param {number} lineNumber The line number to highlight in the active editor.
   * @param {string} color - The color to use when highlighting this line.
   */
  static highlightLine(lineNumber, color = '#ff0') {
    const info = EditorAnnotator.annotator()?.highlightLine(lineNumber, color);

    // If there are blocks... highlight line will highlight the blocks for that
    // line to properly emphasize them.
    if (EditorAnnotator.hasBlocks()) {
      // So, before we commit the line, if this is the first highlight, dim all
      // blocks. That way, the 'highlighted lines' being undimmed are emphasized.
      if (EditorAnnotator.highlightedLines.length === 0) {
        // Dim all blocks
        EditorAnnotator.dimBlocks();
      }

      // Then undim this line
      const blocks = EditorAnnotator.getBlocksForLine(lineNumber);
      for (const block of blocks) {
        EditorAnnotator.undimBlock(block);
      }
    }

    // Remember the line we highlighted
    if (info) {
      EditorAnnotator.highlightedLines.push(info);
    }
  }

  /**
   * Clears any lines highlighted by highlightLine.
   */
  static clearHighlightedLines() {
    // Unhighlight each highlighted line in the list and clear the list
    EditorAnnotator.highlightedLines.forEach(item => {
      EditorAnnotator.annotator().unhighlightLine(item);
    });
    EditorAnnotator.highlightedLines = [];

    // Undim the blocks
    if (EditorAnnotator.hasBlocks()) {
      EditorAnnotator.undimBlocks();
    }
  }

  /**
   * Add a line of feedback to the editor.
   *
   * @param {number} lineNumber The line number (1-based index)
   * @param {string} message The text to display next to the line.
   * @param {string} logLevel The type of annotation ('ERROR', 'INFO', etc)
   * @param {string} color The color to use, if possible, to accent the annotation (or none).
   * @param {string} icon The icon image to use which will override a default, if any.
   * @param {Object} tipStyle A set of CSS properties that might be applied to any related tooltip.
   */
  static annotateLine(
    lineNumber,
    message,
    logLevel = 'INFO',
    color = null,
    icon = null,
    tipStyle = {},
    hoverCallback = null
  ) {
    EditorAnnotator.annotator()?.annotateLine(
      lineNumber,
      message,
      logLevel,
      color,
      icon,
      tipStyle
    );
  }

  /**
   * Removes annotations of a particular type.
   */
  static clearAnnotations(logLevel = 'INFO') {
    EditorAnnotator.annotator()?.clearAnnotations(logLevel);
  }

  /**
   * Makes the given line visible on the screen, if in a line-based editor.
   *
   * @param {number} lineNumber The line to scroll to where 1 is the first line.
   */
  static scrollToLine(lineNumber) {
    EditorAnnotator.annotator()?.scrollToLine(lineNumber);
  }
}

if (IN_UNIT_TEST) {
  /**
   * Resets state.
   */
  EditorAnnotator.reset = function () {
    EditorAnnotator.studioApp_ = undefined;
    EditorAnnotator.annotator_ = undefined;
    EditorAnnotator.code_ = undefined;
    EditorAnnotator.lines_ = undefined;
    EditorAnnotator.strippedCode_ = undefined;
    EditorAnnotator.strippedLines_ = undefined;
    EditorAnnotator.highlightedLines = [];
    document.head.querySelectorAll('style').forEach(el => el.remove());
  };
}

EditorAnnotator.register(DropletAnnotator);
