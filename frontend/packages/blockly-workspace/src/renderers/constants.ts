import * as Blockly from 'blockly/core';

import type {InputPlugin} from '../plugins';
import {isDarkTheme} from '../themes';

type PuzzleTab = Blockly.blockRendering.PuzzleTab;
type Shape = Blockly.blockRendering.BaseShape | Blockly.blockRendering.DynamicShape;

class CdoConstantsProvider extends Blockly.blockRendering
  .ConstantProvider {
  private __shapeMap: {
    [key: string]: PuzzleTab;
  };

  constructor(inputs: InputPlugin[]) {
    super();
    this.__shapeMap = {};

    // Go through input plugins for different notch shapes
    let shapeIndex = Math.max(...Object.values(this.SHAPES)) + 1;
    for (const plugin of inputs) {
      const currentShapeIndex = this.SHAPES[plugin.shape] || shapeIndex;
      if (!this.SHAPES[plugin.shape]) {
        this.SHAPES[plugin.shape] = shapeIndex;
        shapeIndex++;
      }

      this.__shapeMap[plugin.check] =
        plugin.makePath.bind(this)(currentShapeIndex);
    }
  }

  private isDarkTheme: boolean | undefined;

  setTheme(theme: Blockly.Theme) {
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
  shapeFor(connection: Blockly.RenderedConnection): Shape {
    // `connection.check` returns a list of accepted value types for the connection
    // or null if all types are compatible.
    // For connections that are customized (sprite, behavior, location), there is
    // one value type that is accepted so we assign connectorType to the first
    // element in the list.
    const connectionCheck = connection.getCheck();
    const connectorType = connectionCheck ? connectionCheck[0] : null;
    switch (connection.type) {
      case Blockly.ConnectionType.INPUT_VALUE:
      case Blockly.ConnectionType.OUTPUT_VALUE:
        // PUZZLE_TAB is the default shape for the connector if the value type is not
        // included in `blockTypeShapeMap`
        return (
          (connectorType && this.__shapeMap[connectorType]) ||
          super.shapeFor(connection)
        );
      case Blockly.ConnectionType.PREVIOUS_STATEMENT:
      case Blockly.ConnectionType.NEXT_STATEMENT:
        return super.shapeFor(connection);
      default:
        throw Error('Unknown connection type');
    }
  }

  protected generateSecondaryColour_(inputColour: string): string {
    if (this.isDarkTheme) {
      return (
        Blockly.utils.colour.blend('#000', inputColour, 0.4) || inputColour
      );
    }
    return super.generateSecondaryColour_(inputColour);
  }
}

export default CdoConstantsProvider;
