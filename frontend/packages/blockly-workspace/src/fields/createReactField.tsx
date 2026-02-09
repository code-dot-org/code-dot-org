/**
 * Factory for creating Blockly fields backed by React components.
 *
 * This abstraction handles all the boilerplate of integrating React with Blockly fields:
 * - React root lifecycle management (create, render, unmount)
 * - Theme detection and propagation
 * - Dropdown/editor setup and positioning
 * - Value serialization/deserialization
 * - SVG preview rendering
 *
 * @example
 * ```tsx
 * const tuneFieldPlugin = createReactField({
 *   name: 'field_tune',
 *   defaultValue: { notes: [], instrument: 'piano' },
 *
 *   Editor: ({ value, onChange }) => (
 *     <InstrumentGrid
 *       initialValue={value}
 *       onChange={onChange}
 *     />
 *   ),
 *
 *   // Optional: SVG preview on block
 *   renderPreview: ({ value, element, width, height }) => {
 *     // Draw SVG elements to `element`
 *   },
 *
 *   // Optional: Display text
 *   getText: (value) => `${value.instrument} (${value.notes.length} notes)`,
 * });
 * ```
 */

import type {Root} from 'react-dom/client';
import {createRoot} from 'react-dom/client';

import * as Blockly from 'blockly/core';

import {PluginType} from '../plugins';
import type {FieldPlugin} from '../plugins';

import {
  getCSSVariable,
  getWorkspaceTheme,
  defaultDropdownStyles,
} from './utils';

/**
 * Props passed to the Editor component.
 */
export interface ReactFieldEditorProps<T> {
  /** The current field value. This is a deep copy, safe to mutate. */
  value: T;
  /** Callback to update the field value. */
  onChange: (value: T) => void;
  /** Close the dropdown editor. */
  onClose: () => void;
  /** Force the editor to re-render with fresh state. */
  onRefresh: () => void;
  /** The Blockly field instance, for advanced use cases. */
  field: Blockly.Field;
  /** The source block, if available. */
  sourceBlock: Blockly.BlockSvg | null;
}

/**
 * Context passed to the renderPreview function.
 */
export interface ReactFieldPreviewContext<T> {
  /** The current field value. */
  value: T;
  /** The SVG group element to render into. */
  element: SVGGElement;
  /** The available width for the preview. */
  width: number;
  /** The available height for the preview. */
  height: number;
  /** The source block, for accessing styles. */
  sourceBlock: Blockly.BlockSvg | null;
  /** Blockly's rendering constants for text measurement. */
  constants: Blockly.blockRendering.ConstantProvider | null;
}

/**
 * Size returned by getSize callback.
 */
export interface FieldSize {
  width: number;
  height: number;
}

/**
 * Context passed to getSize for dynamic sizing.
 */
export interface FieldSizeContext<T> {
  /** The current field value. */
  value: T;
  /** Blockly's rendering constants for text measurement. */
  constants: Blockly.blockRendering.ConstantProvider | null;
  /** The SVG text element for measurement (if getText is provided). */
  textElement: SVGTextElement | null;
}

/**
 * Configuration for creating a React-based Blockly field.
 */
export interface ReactFieldConfig<T> {
  /** The field name used in block definitions (e.g., 'field_tune'). */
  name: string;

  /** The default value for new instances of this field. */
  defaultValue: T;

  /**
   * The React component to render in the dropdown editor.
   * Receives the current value and an onChange callback.
   */
  Editor: React.ComponentType<ReactFieldEditorProps<T>>;

  /**
   * Optional function to render an SVG preview on the block.
   * If not provided, the default Blockly text rendering is used.
   */
  renderPreview?: (context: ReactFieldPreviewContext<T>) => void;

  /**
   * Optional function to get display text for the field.
   * Shown when the editor is closed.
   */
  getText?: (value: T) => string;

  /**
   * Optional custom serialization for saving state.
   * Defaults to returning the value as-is.
   */
  saveState?: (value: T) => unknown;

  /**
   * Optional custom deserialization for loading state.
   * Useful for migrations or setting defaults.
   * Defaults to returning the state as-is.
   */
  loadState?: (state: unknown) => T;

  /**
   * Optional function to compute dynamic field size.
   * If provided, overrides width/height config.
   */
  getSize?: (context: FieldSizeContext<T>) => FieldSize;

  /** Width of the field preview on the block. Default: 51 */
  width?: number;

  /** Height of the field preview on the block. Default: 18 */
  height?: number;

  /** Padding around the field preview. Default: 2 */
  padding?: number;

  /**
   * Whether to render the default background rectangle.
   * Set to false if renderPreview handles the background.
   * Default: true
   */
  renderBackground?: boolean;

  /** Custom styles for the dropdown container. */
  dropdownStyle?: React.CSSProperties;

  /**
   * Optional wrapper component for the editor.
   * Useful for providing context providers.
   */
  EditorWrapper?: React.ComponentType<{children: React.ReactNode}>;

  /**
   * Optional callback when the dropdown is disposed.
   * Useful for cleanup (e.g., canceling audio previews).
   */
  onDisposeDropdown?: () => void;
}

/**
 * Creates a Blockly field plugin backed by a React component.
 *
 * @param config - Configuration for the field
 * @returns A FieldPlugin that can be registered with Blockly
 */
export function createReactField<T>(config: ReactFieldConfig<T>): FieldPlugin {
  const {
    name,
    defaultValue,
    Editor,
    renderPreview,
    getText: getTextFn,
    saveState: saveStateFn,
    loadState: loadStateFn,
    getSize: getSizeFn,
    width: fieldWidth = 51,
    height: fieldHeight = 18,
    padding: fieldPadding = 2,
    renderBackground = true,
    dropdownStyle,
    EditorWrapper,
    onDisposeDropdown,
  } = config;

  /**
   * The generated Blockly Field class.
   */
  class ReactField extends Blockly.Field<T> {
    private root: Root | null = null;
    private dropdownDiv: HTMLDivElement | null = null;
    private backgroundElement: SVGGElement | null = null;
    private currentWidth: number = fieldWidth;
    private currentHeight: number = fieldHeight;

    static fromJson(options: Blockly.FieldConfig & {currentValue?: T}) {
      return new ReactField(options.currentValue ?? defaultValue);
    }

    constructor(value: T = defaultValue) {
      super(value);
      this.SERIALIZABLE = true;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Serialization
    // ─────────────────────────────────────────────────────────────────────────

    saveState(): unknown {
      const value = this.getValue();
      return saveStateFn ? saveStateFn(value as T) : value;
    }

    loadState(state: unknown): void {
      const value = loadStateFn ? loadStateFn(state) : (state as T);
      this.setValue(value);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Display
    // ─────────────────────────────────────────────────────────────────────────

    getText(): string {
      if (getTextFn) {
        return getTextFn(this.getValue() as T);
      }
      return super.getText();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // View Initialization
    // ─────────────────────────────────────────────────────────────────────────

    initView(): void {
      this.createBorderRect_();
      this.createTextElement_();

      if (this.borderRect_) {
        this.borderRect_.classList.add('blocklyDropdownRect');
      }

      // Create SVG group for custom preview rendering
      if (renderPreview) {
        this.backgroundElement =
          Blockly.utils.dom.createSvgElement<SVGGElement>(
            'g',
            {transform: 'translate(1,1)'},
            this.fieldGroup_,
          );
      }

      this.updateSize_();
    }

    protected updateSize_(): void {
      // Calculate dynamic size if getSize is provided
      if (getSizeFn) {
        const size = getSizeFn({
          value: this.getValue() as T,
          constants: this.getConstants(),
          textElement: this.textElement_,
        });
        this.currentWidth = size.width;
        this.currentHeight = size.height;
      } else {
        this.currentWidth = fieldWidth;
        this.currentHeight = fieldHeight;
      }

      const width = this.currentWidth + 2 * fieldPadding;
      const height = this.currentHeight + 2 * fieldPadding;

      this.borderRect_?.setAttribute('width', String(width));
      this.borderRect_?.setAttribute('height', String(height));

      this.size_.width = width;
      this.size_.height = height;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Styling
    // ─────────────────────────────────────────────────────────────────────────

    applyColour(): void {
      const sourceBlock = this.sourceBlock_ as Blockly.BlockSvg | null;
      if (this.borderRect_ && sourceBlock) {
        this.borderRect_.setAttribute(
          'stroke',
          sourceBlock.style.colourTertiary,
        );
        this.borderRect_.setAttribute('fill', 'transparent');
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Rendering
    // ─────────────────────────────────────────────────────────────────────────

    protected render_(): void {
      // Recalculate size for dynamic sizing
      if (getSizeFn) {
        this.updateSize_();
      }

      // Render custom SVG preview if provided
      if (renderPreview && this.backgroundElement) {
        // Clear previous content
        this.backgroundElement.innerHTML = '';

        // Render default background if enabled
        if (renderBackground) {
          Blockly.utils.dom.createSvgElement(
            'rect',
            {
              fill: getCSSVariable('neutral-base-black') || '#000',
              x: 1,
              y: 1,
              width: this.currentWidth,
              height: this.currentHeight,
              rx: 3,
            },
            this.backgroundElement,
          );
        }

        // Call custom preview renderer
        renderPreview({
          value: this.getValue() as T,
          element: this.backgroundElement,
          width: this.currentWidth,
          height: this.currentHeight,
          sourceBlock: this.sourceBlock_ as Blockly.BlockSvg | null,
          constants: this.getConstants(),
        });
      }

      // Also update React content if dropdown is open
      this.renderReactContent();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Editor (Dropdown)
    // ─────────────────────────────────────────────────────────────────────────

    protected showEditor_(): void {
      super.showEditor_();

      // Create the dropdown container
      this.dropdownDiv = document.createElement('div');
      this.applyDropdownStyles();

      // Render React content
      this.renderReactContent();

      // Add to Blockly's dropdown
      Blockly.DropDownDiv.getContentDiv().appendChild(this.dropdownDiv);

      // Apply block colors to dropdown
      const sourceBlock = this.sourceBlock_ as Blockly.BlockSvg | null;
      if (sourceBlock) {
        Blockly.DropDownDiv.setColour(
          sourceBlock.style.colourPrimary,
          sourceBlock.style.colourTertiary,
        );
      }

      // Position and show the dropdown
      Blockly.DropDownDiv.showPositionedByField(
        this,
        this.disposeDropdown.bind(this),
      );
    }

    private applyDropdownStyles(): void {
      if (!this.dropdownDiv) return;

      const styles = {...defaultDropdownStyles, ...dropdownStyle};
      Object.assign(this.dropdownDiv.style, styles);
    }

    private renderReactContent(): void {
      if (!this.dropdownDiv) return;

      // Get theme from workspace
      const workspace = this.sourceBlock_?.workspace as
        | Blockly.WorkspaceSvg
        | undefined;
      const siteTheme = getWorkspaceTheme(workspace);

      // Create root if needed
      if (!this.root) {
        this.root = createRoot(this.dropdownDiv);
      }

      // Deep copy value to prevent direct mutation of Blockly's data
      const valueCopy = JSON.parse(JSON.stringify(this.getValue())) as T;

      const editorElement = (
        <Editor
          value={valueCopy}
          onChange={this.handleValueChange}
          onClose={this.handleClose}
          onRefresh={this.handleRefresh}
          field={this}
          sourceBlock={this.sourceBlock_ as Blockly.BlockSvg | null}
        />
      );

      const content = EditorWrapper ? (
        <EditorWrapper>{editorElement}</EditorWrapper>
      ) : (
        editorElement
      );

      this.root.render(<div data-theme={siteTheme}>{content}</div>);
    }

    private handleValueChange = (value: T): void => {
      this.setValue(value);
    };

    private handleClose = (): void => {
      this.disposeDropdown();
      Blockly.WidgetDiv.hide();
      Blockly.DropDownDiv.hideWithoutAnimation();
    };

    private handleRefresh = (): void => {
      // Force a re-render by clearing and recreating the React content
      if (this.root && this.dropdownDiv) {
        this.root.unmount();
        this.root = null;
        this.renderReactContent();
      }
    };

    private disposeDropdown(): void {
      onDisposeDropdown?.();
      this.root?.unmount();
      this.root = null;
      this.dropdownDiv = null;
    }
  }

  // Return the plugin definition
  return {
    type: PluginType.Field,
    name,
    field: ReactField,
  };
}

export default createReactField;
