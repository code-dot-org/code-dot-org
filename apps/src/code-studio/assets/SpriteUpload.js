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
            Select Sprite to Add to Library:
            <br />
            <input type="file" ref="uploader" onChange={this.handleChange} />
          </label>
          <br />
          <label>
            Image Preview:
            <img src={this.state.file} />
          </label>
          <br />
          <button type="submit">Upload to Library</button>
        </form>
      </div>
    );
  }
}
