import React from "react";
import $ from "jquery";
import "jquery-ui/ui/widgets/draggable";
import PropTypes from 'prop-types';

module.exports = class MultiUpload extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    addTrainingExample: PropTypes.func
  }

  onUpload() {
    console.log("hi");
    var files = document.getElementById(this.props.className + "file").files;
    for (var i = 0; i < files.length; ++i) {
      var file = files[i];
      if (!file) return;
      var url = URL.createObjectURL(file), // create an Object URL
        img = new Image(); // create a temp. image object

      var _this = this;
      img.onload = function() {
        _this.props.addTrainingExample(img);
      };

      img.src = url; // start convertion file
    }
  }

  render() {
    return (
      <div>
        {"Upload your own " + this.props.className + ":"}
        <input
          type="file"
          id={this.props.className + "file"}
          onChange={e => this.onUpload()}
          multiple
        />
      </div>
    );
  }
};
