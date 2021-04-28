import React from 'react';

export default class SpriteUpload extends React.Component {
  state = {
    fileData: null,
    filePreviewURL: '',
    filename: '',
    category: '',
    uploadState: ''
  };

  handleSubmit = event => {
    event.preventDefault();

    return fetch(
      `/api/v1/animation-library/level_animations/${this.state.filename}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'image/png'
        },
        body: this.state.fileData
      }
    )
      .then(response => {
        this.setState({
          uploadState: response.ok
            ? 'Image Successfully Uploaded'
            : `Error(${response.status}: ${response.statusText})`
        });
      })
      .catch(err => {
        console.error(err);
      });
  };

  handleImageChange = event => {
    let file = event.target.files[0];
    this.setState({
      fileData: file,
      filename: file.name,
      filePreviewURL: URL.createObjectURL(file),
      uploadState: ''
    });
  };

  handleCategoryChange = event => {
    this.setState({
      category: event.target.value
    });
  };

  render() {
    return (
      <div>
        <h1>Sprite Upload</h1>
        <form onSubmit={this.handleSubmit}>
          <label>
            <h4>Sprite Category:</h4>
            <input
              type="text"
              value={this.state.category}
              onChange={this.handleCategoryChange}
            />
          </label>
          <label>
            <h4>Select Sprite to Add to Library:</h4>
            <input
              type="file"
              accept="image/png"
              ref="uploader"
              onChange={this.handleImageChange}
            />
          </label>
          <br />
          <label>
            <h4>Image Preview:</h4>
            <img src={this.state.filePreviewURL} />
          </label>
          <br />
          <button type="submit">Upload to Library</button>
          <p id="sprite-upload-error">{this.state.uploadState}</p>
        </form>
      </div>
    );
  }
}
