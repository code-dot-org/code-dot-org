import React from 'react';

import {
  SquareType,
  Direction,
  WallTypeMask,
  WallTypeShift,
} from '@cdo/apps/studio/constants';

import tileGuide from '../../../static/code_studio/tile-guide.png';

import CellEditor from './CellEditor';

const options = {
  empty: 0x0,
  start: 0x000010,
  goal: 0x000001,
  crate_1: 0x010000,
  crate_2: 0x100000,
  crate_3: 0x020000,
  canister: 0x120000,
  covered_crates_1a: 0x040000,
  covered_crates_1b: 0x140000,
  covered_crates_2a: 0x240000,
  covered_crates_2b: 0x250000,
  covered_crates_3a: 0x340000,
  covered_crates_3b: 0x350000,
};

const startDirections = {
  '-': Direction.NONE,
  East: Direction.EAST,
  West: Direction.WEST,
  North: Direction.NORTH,
  South: Direction.SOUTH,
};

export default class StarWarsGridCellEditor extends CellEditor {
  /**
   * @override
   */
  handleChange() {
    const zoom = this.zoom && this.zoom.checked;
    const direction = this.direction ? +this.direction.value : undefined;

    this.props.onUpdate({
      tileType: (zoom << WallTypeShift) | this.type.value,
      direction: direction,
    });
  }

  /**
   * @override
   */
  render() {
    const type = ~WallTypeMask & this.props.cell.tileType_;
    const zoom = WallTypeMask & this.props.cell.tileType_;

    return (
      <form className="span4 offset1">
        {
          // TODO: A11y279 (https://codedotorg.atlassian.net/browse/A11Y-279)
          // Verify or update this alt-text as necessary
        }
        <img src={tileGuide} alt="" />
        <header>
          <strong>
            Editing Cell ({this.props.row}, {this.props.col})
          </strong>
        </header>

        <label htmlFor="tileType">Tile Type (required):</label>
        <select
          ref={c => {
            this.type = c;
          }}
          name="tileType"
          value={type}
          onChange={this.handleChange}
        >
          {Object.entries(options).map(([name, value]) => (
            <option value={value} key={value}>
              {name}
            </option>
          ))}
        </select>
        {type > 0xffff && (
          <span>
            <label htmlFor="zoom">Double size:</label>
            <input
              ref={c => {
                this.zoom = c;
              }}
              name="zoom"
              type="checkbox"
              checked={zoom}
              onChange={this.handleChange}
            />
          </span>
        )}
        {type === SquareType.SPRITESTART && (
          <span>
            <label htmlFor="direction">Start direction:</label>
            <select
              ref={c => {
                this.direction = c;
              }}
              name="direction"
              value={this.props.cell.direction_}
              onChange={this.handleChange}
            >
              {Object.entries(startDirections).map(([name, value]) => (
                <option value={value} key={value}>
                  {name}
                </option>
              ))}
            </select>
          </span>
        )}
      </form>
    );
  }
}
