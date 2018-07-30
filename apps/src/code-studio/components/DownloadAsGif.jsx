import React, {PropTypes} from 'react';

export default class DownloadAsGif extends React.Component {
  static propTypes = {
    getNextFrame: PropTypes.func.isRequired,
    framesToCapture: PropTypes.number,
    delayBetweenFrames: PropTypes.number,
  };

  state = {downloadState: 'notStarted', percent: 0};

  prepareGif = () => {
    this.setState({downloadState: 'capturing'});
    setTimeout(this.captureGif, 0);
  };

  captureGif = () => {
    const gif = window.createGifCapture();
    gif.on('finished', this.finishGif);

    const delay = this.props.delayBetweenFrames || 33;
    for (let i = this.props.framesToCapture || 100; i > 0; i--) {
      gif.addFrame(this.props.getNextFrame(), {copy: true, delay});
    }

    this.setState({downloadState: 'rendering'});
    setTimeout(() => gif.render(), 0);
  };

  finishGif = blob => {
    this.setState({downloadState: 'done'});

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'export.gif';
    link.click();

    console.log(link.href);
  };

  render() {
    return (
      <button
        disabled={this.state.downloadState !== 'notStarted'}
        onClick={this.prepareGif}
      >
        {this.state.downloadState}
      </button>
    );
  }
}
