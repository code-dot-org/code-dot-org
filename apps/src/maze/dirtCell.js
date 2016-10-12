import Cell from './cell';

export default class DirtCell extends Cell {

  /**
   * @return {boolean}
   */
  isDirt() {
    return this.currentValue_ !== undefined;
  }
}

/**
 * Creates a new Cell from serialized JSON
 * @param {Object}
 * @return {Cell}
 */
DirtCell.deserialize = serialized => new DirtCell(
  serialized.tileType,
  serialized.value,
  serialized.range
);

/**
 * Creates a new Cell from a mapCell and an initialDirtCell. This
 * represents the old style of storing map data, and should not be used
 * for any new levels. Note that this style does not support new
 * features such as dynamic ranges or new cloud types. Only used for
 * backwards compatibility.
 * @param {String|Number} mapCell
 * @param {String|Number} initialDirtCell
 * @return {Cell}
 */
DirtCell.parseFromOldValues = (mapCell, initialDirtCell) => {
  mapCell = parseInt(mapCell);
  initialDirtCell = parseInt(initialDirtCell);

  let tileType, value;

  tileType = parseInt(mapCell);
  if (!isNaN(initialDirtCell) && initialDirtCell !== 0) {
    value = initialDirtCell;
  }

  return new DirtCell(tileType, value);
};
