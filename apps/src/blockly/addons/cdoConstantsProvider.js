import GoogleBlockly from 'blockly/core';
import {inputBlockTypes, outputBlockStyleTypes} from './cdoConstants';

export default class CdoConstantsProvider extends GoogleBlockly.geras
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
    const inputTypeShapeMap = {
      [inputBlockTypes.SPRITE]: this.TRI_INPUT_OUTPUT,
      [inputBlockTypes.BEHAVIOR]: this.ROUND_INPUT_OUTPUT,
      [inputBlockTypes.LOCATION]: this.RECT_INPUT_OUTPUT
    };
    const outputStyleShapeMap = {
      [outputBlockStyleTypes.SPRITE_TYPE]: this.TRI_INPUT_OUTPUT,
      [outputBlockStyleTypes.BEHAVIOR_TYPE]: this.ROUND_INPUT_OUTPUT,
      [outputBlockStyleTypes.LOCATION_TYPE]: this.RECT_INPUT_OUTPUT
    };
    const blockStyleName = connection.getSourceBlock().styleName_;
    const inputType = connection.check_ ? connection.check_[0] : null;
    switch (connection.type) {
      case GoogleBlockly.ConnectionType.INPUT_VALUE:
        return inputTypeShapeMap[inputType] || this.PUZZLE_TAB;
      case GoogleBlockly.ConnectionType.OUTPUT_VALUE:
        return outputStyleShapeMap[blockStyleName] || this.PUZZLE_TAB;
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

    // NOTE: `curve` function below rewrites `svgPaths.curve` from mainline Blockly
    // https://github.com/google/blockly/blob/69afe5b60fe43b5ed911db91ae62058d66ffe5ec/core/utils/svg_paths.ts#L38
    // This function will be removed once `svgPaths.curve` is fixed.
    // Added .join(','), space after 'c', and there should be no comma
    // between x and y
    /**
     * Draw a cubic or quadratic curve.  See
     * developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d#Cubic_B%C3%A9zier_Curve
     * These coordinates are unitless and hence in the user coordinate system.
     *
     * @param command The command to use.
     *     Should be one of: c, C, s, S, q, Q.
     * @param points  An array containing all of the points to pass to the curve
     *     command, in order.  The points are represented as strings of the format
     *     'x y'.
     * @returns A string defining one or more Bezier curves.  See the MDN
     *     documentation for exact format.
     */
    function curve(command, points) {
      return ' ' + command + ' ' + points.join(',');
    }

    /**
     * Since input and output connections share the same shape you can
     * define a function to generate the path for both.
     */
    function makeMainPath(up) {
      const path = curve('c ', [
        -width * 1.5 + ' 0',
        -width * 1.5 + ' ' + -1 * up * height,
        '0 ' + -1 * up * height
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
