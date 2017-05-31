import React from 'react';

const UiTip = React.createClass({
  propTypes: {
    index: React.PropTypes.number,
    position: React.PropTypes.object,
    text: React.PropTypes.string,
    arrowDirection: React.PropTypes.string,
    closeClicked: React.PropTypes.func.isRequired
  },

  closeClicked(index) {
    this.props.closeClicked(index);
  },

  render() {
    const { index, position, text, arrowDirection } = this.props;
    return (
      <div>
        <div
          className={`arrow_box_${arrowDirection}`}
          onClick={this.closeClicked.bind(this, index)}
          style={position}
        >
          <div style={{textAlign: "right"}}>
            <i className="fa fa-times"/>
          </div>
          <div>
            {text}
          </div>
        </div>
      </div>
    );
  }
});

export default UiTip;
