import React from 'react';

export default class CompletableLevelThumbnail extends React.Component {
  static propTypes = {
    children: React.PropTypes.element.isRequired,
    scale: React.PropTypes.number,
  }

  render() {
    return (
      <div
        style={{
          display: 'inline-block',
          position: 'relative',
        }}
      >
        {React.cloneElement(this.props.children, {scale: this.props.scale})}
        <div style={{
          width: 400 * this.props.scale,
          height: 400 * this.props.scale,
          backgroundColor: 'rgba(0, 255, 0, 0.3)',
          position: 'absolute',
          top: 0,
          left: 0,
          textAlign: 'center',
        }}>
          <i className="fa fa-check" style={{
            fontSize: 350 * this.props.scale,
            lineHeight: `${400 * this.props.scale}px`,
            color: '#fff',
            opacity: '0.8',
          }}/>
        </div>
      </div>
    );
  }
}
