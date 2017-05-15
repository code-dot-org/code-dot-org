import React from 'react';

const options = {
  empty: 0x0,
  start: 0x0000010,
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

export default class StarWarsGridCellEditor extends React.Component {
  static propTypes = {
    cell: React.PropTypes.object.isRequired,
    row: React.PropTypes.number.isRequired,
    col: React.PropTypes.number.isRequired,
    onUpdate: React.PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.props.onUpdate({tileType: event.target.value});
  }

  render() {
    const initialValue = 0xFF0000 & this.props.cell.tileType_;

    return (
      <form className="span4 offset1">
        <header>
          <strong>Editing Cell ({this.props.row}, {this.props.col})</strong>
        </header>

        <label htmlFor="tileType">Tile Type (required):</label>
        <select name="tileType" value={initialValue} onChange={this.handleChange}>
          {Object.entries(options).map(([name, value]) => (
            <option value={value} key={value}>{name}</option>
          ))}
        </select>
      </form>
    );
  }
}
