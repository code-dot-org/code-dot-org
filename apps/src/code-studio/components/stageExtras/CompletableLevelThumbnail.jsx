import React from 'react';

export default class CompletableLevelThumbnail extends React.Component {
  static propTypes = {
    children: React.PropTypes.element.isRequired,
    width: React.PropTypes.number,
  }

  render() {
    const scale = (this.props.width || 400) / 400;
    return (
      <div
        style={{
          display: 'inline-block',
          position: 'relative',
          transform: `scale(${scale})`,
          transformOrigin: '0 0',
        }}
      >
        {this.props.children}
        <div
          style={{
            width: 400,
            height: 400,
            backgroundColor: 'rgba(0, 255, 0, 0.3)',
            position: 'absolute',
            top: 0,
            left: 0,
            textAlign: 'center',
          }}
        >
          <i
            className="fa fa-check"
            style={{
              fontSize: 350,
              lineHeight: `400px`,
              color: '#fff',
              opacity: '0.8',
            }}
          />
        </div>
      </div>
    );
  }
}
