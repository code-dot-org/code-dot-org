import * as BlocklyLibrary from 'blockly/core';

type PuzzleTab = BlocklyLibrary.blockRendering.PuzzleTab;

export const DARK_THEME_SUFFIX = 'dark';
export function isDarkTheme(theme: BlocklyLibrary.Theme | undefined): boolean {
  return !!theme?.name.includes(DARK_THEME_SUFFIX);
}

export default class CdoConstantsProvider extends BlocklyLibrary.blockRendering
  .ConstantProvider {
  private RECT_INPUT_OUTPUT: PuzzleTab | undefined;
  private TRI_INPUT_OUTPUT: PuzzleTab | undefined;
  private ROUND_INPUT_OUTPUT: PuzzleTab | undefined;
  private isDarkTheme: boolean | undefined;

  // Override the shapes constant to include the custom shapes.
  override SHAPES = {
    PUZZLE: 1,
    NOTCH: 2,
    RECTANGLE: 3,
    TRIANGLE: 4,
    ROUND: 5,
  };

  setTheme(theme: BlocklyLibrary.Theme) {
    super.setTheme(theme);
    this.isDarkTheme = isDarkTheme(theme);
  }

  /**
   * Get an object with connection shape and sizing information based on the
   * type of the connection.
   *
   * @param connection The connection to find a shape object for
   * @returns The shape object for the connection.
   * @override
   */
  shapeFor(connection: BlocklyLibrary.Connection) {
    const blockTypeShapeMap: {
      [key: string]: PuzzleTab;
    } = {
      // TODO: USE THE PROVIDER TO ADD BLOCK TYPES
    };
    // `connection.check` returns a list of accepted value types for the connection
    // or null if all types are compatible.
    // For connections that are customized (sprite, behavior, location), there is
    // one value type that is accepted so we assign connectorType to the first
    // element in the list.
    const connectionCheck = connection.getCheck();
    const connectorType = connectionCheck ? connectionCheck[0] : null;
    switch (connection.type) {
      case BlocklyLibrary.ConnectionType.INPUT_VALUE:
      case BlocklyLibrary.ConnectionType.OUTPUT_VALUE:
        // PUZZLE_TAB is the default shape for the connector if the value type is not
        // included in `blockTypeShapeMap`
        return (
          (connectorType && blockTypeShapeMap[connectorType]) || this.PUZZLE_TAB
        );
      case BlocklyLibrary.ConnectionType.PREVIOUS_STATEMENT:
      case BlocklyLibrary.ConnectionType.NEXT_STATEMENT:
        return this.NOTCH;
      default:
        throw Error('Unknown connection type');
    }
  }

  makeTriangularInputConn() {
    const width = this.TAB_WIDTH;
    const height = this.TAB_HEIGHT;

    /**
     * Since input and output connections share the same shape you can
     * define a function to generate the path for both.
     */
    function makeMainPath(up: number) {
      return BlocklyLibrary.utils.svgPaths.line([
        BlocklyLibrary.utils.svgPaths.point(-width, (-1 * up * height) / 2),
        BlocklyLibrary.utils.svgPaths.point(width, (-1 * up * height) / 2),
      ]);
    }

    const pathUp = makeMainPath(1);
    const pathDown = makeMainPath(-1);

    return {
      type: this.SHAPES.TRIANGLE,
      width: width,
      height: height,
      pathDown: pathDown,
      pathUp: pathUp,
    };
  }

  makeRectangularInputConn() {
    const width = this.TAB_WIDTH;
    const height = this.TAB_HEIGHT;

    /**
     * Since input and output connections share the same shape you can
     * define a function to generate the path for both.
     */
    function makeMainPath(up: number) {
      return BlocklyLibrary.utils.svgPaths.line([
        BlocklyLibrary.utils.svgPaths.point(-width, 0),
        BlocklyLibrary.utils.svgPaths.point(0, -1 * up * height),
        BlocklyLibrary.utils.svgPaths.point(width, 0),
      ]);
    }

    const pathUp = makeMainPath(1);
    const pathDown = makeMainPath(-1);

    return {
      type: this.SHAPES.RECTANGLE,
      width: width,
      height: height,
      pathDown: pathDown,
      pathUp: pathUp,
    };
  }

  makeRoundInputConn() {
    const width = this.TAB_WIDTH;
    const height = this.TAB_HEIGHT;
    function makeMainPath(up: number) {
      // Definition of curve function at https://github.com/google/blockly/blob/2bbb3aa1fcc1cc2df1a75bfbdefa42ab56182872/core/utils/svg_paths.ts#L26-L40
      const path = BlocklyLibrary.utils.svgPaths.curve('c', [
        -width * 1.5 + ', 0 ',
        -width * 1.5 + ', ' + -1 * up * height + ' ',
        '0, ' + -1 * up * height + ' ',
      ]);
      return path;
    }

    const pathUp = makeMainPath(1);
    const pathDown = makeMainPath(-1);

    return {
      type: this.SHAPES.ROUND,
      width: width,
      height: height,
      pathDown: pathDown,
      pathUp: pathUp,
    };
  }

  init() {
    super.init();
    this.RECT_INPUT_OUTPUT = this.makeRectangularInputConn();
    this.TRI_INPUT_OUTPUT = this.makeTriangularInputConn();
    this.ROUND_INPUT_OUTPUT = this.makeRoundInputConn();
  }

  protected generateSecondaryColour_(inputColour: string): string {
    if (this.isDarkTheme) {
      return (
        BlocklyLibrary.utils.colour.blend('#000', inputColour, 0.4) ||
        inputColour
      );
    }
    return super.generateSecondaryColour_(inputColour);
  }
}
