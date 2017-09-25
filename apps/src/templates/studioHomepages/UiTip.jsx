import React, {PropTypes} from 'react';

const UiTip = React.createClass({
  propTypes: {
    index: PropTypes.number,
    position: PropTypes.object,
    text: PropTypes.string,
    arrowDirection: PropTypes.string,
    closeClicked: PropTypes.func.isRequired
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
