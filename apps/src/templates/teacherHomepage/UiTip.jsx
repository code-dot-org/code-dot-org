import React from 'react';

const UiTip = React.createClass({
  propTypes: {
    index: React.PropTypes.number,
    position: React.Proptypes.object,
    text: React.PropTypes.string,
    closeClicked: React.PropTypes.func.isRequired
  },

  closeClicked(index) {
    this.props.closeClicked(index);
  },

  render() {
    const { index, position, text } = this.props;

    return (
      <div
        className="arrow_box_up"
        onClick={this.closeClicked.bind(this, index)}
        style={position}
      >
        {text}
      </div>
    );
  }
});

export default UiTip;
