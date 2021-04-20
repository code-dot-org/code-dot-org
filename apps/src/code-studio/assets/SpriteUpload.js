import React from 'react';

export default class SpriteUpload extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null
    };
  }

  handleSubmit(event) {}

  handleChange = event => {
    this.setState({
      file: URL.createObjectURL(event.target.files[0])
    });
  };

  render() {
    return (
      <div>
        <h1>Sprite Upload</h1>
        <form onSubmit={this.handleSubmit}>
          <label>
            <h4> Sprite Category: </h4>
            <input type="text" />
          </label>
          <label>
            <h4> Select Sprite to Add to Library: </h4>
            <input
              type="file"
              accept="image/png"
              ref="uploader"
              onChange={this.handleChange}
            />
          </label>
          <br />
          <label>
            <h4> Image Preview: </h4>
            <img src={this.state.file} />
          </label>
          <br />
          <button type="submit">Upload to Library</button>
        </form>
      </div>
    );
  }
}
