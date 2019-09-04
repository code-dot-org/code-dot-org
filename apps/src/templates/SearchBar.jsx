/** Generic search bar */
import PropTypes from 'prop-types';
import React from 'react';
import color from '@cdo/apps/util/color';

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
  searchArea: {
    position: 'relative'
  }
};

export default class AnimationPickerSearchBar extends React.Component {
  static propTypes = {
    placeholderText: PropTypes.string.isRequired,
    styles: PropTypes.object.shape({
      searchArea: PropTypes.object,
      icon: PropTypes.object,
      input: PropTypes.object
    }),
    onChange: PropTypes.func.isRequired
  };

  componentDidMount() {
    this.searchBox.focus();
  }

  render() {
    return (
      <div style={{...styles.searchArea, ...this.props.styles.searchArea}}>
        <span
          className="fa fa-search"
          style={{...styles.icon, ...this.props.styles.icon}}
        />
        <input
          style={{...styles.input, ...this.props.styles.input}}
          placeholder={this.props.placeholderText}
          onChange={this.props.onChange}
          ref={input => {
            this.searchBox = input;
          }}
        />
      </div>
    );
  }
}
