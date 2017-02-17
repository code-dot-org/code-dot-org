import CodeMirror from 'codemirror';
import React, {PropTypes} from 'react';

/**
 * This component works in conjunction with a json codemirror
 * editor instance to render a select dropdown which allows you
 * to choose from a list of blocks which can be added to the editor.
 */
const DropletPaletteSelector = React.createClass({
  propTypes: {
    editor: PropTypes.instanceOf(CodeMirror).isRequired,
    palette: PropTypes.object.isRequired,
  },

  componentDidMount() {
    this.props.editor.on('change', () => {
      this.setState({
        currentPalette: this.props.editor.getValue(),
      });
    });
  },

  getInitialState() {
    return {
      currentPalette: this.props.editor.getValue(),
    };
  },

  selectBlock(event) {
    const blockName = event.target.value;
    if (!blockName) {
      return;
    }
    let currentBlocks;
    try {
      currentBlocks = this.getCurrentPaletteBlocks();
    } catch (e) {
      return;
    }
    currentBlocks[blockName] = this.props.palette[blockName];
    this.props.editor.setValue(JSON.stringify(currentBlocks, null, 2));
  },

  getCurrentPaletteBlocks() {
    if (this.state.currentPalette.trim()) {
      return JSON.parse(this.state.currentPalette);
    } else {
      return {};
    }
  },

  render() {
    let blocks = [];
    let error = null;
    try {
      let currentBlocks = this.getCurrentPaletteBlocks();
      blocks = Object.keys(this.props.palette).filter(b => currentBlocks[b] === undefined);
    } catch (e) {
      error = true;
    }
    const label = (
      error ? "Fix JSON syntax to see available blocks" :
      blocks.length === 0 ? "All blocks have been added" :
      "Add block"
    );
    return (
      <select disabled={error || blocks.length === 0} onChange={this.selectBlock}>
        <option>{label}</option>
        {blocks.map(blockName => (
           <option key={blockName} value={blockName}>{blockName}</option>
        ))}
      </select>
    );
  }
});

export default DropletPaletteSelector;
