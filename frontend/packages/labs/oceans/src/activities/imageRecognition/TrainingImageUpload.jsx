import React, {PropTypes} from 'react';

module.exports = class MultiUpload extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    addTrainingExample: PropTypes.func
  };

  onUpload() {
    var files = document.getElementById(this.props.className + 'file').files;
    for (var i = 0; i < files.length; ++i) {
      var file = files[i];
      if (!file) {
        return;
      }
      var url = URL.createObjectURL(file), // create an Object URL
        img = new Image(); // create a temp. image object
      var _this = this;
      img.onload = function() {
        // The height and width doesn't always load so set them if they're 0
        if (!img.width) {
          img.width = 500;
        }
        if (!img.height) {
          img.height = 500;
        }
        _this.props.addTrainingExample(img);
        URL.revokeObjectURL(url);
      };

      img.src = url; // start convertion file
    }
  }

  render() {
    return (
      <div>
        {'Upload your own ' + this.props.className + ':'}
        <input
          type="file"
          id={this.props.className + 'file'}
          onChange={e => this.onUpload()}
          multiple
        />
      </div>
    );
  }
};
