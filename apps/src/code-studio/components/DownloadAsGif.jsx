import React, {PropTypes} from 'react';
import throttle from 'lodash/debounce';

const State = {
  initial: 'Download as .gif',
  capturing: 'Capturing...',
  rendering: 'Rendering...',
  done: 'Finished!',
};

export default class DownloadAsGif extends React.Component {
  static propTypes = {
    getNextFrame: PropTypes.func.isRequired,
    framesToCapture: PropTypes.number,
    delayBetweenFrames: PropTypes.number,
    styles: PropTypes.object,
  };

  state = {statusMessage: State.initial, percent: 0};

  prepareGif = () => {
    this.setState({statusMessage: State.capturing});
    setTimeout(this.captureGif, 0);
  };

  captureGif = () => {
    const gif = window.createGifCapture();
    gif.on('progress', this.handleProgress);
    gif.on('finished', this.finishGif);

    const delay = this.props.delayBetweenFrames || 33;
    for (let i = this.props.framesToCapture || 100; i > 0; i--) {
      gif.addFrame(this.props.getNextFrame(), {copy: true, delay});
    }

    this.setState({statusMessage: State.rendering});
    setTimeout(() => gif.render(), 0);
  };

  finishGif = blob => {
    this.handleProgress.cancel();
    this.setState({statusMessage: State.done});

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'export.gif';
    link.click();
  };

  handleProgress = throttle(percent => {
    this.setState({statusMessage: `${State.rendering} ${Math.round(percent * 100)}%`});
  }, 100);

  render() {
    const disabled = this.state.statusMessage !== State.initial;
    return (
      <button
        style={disabled ? this.props.styles.buttonDisabled : this.props.styles.button}
        disabled={disabled}
        onClick={this.prepareGif}
      >
        {this.state.statusMessage}
      </button>
    );
  }
}
