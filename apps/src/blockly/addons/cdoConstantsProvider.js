import GoogleBlockly from 'blockly/core';
import {blockTypes} from './cdoConstants';

export default class CdoConstantsProvider extends GoogleBlockly.blockRendering
  .ConstantProvider {
  /**
   * Get an object with connection shape and sizing information based on the
   * type of the connection.
   *
   * @param connection The connection to find a shape object for
   * @returns The shape object for the connection.
   * @override
   */
  shapeFor(connection) {
    const blockTypeShapeMap = {
      [blockTypes.SPRITE]: this.TRI_INPUT_OUTPUT,
      [blockTypes.BEHAVIOR]: this.ROUND_INPUT_OUTPUT,
      [blockTypes.LOCATION]: this.RECT_INPUT_OUTPUT
    };
    const connectorType = connection.check_ ? connection.check_[0] : null;
    switch (connection.type) {
      case GoogleBlockly.ConnectionType.INPUT_VALUE:
      case GoogleBlockly.ConnectionType.OUTPUT_VALUE:
        return blockTypeShapeMap[connectorType] || this.PUZZLE_TAB;
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
    function makeMainPath(up) {
      return Blockly.utils.svgPaths.line([
        Blockly.utils.svgPaths.point(-width, (-1 * up * height) / 2),
        Blockly.utils.svgPaths.point(width, (-1 * up * height) / 2)
      ]);
    }

    var pathUp = makeMainPath(1);
    var pathDown = makeMainPath(-1);

    return {
      width: width,
      height: height,
      pathDown: pathDown,
      pathUp: pathUp
    };
  }

  makeRectangularInputConn() {
    const width = this.TAB_WIDTH;
    const height = this.TAB_HEIGHT;

    /**
     * Since input and output connections share the same shape you can
     * define a function to generate the path for both.
     */
    function makeMainPath(up) {
      return Blockly.utils.svgPaths.line([
        Blockly.utils.svgPaths.point(-width, 0),
        Blockly.utils.svgPaths.point(0, -1 * up * height),
        Blockly.utils.svgPaths.point(width, 0)
      ]);
    }

    var pathUp = makeMainPath(1);
    var pathDown = makeMainPath(-1);

    return {
      width: width,
      height: height,
      pathDown: pathDown,
      pathUp: pathUp
    };
  }

  makeRoundInputConn() {
    const width = this.TAB_WIDTH;
    const height = this.TAB_HEIGHT;
    function makeMainPath(up) {
      const path = Blockly.utils.svgPaths.curve('c', [
        -width * 1.5 + ', 0 ',
        -width * 1.5 + ', ' + -1 * up * height + ' ',
        '0, ' + -1 * up * height + ' '
      ]);
      return path;
    }

    var pathUp = makeMainPath(1);
    var pathDown = makeMainPath(-1);

    return {
      width: width,
      height: height,
      pathDown: pathDown,
      pathUp: pathUp
    };
  }

  init() {
    super.init();
    this.RECT_INPUT_OUTPUT = this.makeRectangularInputConn();
    this.TRI_INPUT_OUTPUT = this.makeTriangularInputConn();
    this.ROUND_INPUT_OUTPUT = this.makeRoundInputConn();
  }
}
