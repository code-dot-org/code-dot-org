import GoogleBlockly, {Connection} from 'blockly/core';
import {customConnectionBlockTypes} from './cdoConstants';
import {PuzzleTab} from 'blockly/core/renderers/common/constants';

export default class CdoConstantsProvider extends GoogleBlockly.blockRendering
  .ConstantProvider {
  private RECT_INPUT_OUTPUT: PuzzleTab | undefined;
  private TRI_INPUT_OUTPUT: PuzzleTab | undefined;
  private ROUND_INPUT_OUTPUT: PuzzleTab | undefined;

  // Blockly enforces a 'type' property on the shape object.
  // This can be any number. Blockly currently uses 1 and 2, so we'll use 10, 11, 12.
  private CUSTOM_SHAPE_TYPE = {
    RECT_INPUT_OUTPUT: 10,
    TRI_INPUT_OUTPUT: 11,
    ROUND_INPUT_OUTPUT: 12,
  };

  /**
   * Get an object with connection shape and sizing information based on the
   * type of the connection.
   *
   * @param connection The connection to find a shape object for
   * @returns The shape object for the connection.
   * @override
   */
  shapeFor(connection: Connection) {
    const blockTypeShapeMap = {
      [customConnectionBlockTypes.SPRITE]: this.TRI_INPUT_OUTPUT,
      [customConnectionBlockTypes.BEHAVIOR]: this.ROUND_INPUT_OUTPUT,
      [customConnectionBlockTypes.LOCATION]: this.RECT_INPUT_OUTPUT,
    };
    // `connection.check` returns a list of accepted value types for the connection
    // or null if all types are compatible.
    // For connections that are customized (sprite, behavior, location), there is
    // one value type that is accepted so we assign connectorType to the first
    // element in the list.
    const connectionCheck = connection.getCheck();
    const connectorType = connectionCheck ? connectionCheck[0] : null;
    switch (connection.type) {
      case GoogleBlockly.ConnectionType.INPUT_VALUE:
      case GoogleBlockly.ConnectionType.OUTPUT_VALUE:
        // PUZZLE_TAB is the default shape for the connector if the value type is not
        // included in `blockTypeShapeMap`
        return (
          (connectorType && blockTypeShapeMap[connectorType]) || this.PUZZLE_TAB
        );
      case GoogleBlockly.ConnectionType.PREVIOUS_STATEMENT:
      case GoogleBlockly.ConnectionType.NEXT_STATEMENT:
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
      return GoogleBlockly.utils.svgPaths.line([
        GoogleBlockly.utils.svgPaths.point(-width, (-1 * up * height) / 2),
        GoogleBlockly.utils.svgPaths.point(width, (-1 * up * height) / 2),
      ]);
    }

    const pathUp = makeMainPath(1);
    const pathDown = makeMainPath(-1);

    return {
      type: this.CUSTOM_SHAPE_TYPE.TRI_INPUT_OUTPUT,
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
      return GoogleBlockly.utils.svgPaths.line([
        GoogleBlockly.utils.svgPaths.point(-width, 0),
        GoogleBlockly.utils.svgPaths.point(0, -1 * up * height),
        GoogleBlockly.utils.svgPaths.point(width, 0),
      ]);
    }

    const pathUp = makeMainPath(1);
    const pathDown = makeMainPath(-1);

    return {
      type: this.CUSTOM_SHAPE_TYPE.RECT_INPUT_OUTPUT,
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
      const path = GoogleBlockly.utils.svgPaths.curve('c', [
        -width * 1.5 + ', 0 ',
        -width * 1.5 + ', ' + -1 * up * height + ' ',
        '0, ' + -1 * up * height + ' ',
      ]);
      return path;
    }

    const pathUp = makeMainPath(1);
    const pathDown = makeMainPath(-1);

    return {
      type: this.CUSTOM_SHAPE_TYPE.ROUND_INPUT_OUTPUT,
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
}
