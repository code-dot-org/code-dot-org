import React, {PropTypes} from "react";

module.exports = class SingleUpload extends React.Component {
  static propTypes = {
    predictClass: PropTypes.func
  };

  onUpload() {
    var file = document.getElementById("predictfile").files[0];
    if (!file) {
      return;
    }
    var url = URL.createObjectURL(file), // create an Object URL
      img = new Image(); // create a temp. image object

    var _this = this;
    img.onload = function () {
      _this.props.predictClass(img);
    };

    img.src = url; // start convertion file
  }

  render() {
    return (
      <div>
        Upload your own:
        <input type="file" id="predictfile" onChange={e => this.onUpload()} />
      </div>
    );
  }
};
