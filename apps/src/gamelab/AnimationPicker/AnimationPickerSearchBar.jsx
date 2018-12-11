/** Animation picker dialog search bar */
import React, {PropTypes} from 'react';
import color from '../../util/color';

const BORDER_WIDTH = 1;
const BORDER_COLOR = color.light_gray;
const BORDER_RADIUS = 6;
const INPUT_HORIZONTAL_PADDING = BORDER_RADIUS;

// We have side-by-side elements that should format sort of like one element
const styles = {
  input: {
    height: 28,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: INPUT_HORIZONTAL_PADDING,
    paddingRight: INPUT_HORIZONTAL_PADDING,
    width: '100%',
    marginLeft: 0,
    marginRight: 0,
    borderStyle: 'solid',
    borderWidth: BORDER_WIDTH,
    borderColor: BORDER_COLOR,
    borderRadius: BORDER_RADIUS,
    marginBottom: 10,
    textIndent: 22
  },
  icon: {
    position: 'absolute',
    top: 9,
    left: 10
  },
  search: {
    position: 'relative'
  }
};

export default class AnimationPickerSearchBar extends React.Component {
  static propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
  };

  onChange = (evt) => this.props.onChange(evt.target.value);

  componentDidMount() {
    this.searchBox.focus();
  }

  render() {
    return (
      <div style={styles.search}>
        <span className="fa fa-search" style={styles.icon}></span>
        <input
          style={styles.input}
          placeholder="Search for images"
          value={this.props.value}
          onChange={this.onChange}
          ref={(input) => { this.searchBox = input; }}
        />
      </div>
    );
  }
}
