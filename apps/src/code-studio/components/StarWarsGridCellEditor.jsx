import React from 'react';
import { WallTypeMask, WallTypeShift } from '@cdo/apps/studio/constants';
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

export default class StarWarsGridCellEditor extends CellEditor {
  /**
   * @override
   */
  handleChange() {
    const zoom = this.zoom && this.zoom.checked;
    this.props.onUpdate({
      tileType: zoom << WallTypeShift | this.type.value
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
        <img src={tileGuide} />
        <header>
          <strong>Editing Cell ({this.props.row}, {this.props.col})</strong>
        </header>

        <label htmlFor="tileType">Tile Type (required):</label>
        <select ref={c => { this.type = c; }} name="tileType" value={type} onChange={this.handleChange}>
          {Object.entries(options).map(([name, value]) => (
            <option value={value} key={value}>{name}</option>
          ))}
        </select>
        {type > 0xFFFF &&
          <span>
            <label htmlFor="zoom">Double size:</label>
            <input ref={c => { this.zoom = c; }} name="zoom" type="checkbox" checked={zoom} onChange={this.handleChange} />
          </span>
        }
      </form>
    );
  }
}
