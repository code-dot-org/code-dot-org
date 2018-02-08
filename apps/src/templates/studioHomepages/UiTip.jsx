import React, {PropTypes} from 'react';

export default class UiTip extends React.Component {
  static propTypes = {
    index: PropTypes.number,
    position: PropTypes.object,
    text: PropTypes.string,
    arrowDirection: PropTypes.string,
    closeClicked: PropTypes.func.isRequired
  };

  closeClicked = () => {
    this.props.closeClicked(this.props.index);
  };

  render() {
    const { position, text, arrowDirection } = this.props;
    return (
      <div>
        <div
          className={`arrow_box_${arrowDirection}`}
          onClick={this.closeClicked}
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
}
